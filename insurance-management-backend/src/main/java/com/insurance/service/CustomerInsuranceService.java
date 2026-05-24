package com.insurance.service;

import com.insurance.dto.CustomerInsuranceRequestDto;
import com.insurance.dto.CustomerInsuranceResponseDto;
import com.insurance.entity.Customer;
import com.insurance.entity.CustomerInsurance;
import com.insurance.entity.InsurancePackage;
import com.insurance.repository.CustomerInsuranceRepository;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.InsurancePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerInsuranceService {

    @Autowired
    private CustomerInsuranceRepository customerInsuranceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private InsurancePackageRepository insurancePackageRepository;

    @Autowired
    private NotificationService notificationService;

    private final Random random = new Random();

    public CustomerInsuranceResponseDto registerPackage(Long customerUserId, CustomerInsuranceRequestDto request) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng cho tài khoản hiện tại!"));

        InsurancePackage insurancePackage = insurancePackageRepository.findById(request.getInsurancePackageId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Gói bảo hiểm không tồn tại!"));

        if (!"ACTIVE".equals(insurancePackage.getStatus())) {
            throw new RuntimeException("Lỗi: Gói bảo hiểm hiện tại không ở trạng thái hoạt động!");
        }

        // Kiểm tra hồ sơ đầy đủ và hợp lệ trước khi đăng ký bảo hiểm
        if (customer.getFullName() == null || customer.getFullName().trim().isEmpty() || 
            customer.getFullName().trim().length() < 2 || 
            "Khách Hàng Mới".equals(customer.getFullName().trim()) ||
            customer.getPhoneNumber() == null || customer.getPhoneNumber().trim().isEmpty() ||
            !customer.getPhoneNumber().trim().matches("^(0[3|5|7|8|9])[0-9]{8}$") ||
            customer.getAddress() == null || customer.getAddress().trim().isEmpty() ||
            customer.getAddress().trim().length() < 5 ||
            customer.getDateOfBirth() == null ||
            customer.getDateOfBirth().isAfter(LocalDate.now()) ||
            customer.getGender() == null || customer.getGender().trim().isEmpty() ||
            customer.getIdentityCard() == null || customer.getIdentityCard().trim().isEmpty() ||
            !customer.getIdentityCard().trim().matches("^[0-9]{9}$|^[0-9]{12}$")) {
            throw new RuntimeException("Vui lòng cập nhật đầy đủ và chính xác thông tin cá nhân (Họ tên từ 2 ký tự và không dùng tên mặc định, SĐT 10 số Việt Nam, Địa chỉ từ 5 ký tự, Ngày sinh trong quá khứ, Giới tính, CMND/CCCD 9 hoặc 12 số) tại Trang cá nhân trước khi đăng ký mua gói bảo hiểm!");
        }

        // Kiểm tra đăng ký trùng lặp (chờ duyệt hoặc đang còn hiệu lực)
        if (customerInsuranceRepository.hasActiveOrPendingInsurance(customer.getId(), insurancePackage.getId(), LocalDate.now())) {
            throw new RuntimeException("Bạn đã đăng ký mua gói bảo hiểm này và yêu cầu đang chờ duyệt hoặc hợp đồng đang hoạt động!");
        }

        CustomerInsurance customerInsurance = new CustomerInsurance();
        customerInsurance.setCustomer(customer);
        customerInsurance.setInsurancePackage(insurancePackage);
        customerInsurance.setPrice(insurancePackage.getPrice());
        customerInsurance.setStatus("PENDING");

        CustomerInsurance saved = customerInsuranceRepository.save(customerInsurance);
        notificationService.sendNotificationToAllAdmins(
            "Yêu cầu mua gói bảo hiểm mới",
            "Khách hàng " + customer.getFullName() + " đã đăng ký mua gói bảo hiểm: \"" + insurancePackage.getName() + "\"",
            "/admin/contracts"
        );
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CustomerInsuranceResponseDto> getMyInsurances(Long customerUserId) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng!"));

        return customerInsuranceRepository.findByCustomerIdAndDeletedByCustomerFalseOrderByCreatedAtDesc(customer.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CustomerInsuranceResponseDto> getAllInsurances() {
        return customerInsuranceRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CustomerInsuranceResponseDto approveInsurance(Long id) {
        CustomerInsurance customerInsurance = customerInsuranceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy yêu cầu đăng ký hợp đồng với ID: " + id));

        if (!"PENDING".equals(customerInsurance.getStatus())) {
            throw new RuntimeException("Lỗi: Chỉ phê duyệt được yêu cầu đang chờ xử lý (PENDING)!");
        }

        LocalDate today = LocalDate.now();
        String datePart = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String contractCode;
        do {
            String randomPart = String.format("%04d", random.nextInt(10000));
            contractCode = "HD-" + datePart + "-" + randomPart;
        } while (customerInsuranceRepository.existsByContractCode(contractCode));

        customerInsurance.setContractCode(contractCode);
        customerInsurance.setStartDate(today);
        
        Integer durationMonths = customerInsurance.getInsurancePackage().getDurationMonths();
        customerInsurance.setEndDate(today.plusMonths(durationMonths));
        customerInsurance.setStatus("APPROVED");
        customerInsurance.setRejectReason(null);

        CustomerInsurance saved = customerInsuranceRepository.save(customerInsurance);
        notificationService.sendNotification(
            saved.getCustomer().getUser(),
            "Hợp đồng bảo hiểm đã được duyệt",
            "Đăng ký mua gói bảo hiểm \"" + saved.getInsurancePackage().getName() + "\" của bạn đã được phê duyệt. Số hợp đồng: " + saved.getContractCode(),
            "/customer/my-insurances"
        );
        return convertToDto(saved);
    }

    public CustomerInsuranceResponseDto rejectInsurance(Long id, String rejectReason) {
        CustomerInsurance customerInsurance = customerInsuranceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy yêu cầu đăng ký hợp đồng với ID: " + id));

        if (!"PENDING".equals(customerInsurance.getStatus())) {
            throw new RuntimeException("Lỗi: Chỉ từ chối được yêu cầu đang chờ xử lý (PENDING)!");
        }

        if (rejectReason == null || rejectReason.trim().isEmpty()) {
            throw new RuntimeException("Lỗi: Vui lòng nhập lý do từ chối!");
        }

        customerInsurance.setStatus("REJECTED");
        customerInsurance.setRejectReason(rejectReason);
        customerInsurance.setStartDate(null);
        customerInsurance.setEndDate(null);
        customerInsurance.setContractCode(null);

        CustomerInsurance saved = customerInsuranceRepository.save(customerInsurance);
        notificationService.sendNotification(
            saved.getCustomer().getUser(),
            "Đăng ký bảo hiểm bị từ chối",
            "Đăng ký mua gói bảo hiểm \"" + saved.getInsurancePackage().getName() + "\" của bạn đã bị từ chối. Lý do: " + rejectReason,
            "/customer/my-insurances"
        );
        return convertToDto(saved);
    }

    public void deleteCustomerInsuranceByCustomer(Long customerUserId, Long insuranceId) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng!"));

        CustomerInsurance customerInsurance = customerInsuranceRepository.findById(insuranceId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy yêu cầu đăng ký hợp đồng!"));

        // Check if this contract belongs to the customer
        if (!customerInsurance.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Lỗi: Bạn không có quyền xóa yêu cầu đăng ký hợp đồng này!");
        }

        // Only allow deleting if status is PENDING or REJECTED
        if ("APPROVED".equals(customerInsurance.getStatus())) {
            throw new RuntimeException("Lỗi: Không thể tự xóa hoặc hủy hợp đồng bảo hiểm đã được phê duyệt và đang hoạt động!");
        }

        if ("PENDING".equals(customerInsurance.getStatus())) {
            customerInsuranceRepository.delete(customerInsurance);
        } else if ("REJECTED".equals(customerInsurance.getStatus())) {
            customerInsurance.setDeletedByCustomer(true);
            customerInsuranceRepository.save(customerInsurance);
        }
    }

    public void deleteCustomerInsuranceByAdmin(Long insuranceId) {
        CustomerInsurance customerInsurance = customerInsuranceRepository.findById(insuranceId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy yêu cầu đăng ký hợp đồng!"));

        customerInsuranceRepository.delete(customerInsurance);
    }

    private CustomerInsuranceResponseDto convertToDto(CustomerInsurance entity) {
        CustomerInsuranceResponseDto dto = new CustomerInsuranceResponseDto();
        dto.setId(entity.getId());
        dto.setCustomerId(entity.getCustomer().getId());
        dto.setCustomerName(entity.getCustomer().getFullName());
        dto.setCustomerCode(entity.getCustomer().getCustomerCode());
        dto.setInsurancePackageId(entity.getInsurancePackage().getId());
        dto.setInsurancePackageName(entity.getInsurancePackage().getName());
        dto.setInsurancePackageCode(entity.getInsurancePackage().getPackageCode());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setPrice(entity.getPrice());
        dto.setStatus(entity.getStatus());
        dto.setContractCode(entity.getContractCode());
        dto.setRejectReason(entity.getRejectReason());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
