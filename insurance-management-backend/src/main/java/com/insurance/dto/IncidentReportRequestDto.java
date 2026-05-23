package com.insurance.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class IncidentReportRequestDto {
    private Long customerInsuranceId; // Nullable
    private String title;
    private String description;
    private Double claimAmount;
    private LocalDate incidentDate;
    private String attachmentUrl;
}
