package com.insurance.service;

import com.insurance.dto.CustomerAssignmentRequestDto;
import com.insurance.dto.CustomerAssignmentResponseDto;
import com.insurance.dto.CustomerResponseDto;
import com.insurance.entity.Customer;
import com.insurance.entity.CustomerAssignment;
import com.insurance.entity.Employee;
import com.insurance.repository.CustomerAssignmentRepository;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerAssignmentService {

    @Autowired
    private CustomerAssignmentRepository customerAssignmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private NotificationService notificationService;

    public CustomerAssignmentResponseDto assignCustomer(CustomerAssignmentRequestDto request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy nhân viên với ID: " + request.getEmployeeId()));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy khách hàng với ID: " + request.getCustomerId()));

        if (customerAssignmentRepository.existsByEmployeeIdAndCustomerId(employee.getId(), customer.getId())) {
            throw new RuntimeException("Lỗi: Khách hàng đã được phân công cho nhân viên này!");
        }

        CustomerAssignment assignment = new CustomerAssignment();
        assignment.setEmployee(employee);
        assignment.setCustomer(customer);

        CustomerAssignment saved = customerAssignmentRepository.save(assignment);

        // Gửi thông báo đến nhân viên
        notificationService.sendNotification(
            employee.getUser(),
            "Phân công khách hàng phụ trách",
            "Bạn được phân công hỗ trợ riêng cho khách hàng: " + customer.getFullName() + " (" + customer.getCustomerCode() + ")",
            "/employee/customers"
        );

        // Gửi thông báo đến khách hàng
        notificationService.sendNotification(
            customer.getUser(),
            "Tư vấn viên hỗ trợ riêng",
            "Nhân viên " + employee.getFullName() + " đã được chỉ định làm tư vấn viên phụ trách hỗ trợ riêng cho bạn.",
            "/customer/dashboard"
        );

        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CustomerAssignmentResponseDto> getAllAssignments() {
        return customerAssignmentRepository.findAllByOrderByAssignedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void removeAssignment(Long id) {
        if (!customerAssignmentRepository.existsById(id)) {
            throw new RuntimeException("Lỗi: Không tìm thấy phân công với ID: " + id);
        }
        customerAssignmentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponseDto> getMyCustomers(Long employeeUserId) {
        Employee employee = employeeRepository.findByUserId(employeeUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ nhân viên cho tài khoản hiện tại!"));

        return customerAssignmentRepository.findByEmployeeId(employee.getId()).stream()
                .map(CustomerAssignment::getCustomer)
                .map(this::convertCustomerToDto)
                .collect(Collectors.toList());
    }

    private CustomerAssignmentResponseDto convertToDto(CustomerAssignment entity) {
        CustomerAssignmentResponseDto dto = new CustomerAssignmentResponseDto();
        dto.setId(entity.getId());
        dto.setEmployeeId(entity.getEmployee().getId());
        dto.setEmployeeName(entity.getEmployee().getFullName());
        dto.setEmployeeCode(entity.getEmployee().getEmployeeCode());
        dto.setCustomerId(entity.getCustomer().getId());
        dto.setCustomerName(entity.getCustomer().getFullName());
        dto.setCustomerCode(entity.getCustomer().getCustomerCode());
        dto.setAssignedAt(entity.getAssignedAt());
        return dto;
    }

    private CustomerResponseDto convertCustomerToDto(Customer customer) {
        return new CustomerResponseDto(
                customer.getId(),
                customer.getCustomerCode(),
                customer.getFullName(),
                customer.getPhoneNumber(),
                customer.getAddress(),
                customer.getDateOfBirth(),
                customer.getGender(),
                customer.getIdentityCard(),
                customer.getUser().getId(),
                customer.getUser().getEmail(),
                customer.getStatus(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}
