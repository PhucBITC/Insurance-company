package com.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInsuranceResponseDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerCode;
    private Long insurancePackageId;
    private String insurancePackageName;
    private String insurancePackageCode;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double price;
    private String status;
    private String contractCode;
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
