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

    @GetMapping
    public ResponseEntity<List<InsurancePackageResponseDto>> getAllPackages() {
        return ResponseEntity.ok(insurancePackageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurancePackageResponseDto> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(insurancePackageService.getPackageById(id));
    }

    @PostMapping
    public ResponseEntity<?> createPackage(@Valid @RequestBody InsurancePackageRequestDto request) {
        try {
            InsurancePackageResponseDto response = insurancePackageService.createPackage(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePackage(@PathVariable Long id, @Valid @RequestBody InsurancePackageRequestDto request) {
        try {
            InsurancePackageResponseDto response = insurancePackageService.updatePackage(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(@PathVariable Long id) {
        try {
            insurancePackageService.deletePackage(id);
            return ResponseEntity.ok(new MessageResponse("Xóa gói bảo hiểm thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
