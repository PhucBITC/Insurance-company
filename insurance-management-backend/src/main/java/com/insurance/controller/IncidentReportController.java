package com.insurance.controller;

import com.insurance.dto.IncidentReportRequestDto;
import com.insurance.dto.IncidentReportResponseDto;
import com.insurance.dto.MessageResponse;
import com.insurance.security.UserDetailsImpl;
import com.insurance.service.IncidentReportService;
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
public class IncidentReportController {

    @Autowired
    private IncidentReportService incidentReportService;

    // --- CUSTOMER ENDPOINTS ---

    @PostMapping("/customer/reports")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createReport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody IncidentReportRequestDto request) {
        try {
            IncidentReportResponseDto response = incidentReportService.createReport(userDetails.getId(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/customer/reports/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getMyReports(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<IncidentReportResponseDto> response = incidentReportService.getMyReports(userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/customer/reports/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> cancelReport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            incidentReportService.deleteReportByCustomer(userDetails.getId(), id);
            return ResponseEntity.ok(new MessageResponse("Hủy báo cáo sự cố thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // --- EMPLOYEE ENDPOINTS ---

    @GetMapping("/employee/reports/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getEmployeeReports(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<IncidentReportResponseDto> response = incidentReportService.getEmployeeReports(userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/employee/reports/{id}/status")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> updateReportStatusByEmployee(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            String rejectReason = payload.get("rejectReason");
            IncidentReportResponseDto response = incidentReportService.processReport(id, status, rejectReason, userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/admin/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllReports() {
        try {
            List<IncidentReportResponseDto> response = incidentReportService.getAllReports();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/admin/reports/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateReportStatusByAdmin(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            String rejectReason = payload.get("rejectReason");
            IncidentReportResponseDto response = incidentReportService.processReport(id, status, rejectReason, userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/admin/reports/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReportByAdmin(@PathVariable Long id) {
        try {
            incidentReportService.deleteReportByAdmin(id);
            return ResponseEntity.ok(new MessageResponse("Xóa báo cáo sự cố thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
