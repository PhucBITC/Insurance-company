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

    @PostMapping("/customer/insurances")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> registerPackage(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CustomerInsuranceRequestDto request) {
        try {
            CustomerInsuranceResponseDto response = customerInsuranceService.registerPackage(userDetails.getId(), request);
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
    public ResponseEntity<?> approveInsurance(@PathVariable Long id) {
        try {
            CustomerInsuranceResponseDto response = customerInsuranceService.approveInsurance(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/admin/insurances/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<?> rejectInsurance(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String rejectReason = payload.get("rejectReason");
            CustomerInsuranceResponseDto response = customerInsuranceService.rejectInsurance(id, rejectReason);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
