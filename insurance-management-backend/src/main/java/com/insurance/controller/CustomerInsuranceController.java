package com.insurance.controller;

import com.insurance.dto.CustomerInsuranceRequestDto;
import com.insurance.dto.CustomerInsuranceResponseDto;
import com.insurance.dto.MessageResponse;
import com.insurance.security.UserDetailsImpl;
import com.insurance.service.CustomerInsuranceService;
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
public class CustomerInsuranceController {

    @Autowired
    private CustomerInsuranceService customerInsuranceService;

    @Autowired
    private com.insurance.service.SystemLogService systemLogService;

    @PostMapping("/customer/insurances")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> registerPackage(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CustomerInsuranceRequestDto request) {
        try {
            CustomerInsuranceResponseDto response = customerInsuranceService.registerPackage(userDetails.getId(), request);
            systemLogService.log("Khách hàng đăng ký mua gói bảo hiểm: " + response.getInsurancePackageName() + " (" + response.getInsurancePackageCode() + ")", userDetails.getUsername(), "ROLE_CUSTOMER", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/customer/insurances/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getMyInsurances(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<CustomerInsuranceResponseDto> response = customerInsuranceService.getMyInsurances(userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/admin/insurances")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<CustomerInsuranceResponseDto>> getAllInsurances() {
        return ResponseEntity.ok(customerInsuranceService.getAllInsurances());
    }

    @PutMapping("/admin/insurances/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<?> approveInsurance(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            CustomerInsuranceResponseDto response = customerInsuranceService.approveInsurance(id);
            String role = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ? "ROLE_ADMIN" : "ROLE_EMPLOYEE";
            systemLogService.log("Phê duyệt hợp đồng bảo hiểm ID: " + id + " (" + response.getInsurancePackageName() + ") cho khách hàng " + response.getCustomerName() + " (Mã hợp đồng: " + response.getContractCode() + ")", userDetails.getUsername(), role, "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/admin/insurances/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<?> rejectInsurance(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String rejectReason = payload.get("rejectReason");
            CustomerInsuranceResponseDto response = customerInsuranceService.rejectInsurance(id, rejectReason);
            String role = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ? "ROLE_ADMIN" : "ROLE_EMPLOYEE";
            systemLogService.log("Từ chối hợp đồng bảo hiểm ID: " + id + " (" + response.getInsurancePackageName() + ") của khách hàng " + response.getCustomerName() + ". Lý do: " + rejectReason, userDetails.getUsername(), role, "WARNING");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/customer/insurances/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> deleteCustomerInsurance(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            customerInsuranceService.deleteCustomerInsuranceByCustomer(userDetails.getId(), id);
            systemLogService.log("Khách hàng xóa/hủy yêu cầu đăng ký bảo hiểm ID: " + id, userDetails.getUsername(), "ROLE_CUSTOMER", "DANGER");
            return ResponseEntity.ok(new MessageResponse("Xóa/Hủy yêu cầu đăng ký bảo hiểm thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/admin/insurances/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCustomerInsuranceByAdmin(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            customerInsuranceService.deleteCustomerInsuranceByAdmin(id);
            systemLogService.log("Admin xóa yêu cầu đăng ký bảo hiểm ID: " + id, userDetails.getUsername(), "ROLE_ADMIN", "DANGER");
            return ResponseEntity.ok(new MessageResponse("Xóa yêu cầu đăng ký bảo hiểm thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
