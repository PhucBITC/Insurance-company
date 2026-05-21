package com.insurance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InsurancePackageRequestDto {

    @NotBlank
    @Size(max = 20)
    private String packageCode;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String type;

    private String description;

    @NotNull
    @Min(0)
    private Double price;

    @NotNull
    @Min(1)
    private Integer durationMonths;

    @NotNull
    @Min(0)
    private Double maxBenefit;

    private String conditions;

    @NotBlank
    @Size(max = 20)
    private String status = "ACTIVE";
}
