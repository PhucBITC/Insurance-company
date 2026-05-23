package com.insurance.service;

import com.insurance.dto.IncidentReportRequestDto;
import com.insurance.dto.IncidentReportResponseDto;
import com.insurance.entity.Customer;
import com.insurance.entity.CustomerAssignment;
import com.insurance.entity.CustomerInsurance;
import com.insurance.entity.Employee;
import com.insurance.entity.IncidentReport;
import com.insurance.repository.CustomerAssignmentRepository;
import com.insurance.repository.CustomerInsuranceRepository;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.EmployeeRepository;
import com.insurance.repository.IncidentReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class IncidentReportService {

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerInsuranceRepository customerInsuranceRepository;

    @Autowired
    private CustomerAssignmentRepository customerAssignmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public IncidentReportResponseDto createReport(Long customerUserId, IncidentReportRequestDto request) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng cho tài khoản hiện tại!"));

        // Validations
        if (request.getTitle() == null || request.getTitle().trim().length() < 5) {
            throw new RuntimeException("Lỗi: Tiêu đề sự cố phải có ít nhất 5 ký tự!");
        }
        if (request.getDescription() == null || request.getDescription().trim().length() < 10) {
            throw new RuntimeException("Lỗi: Mô tả chi tiết phải có ít nhất 10 ký tự!");
        }
        if (request.getClaimAmount() == null || request.getClaimAmount() < 0) {
            throw new RuntimeException("Lỗi: Số tiền yêu cầu bồi thường phải lớn hơn hoặc bằng 0!");
        }
        if (request.getIncidentDate() == null || request.getIncidentDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Lỗi: Ngày xảy ra sự cố không được ở tương lai!");
        }

        if (request.getCustomerInsuranceId() == null) {
            throw new RuntimeException("Lỗi: Vui lòng chọn hợp đồng bảo hiểm liên kết để khai báo sự cố!");
        }
        CustomerInsurance customerInsurance = customerInsuranceRepository.findById(request.getCustomerInsuranceId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hợp đồng bảo hiểm!"));

        if (!customerInsurance.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Lỗi: Hợp đồng bảo hiểm không thuộc về khách hàng này!");
        }
        if (!"APPROVED".equals(customerInsurance.getStatus())) {
            throw new RuntimeException("Lỗi: Hợp đồng bảo hiểm chưa được duyệt hoặc đang bị từ chối!");
        }

        // Auto-assign care handler if exists
        Employee handlerEmployee = null;
        Optional<CustomerAssignment> assignmentOpt = customerAssignmentRepository.findByCustomerId(customer.getId());
        if (assignmentOpt.isPresent()) {
            handlerEmployee = assignmentOpt.get().getEmployee();
        }

        // Generate report code
        String dateStr = DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now());
        String reportCode;
        do {
            int rand = (int) (Math.random() * 9000) + 1000; // 1000 - 9999
            reportCode = "SR-" + dateStr + "-" + rand;
        } while (incidentReportRepository.existsByReportCode(reportCode));

        IncidentReport report = new IncidentReport();
        report.setReportCode(reportCode);
        report.setCustomer(customer);
        report.setCustomerInsurance(customerInsurance);
        report.setTitle(request.getTitle().trim());
        report.setDescription(request.getDescription().trim());
        report.setClaimAmount(request.getClaimAmount());
        report.setIncidentDate(request.getIncidentDate());
        report.setHandlerEmployee(handlerEmployee);
        report.setAttachmentUrl(request.getAttachmentUrl());
        report.setStatus("NEW");

        IncidentReport saved = incidentReportRepository.save(report);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<IncidentReportResponseDto> getMyReports(Long customerUserId) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng!"));
        return incidentReportRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IncidentReportResponseDto> getEmployeeReports(Long employeeUserId) {
        Employee employee = employeeRepository.findByUserId(employeeUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ nhân viên!"));
        return incidentReportRepository.findByHandlerEmployeeIdOrderByCreatedAtDesc(employee.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IncidentReportResponseDto> getAllReports() {
        return incidentReportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public IncidentReportResponseDto processReport(Long reportId, String status, String rejectReason, Long handlerUserId) {
        IncidentReport report = incidentReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy báo cáo sự cố!"));

        if (!"NEW".equals(status) && !"PROCESSING".equals(status) && !"RESOLVED".equals(status) && !"REJECTED".equals(status)) {
            throw new RuntimeException("Lỗi: Trạng thái không hợp lệ!");
        }

        // Try to update handler if user is an employee
        Optional<Employee> employeeOpt = employeeRepository.findByUserId(handlerUserId);
        employeeOpt.ifPresent(report::setHandlerEmployee);

        if ("REJECTED".equals(status)) {
            if (rejectReason == null || rejectReason.trim().isEmpty()) {
                throw new RuntimeException("Lỗi: Vui lòng nhập lý do từ chối!");
            }
            report.setRejectReason(rejectReason.trim());
        } else {
            report.setRejectReason(null);
        }

        report.setStatus(status);
        IncidentReport saved = incidentReportRepository.save(report);
        return convertToDto(saved);
    }

    public void deleteReportByCustomer(Long customerUserId, Long reportId) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng!"));
        IncidentReport report = incidentReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy báo cáo sự cố!"));

        if (!report.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Lỗi: Yêu cầu sự cố này không thuộc về bạn!");
        }
        if (!"NEW".equals(report.getStatus())) {
            throw new RuntimeException("Lỗi: Chỉ được hủy/xóa yêu cầu sự cố ở trạng thái chờ xử lý (NEW)!");
        }

        incidentReportRepository.delete(report);
    }

    public void deleteReportByAdmin(Long reportId) {
        if (!incidentReportRepository.existsById(reportId)) {
            throw new RuntimeException("Lỗi: Không tìm thấy báo cáo sự cố với ID: " + reportId);
        }
        incidentReportRepository.deleteById(reportId);
    }

    private IncidentReportResponseDto convertToDto(IncidentReport report) {
        IncidentReportResponseDto dto = new IncidentReportResponseDto();
        dto.setId(report.getId());
        dto.setReportCode(report.getReportCode());
        if (report.getCustomer() != null) {
            dto.setCustomerId(report.getCustomer().getId());
            dto.setCustomerName(report.getCustomer().getFullName());
            dto.setCustomerPhone(report.getCustomer().getPhoneNumber());
        }
        if (report.getCustomerInsurance() != null) {
            dto.setCustomerInsuranceId(report.getCustomerInsurance().getId());
            dto.setContractCode(report.getCustomerInsurance().getContractCode());
            if (report.getCustomerInsurance().getInsurancePackage() != null) {
                dto.setInsurancePackageName(report.getCustomerInsurance().getInsurancePackage().getName());
            }
        }
        dto.setTitle(report.getTitle());
        dto.setDescription(report.getDescription());
        dto.setClaimAmount(report.getClaimAmount());
        dto.setIncidentDate(report.getIncidentDate());
        dto.setStatus(report.getStatus());
        dto.setRejectReason(report.getRejectReason());
        if (report.getHandlerEmployee() != null) {
            dto.setHandlerEmployeeId(report.getHandlerEmployee().getId());
            dto.setHandlerEmployeeName(report.getHandlerEmployee().getFullName());
        }
        dto.setAttachmentUrl(report.getAttachmentUrl());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());
        return dto;
    }
}
