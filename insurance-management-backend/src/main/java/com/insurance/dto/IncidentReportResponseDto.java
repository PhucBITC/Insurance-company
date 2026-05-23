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
public class IncidentReportResponseDto {
    private Long id;
    private String reportCode;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long customerInsuranceId;
    private String contractCode;
    private String insurancePackageName;
    private String title;
    private String description;
    private Double claimAmount;
    private LocalDate incidentDate;
    private String status;
    private String rejectReason;
    private Long handlerEmployeeId;
    private String handlerEmployeeName;
    private String attachmentUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
