package com.insurance.controller;

import com.insurance.dto.InsurancePackageResponseDto;
import com.insurance.service.InsurancePackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/insurance-packages")
public class PublicInsurancePackageController {

    @Autowired
    private InsurancePackageService insurancePackageService;

    @GetMapping
    public ResponseEntity<List<InsurancePackageResponseDto>> getActivePackages() {
        return ResponseEntity.ok(insurancePackageService.getActivePackages());
    }
}
