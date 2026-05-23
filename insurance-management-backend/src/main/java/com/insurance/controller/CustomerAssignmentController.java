package com.insurance.controller;

import com.insurance.dto.CustomerAssignmentRequestDto;
import com.insurance.dto.CustomerAssignmentResponseDto;
import com.insurance.dto.CustomerResponseDto;
import com.insurance.dto.MessageResponse;
import com.insurance.security.UserDetailsImpl;
import com.insurance.service.CustomerAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class CustomerAssignmentController {

    @Autowired
    private CustomerAssignmentService customerAssignmentService;

    @PostMapping("/admin/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignCustomer(@RequestBody CustomerAssignmentRequestDto request) {
        try {
            CustomerAssignmentResponseDto response = customerAssignmentService.assignCustomer(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/admin/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomerAssignmentResponseDto>> getAllAssignments() {
        return ResponseEntity.ok(customerAssignmentService.getAllAssignments());
    }

    @DeleteMapping("/admin/assignments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeAssignment(@PathVariable Long id) {
        try {
            customerAssignmentService.removeAssignment(id);
            return ResponseEntity.ok(new MessageResponse("Hủy phân công chăm sóc thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/employee/customers")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getMyCustomers(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<CustomerResponseDto> response = customerAssignmentService.getMyCustomers(userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
