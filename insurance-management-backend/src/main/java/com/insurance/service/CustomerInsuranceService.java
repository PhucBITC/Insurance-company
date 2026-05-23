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

    private final Random random = new Random();

    public CustomerInsuranceResponseDto registerPackage(Long customerUserId, CustomerInsuranceRequestDto request) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng cho tài khoản hiện tại!"));

        InsurancePackage insurancePackage = insurancePackageRepository.findById(request.getInsurancePackageId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Gói bảo hiểm không tồn tại!"));

        if (!"ACTIVE".equals(insurancePackage.getStatus())) {
            throw new RuntimeException("Lỗi: Gói bảo hiểm hiện tại không ở trạng thái hoạt động!");
        }

        // Kiểm tra hồ sơ đầy đủ thông tin trước khi đăng ký bảo hiểm
        if (customer.getFullName() == null || customer.getFullName().trim().isEmpty() || "Khách Hàng Mới".equals(customer.getFullName().trim()) ||
            customer.getPhoneNumber() == null || customer.getPhoneNumber().trim().isEmpty() ||
            customer.getAddress() == null || customer.getAddress().trim().isEmpty() ||
            customer.getDateOfBirth() == null ||
            customer.getGender() == null || customer.getGender().trim().isEmpty() ||
            customer.getIdentityCard() == null || customer.getIdentityCard().trim().isEmpty()) {
            throw new RuntimeException("Lỗi: Vui lòng cập nhật đầy đủ thông tin cá nhân (Họ tên, SĐT, Địa chỉ, Ngày sinh, Giới tính, CMND/CCCD) tại Trang cá nhân trước khi đăng ký mua gói bảo hiểm!");
        }

        CustomerInsurance customerInsurance = new CustomerInsurance();
        customerInsurance.setCustomer(customer);
        customerInsurance.setInsurancePackage(insurancePackage);
        customerInsurance.setPrice(insurancePackage.getPrice());
        customerInsurance.setStatus("PENDING");

        CustomerInsurance saved = customerInsuranceRepository.save(customerInsurance);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CustomerInsuranceResponseDto> getMyInsurances(Long customerUserId) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng!"));

        return customerInsuranceRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
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
        return convertToDto(saved);
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
