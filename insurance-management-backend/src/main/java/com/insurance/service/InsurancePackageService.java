package com.insurance.service;

import com.insurance.dto.InsurancePackageRequestDto;
import com.insurance.dto.InsurancePackageResponseDto;
import com.insurance.entity.InsurancePackage;
import com.insurance.repository.InsurancePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InsurancePackageService {

    @Autowired
    private InsurancePackageRepository insurancePackageRepository;

    public List<InsurancePackageResponseDto> getAllPackages() {
        return insurancePackageRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InsurancePackageResponseDto> getActivePackages() {
        return insurancePackageRepository.findByStatus("ACTIVE").stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public InsurancePackageResponseDto getPackageById(Long id) {
        InsurancePackage pkg = insurancePackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy gói bảo hiểm với ID " + id));
        return convertToDto(pkg);
    }

    public InsurancePackageResponseDto createPackage(InsurancePackageRequestDto request) {
        if (insurancePackageRepository.existsByPackageCode(request.getPackageCode())) {
            throw new RuntimeException("Lỗi: Mã gói bảo hiểm '" + request.getPackageCode() + "' đã được sử dụng!");
        }

        InsurancePackage pkg = new InsurancePackage();
        pkg.setPackageCode(request.getPackageCode());
        pkg.setName(request.getName());
        pkg.setType(request.getType());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationMonths(request.getDurationMonths());
        pkg.setMaxBenefit(request.getMaxBenefit());
        pkg.setConditions(request.getConditions());
        pkg.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        InsurancePackage savedPkg = insurancePackageRepository.save(pkg);
        return convertToDto(savedPkg);
    }

    public InsurancePackageResponseDto updatePackage(Long id, InsurancePackageRequestDto request) {
        InsurancePackage pkg = insurancePackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy gói bảo hiểm với ID " + id));

        if (!pkg.getPackageCode().equals(request.getPackageCode()) &&
                insurancePackageRepository.existsByPackageCode(request.getPackageCode())) {
            throw new RuntimeException("Lỗi: Mã gói bảo hiểm '" + request.getPackageCode() + "' đã được sử dụng!");
        }

        pkg.setPackageCode(request.getPackageCode());
        pkg.setName(request.getName());
        pkg.setType(request.getType());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationMonths(request.getDurationMonths());
        pkg.setMaxBenefit(request.getMaxBenefit());
        pkg.setConditions(request.getConditions());
        if (request.getStatus() != null) {
            pkg.setStatus(request.getStatus());
        }

        InsurancePackage updatedPkg = insurancePackageRepository.save(pkg);
        return convertToDto(updatedPkg);
    }

    public void deletePackage(Long id) {
        InsurancePackage pkg = insurancePackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy gói bảo hiểm với ID " + id));
        insurancePackageRepository.delete(pkg);
    }

    private InsurancePackageResponseDto convertToDto(InsurancePackage pkg) {
        return new InsurancePackageResponseDto(
                pkg.getId(),
                pkg.getPackageCode(),
                pkg.getName(),
                pkg.getType(),
                pkg.getDescription(),
                pkg.getPrice(),
                pkg.getDurationMonths(),
                pkg.getMaxBenefit(),
                pkg.getConditions(),
                pkg.getStatus(),
                pkg.getCreatedAt(),
                pkg.getUpdatedAt()
        );
    }
}
