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
public class AppointmentResponseDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerCode;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String consultationType;
    private String title;
    private String notes;
    private String status;
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
