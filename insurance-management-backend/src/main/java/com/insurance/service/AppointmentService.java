package com.insurance.service;

import com.insurance.dto.AppointmentRequestDto;
import com.insurance.dto.AppointmentResponseDto;
import com.insurance.entity.Appointment;
import com.insurance.entity.Customer;
import com.insurance.entity.CustomerAssignment;
import com.insurance.entity.Employee;
import com.insurance.repository.AppointmentRepository;
import com.insurance.repository.CustomerAssignmentRepository;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CustomerAssignmentRepository customerAssignmentRepository;

    @Autowired
    private NotificationService notificationService;

    public AppointmentResponseDto bookAppointment(Long customerUserId, AppointmentRequestDto request) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng cho tài khoản này!"));

        if (request.getAppointmentDate() == null || request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Lỗi: Ngày hẹn phải từ hôm nay trở đi!");
        }
        
        if (request.getAppointmentTime() == null || request.getAppointmentTime().trim().isEmpty()) {
            throw new RuntimeException("Lỗi: Vui lòng chọn giờ hẹn!");
        }

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Lỗi: Vui lòng nhập tiêu đề buổi hẹn!");
        }

        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setConsultationType(request.getConsultationType() != null ? request.getConsultationType() : "ONLINE");
        appointment.setTitle(request.getTitle());
        appointment.setNotes(request.getNotes());
        appointment.setStatus("PENDING");

        // Tự động gán cho Nhân viên phụ trách khách hàng này (nếu có)
        CustomerAssignment assignment = customerAssignmentRepository.findByCustomerId(customer.getId()).orElse(null);
        if (assignment != null) {
            appointment.setEmployee(assignment.getEmployee());
        }

        Appointment saved = appointmentRepository.save(appointment);

        // Gửi thông báo
        if (appointment.getEmployee() != null) {
            notificationService.sendNotification(
                appointment.getEmployee().getUser(),
                "Yêu cầu lịch hẹn mới",
                "Khách hàng " + customer.getFullName() + " đã đăng ký lịch hẹn mới: \"" + appointment.getTitle() + "\"",
                "/employee/appointments"
            );
            notificationService.sendNotificationToAllAdmins(
                "Yêu cầu lịch hẹn mới (Đã phân công)",
                "Khách hàng " + customer.getFullName() + " đã đăng ký lịch hẹn mới (Đã gán cho nhân viên " + appointment.getEmployee().getFullName() + "): \"" + appointment.getTitle() + "\"",
                "/admin/appointments"
            );
        } else {
            notificationService.sendNotificationToAllAdmins(
                "Yêu cầu lịch hẹn mới (Chưa phân công)",
                "Khách hàng " + customer.getFullName() + " đã đăng ký lịch hẹn mới (Chưa gán nhân viên phụ trách): \"" + appointment.getTitle() + "\"",
                "/admin/appointments"
            );
        }

        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getCustomerAppointments(Long customerUserId) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng!"));
        
        return appointmentRepository.findByCustomerIdOrderByAppointmentDateDescCreatedAtDesc(customer.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getEmployeeAppointments(Long employeeUserId) {
        Employee employee = employeeRepository.findByUserId(employeeUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ nhân viên!"));
        
        return appointmentRepository.findByEmployeeIdOrderByAppointmentDateDescCreatedAtDesc(employee.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAllAppointments() {
        return appointmentRepository.findAllByOrderByAppointmentDateDescCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void cancelAppointment(Long customerUserId, Long appointmentId) {
        Customer customer = customerRepository.findByUserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy hồ sơ khách hàng!"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy lịch hẹn!"));

        if (!appointment.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Lỗi: Bạn không có quyền hủy lịch hẹn này!");
        }

        if ("COMPLETED".equals(appointment.getStatus()) || "CANCELLED".equals(appointment.getStatus())) {
            throw new RuntimeException("Lỗi: Không thể hủy lịch hẹn đã hoàn thành hoặc đã bị hủy!");
        }

        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);

        // Gửi thông báo hủy lịch
        String notifyMsg = "Khách hàng " + customer.getFullName() + " đã hủy lịch hẹn: \"" + appointment.getTitle() + "\"";
        if (appointment.getEmployee() != null) {
            notificationService.sendNotification(appointment.getEmployee().getUser(), "Lịch hẹn bị hủy", notifyMsg, "/employee/appointments");
            notificationService.sendNotificationToAllAdmins("Lịch hẹn bị hủy", notifyMsg, "/admin/appointments");
        } else {
            notificationService.sendNotificationToAllAdmins("Lịch hẹn bị hủy", notifyMsg, "/admin/appointments");
        }
    }

    public AppointmentResponseDto updateAppointmentStatus(Long appointmentId, String status, String rejectReason, Long handlerUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy lịch hẹn!"));

        if ("CANCELLED".equals(appointment.getStatus())) {
            throw new RuntimeException("Lỗi: Không thể cập nhật trạng thái lịch hẹn đã bị khách hàng hủy!");
        }

        status = status.toUpperCase().trim();
        if (!status.equals("APPROVED") && !status.equals("REJECTED") && !status.equals("COMPLETED")) {
            throw new RuntimeException("Lỗi: Trạng thái cập nhật không hợp lệ!");
        }

        if (status.equals("REJECTED") && (rejectReason == null || rejectReason.trim().isEmpty())) {
            throw new RuntimeException("Lỗi: Vui lòng nhập lý do từ chối!");
        }

        appointment.setStatus(status);
        if (status.equals("REJECTED")) {
            appointment.setRejectReason(rejectReason);
        } else {
            appointment.setRejectReason(null);
        }

        Appointment saved = appointmentRepository.save(appointment);

        // Gửi thông báo cho khách hàng
        String title = "Cập nhật trạng thái lịch hẹn";
        String content = "Lịch hẹn \"" + appointment.getTitle() + "\" của bạn đã được " + 
                (status.equals("APPROVED") ? "phê duyệt" : status.equals("REJECTED") ? "từ chối (Lý do: " + rejectReason + ")" : "đánh dấu hoàn thành") + ".";
        notificationService.sendNotification(appointment.getCustomer().getUser(), title, content, "/customer/appointments");

        return convertToDto(saved);
    }

    public AppointmentResponseDto assignEmployee(Long appointmentId, Long employeeId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy lịch hẹn!"));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy nhân viên!"));

        appointment.setEmployee(employee);
        Appointment saved = appointmentRepository.save(appointment);

        // Thông báo cho nhân viên
        notificationService.sendNotification(
            employee.getUser(),
            "Phân công lịch hẹn tư vấn mới",
            "Bạn được phân công phụ trách lịch hẹn của khách hàng " + appointment.getCustomer().getFullName() + ": \"" + appointment.getTitle() + "\"",
            "/employee/appointments"
        );

        // Thông báo cho khách hàng
        notificationService.sendNotification(
            appointment.getCustomer().getUser(),
            "Lịch hẹn đã được phân công",
            "Lịch hẹn \"" + appointment.getTitle() + "\" của bạn đã được gán cho nhân viên " + employee.getFullName() + " phụ trách tư vấn.",
            "/customer/appointments"
        );

        return convertToDto(saved);
    }

    private AppointmentResponseDto convertToDto(Appointment entity) {
        AppointmentResponseDto dto = new AppointmentResponseDto();
        dto.setId(entity.getId());
        dto.setCustomerId(entity.getCustomer().getId());
        dto.setCustomerName(entity.getCustomer().getFullName());
        dto.setCustomerCode(entity.getCustomer().getCustomerCode());
        if (entity.getEmployee() != null) {
            dto.setEmployeeId(entity.getEmployee().getId());
            dto.setEmployeeName(entity.getEmployee().getFullName());
            dto.setEmployeeCode(entity.getEmployee().getEmployeeCode());
        }
        dto.setAppointmentDate(entity.getAppointmentDate());
        dto.setAppointmentTime(entity.getAppointmentTime());
        dto.setConsultationType(entity.getConsultationType());
        dto.setTitle(entity.getTitle());
        dto.setNotes(entity.getNotes());
        dto.setStatus(entity.getStatus());
        dto.setRejectReason(entity.getRejectReason());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
