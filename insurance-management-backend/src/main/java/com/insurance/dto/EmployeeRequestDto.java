package com.insurance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeRequestDto {

    @NotBlank
    @Size(max = 20)
    private String employeeCode;

    @NotBlank
    @Size(max = 100)
    private String fullName;

    @Size(max = 15)
    private String phoneNumber;

    @Size(max = 50)
    private String position;

    @Size(max = 50)
    private String department;

    private Double salary;

    private LocalDate hireDate;

    @NotBlank
    @Email
    @Size(max = 50)
    private String email;

    // Optional for update, required for create (validated in service)
    private String password;
}
