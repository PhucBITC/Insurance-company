package com.insurance.controller;

import com.insurance.dto.InsurancePackageRequestDto;
import com.insurance.dto.InsurancePackageResponseDto;
import com.insurance.dto.MessageResponse;
import com.insurance.service.InsurancePackageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/insurance-packages")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInsurancePackageController {

    @Autowired
    private InsurancePackageService insurancePackageService;

    @Autowired
    private com.insurance.service.SystemLogService systemLogService;

    @GetMapping
    public ResponseEntity<List<InsurancePackageResponseDto>> getAllPackages() {
        return ResponseEntity.ok(insurancePackageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurancePackageResponseDto> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(insurancePackageService.getPackageById(id));
    }

    @PostMapping
    public ResponseEntity<?> createPackage(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.insurance.security.UserDetailsImpl userDetails,
            @Valid @RequestBody InsurancePackageRequestDto request) {
        try {
            InsurancePackageResponseDto response = insurancePackageService.createPackage(request);
            systemLogService.log("Tạo mới gói bảo hiểm: " + request.getName() + " (" + response.getPackageCode() + ")", userDetails.getUsername(), "ROLE_ADMIN", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePackage(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.insurance.security.UserDetailsImpl userDetails,
            @PathVariable Long id, 
            @Valid @RequestBody InsurancePackageRequestDto request) {
        try {
            InsurancePackageResponseDto response = insurancePackageService.updatePackage(id, request);
            systemLogService.log("Cập nhật gói bảo hiểm: " + request.getName() + " (" + response.getPackageCode() + ")", userDetails.getUsername(), "ROLE_ADMIN", "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.insurance.security.UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            InsurancePackageResponseDto pkg = insurancePackageService.getPackageById(id);
            insurancePackageService.deletePackage(id);
            systemLogService.log("Xóa gói bảo hiểm: " + (pkg != null ? pkg.getName() : "ID " + id), userDetails.getUsername(), "ROLE_ADMIN", "DANGER");
            return ResponseEntity.ok(new MessageResponse("Xóa gói bảo hiểm thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
