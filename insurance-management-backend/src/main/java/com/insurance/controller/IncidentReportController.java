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

    @Autowired
    private com.insurance.service.SystemLogService systemLogService;

    // --- CUSTOMER ENDPOINTS ---

    @PostMapping("/customer/reports")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createReport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody IncidentReportRequestDto request) {
        try {
            IncidentReportResponseDto response = incidentReportService.createReport(userDetails.getId(), request);
            systemLogService.log("Khách hàng khai báo sự cố mới: " + response.getTitle() + " (Mã báo cáo: " + response.getReportCode() + ") cho hợp đồng " + response.getContractCode(), userDetails.getUsername(), "ROLE_CUSTOMER", "SUCCESS");
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
            systemLogService.log("Khách hàng hủy/xóa báo cáo sự cố ID: " + id, userDetails.getUsername(), "ROLE_CUSTOMER", "DANGER");
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
            String logStatus = "REJECTED".equals(response.getStatus()) ? "WARNING" : "SUCCESS";
            systemLogService.log("Nhân viên cập nhật trạng thái báo cáo sự cố " + response.getReportCode() + " thành " + response.getStatus() + (response.getRejectReason() != null ? " (Lý do từ chối: " + response.getRejectReason() + ")" : ""), userDetails.getUsername(), "ROLE_EMPLOYEE", logStatus);
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
            String logStatus = "REJECTED".equals(response.getStatus()) ? "WARNING" : "SUCCESS";
            systemLogService.log("Admin cập nhật trạng thái báo cáo sự cố " + response.getReportCode() + " thành " + response.getStatus() + (response.getRejectReason() != null ? " (Lý do từ chối: " + response.getRejectReason() + ")" : ""), userDetails.getUsername(), "ROLE_ADMIN", logStatus);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/admin/reports/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReportByAdmin(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            incidentReportService.deleteReportByAdmin(id);
            systemLogService.log("Admin xóa vĩnh viễn báo cáo sự cố ID: " + id, userDetails.getUsername(), "ROLE_ADMIN", "DANGER");
            return ResponseEntity.ok(new MessageResponse("Xóa báo cáo sự cố thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
