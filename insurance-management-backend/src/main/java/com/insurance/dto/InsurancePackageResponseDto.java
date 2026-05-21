package com.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InsurancePackageResponseDto {
    private Long id;
    private String packageCode;
    private String name;
    private String type;
    private String description;
    private Double price;
    private Integer durationMonths;
    private Double maxBenefit;
    private String conditions;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
