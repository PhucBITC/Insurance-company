package com.insurance.controller;

import com.insurance.dto.AppointmentRequestDto;
import com.insurance.dto.AppointmentResponseDto;
import com.insurance.dto.MessageResponse;
import com.insurance.security.UserDetailsImpl;
import com.insurance.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    // --- CUSTOMER APIS ---

    @PostMapping("/customer/appointments")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> bookAppointment(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody AppointmentRequestDto request) {
        try {
            AppointmentResponseDto response = appointmentService.bookAppointment(userDetails.getId(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/customer/appointments/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getMyAppointments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<AppointmentResponseDto> response = appointmentService.getCustomerAppointments(userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/customer/appointments/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> cancelAppointment(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            appointmentService.cancelAppointment(userDetails.getId(), id);
            return ResponseEntity.ok(new MessageResponse("Hủy lịch hẹn tư vấn thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // --- EMPLOYEE APIS ---

    @GetMapping("/employee/appointments/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getEmployeeAppointments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<AppointmentResponseDto> response = appointmentService.getEmployeeAppointments(userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // --- ADMIN APIS ---

    @GetMapping("/admin/appointments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAppointments() {
        try {
            List<AppointmentResponseDto> response = appointmentService.getAllAppointments();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/admin/appointments/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignEmployee(
            @PathVariable Long id,
            @RequestBody Map<String, Long> payload) {
        try {
            Long employeeId = payload.get("employeeId");
            if (employeeId == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Thiếu ID nhân viên!"));
            }
            AppointmentResponseDto response = appointmentService.assignEmployee(id, employeeId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // --- SHARED ADMIN & EMPLOYEE STATUS UPDATE ---

    @PutMapping("/admin-or-employee/appointments/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<?> updateAppointmentStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            String rejectReason = payload.get("rejectReason");
            AppointmentResponseDto response = appointmentService.updateAppointmentStatus(id, status, rejectReason, userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
