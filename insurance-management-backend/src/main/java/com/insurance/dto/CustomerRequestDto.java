package com.insurance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CustomerRequestDto {

    @NotBlank
    @Size(max = 20)
    private String customerCode;

    @NotBlank
    @Size(max = 100)
    private String fullName;

    @Size(max = 15)
    private String phoneNumber;

    @Size(max = 255)
    private String address;

    private LocalDate dateOfBirth;

    @Size(max = 10)
    private String gender;

    @Size(max = 20)
    private String identityCard;

    @NotBlank
    @Email
    @Size(max = 50)
    private String email;

    // Optional for update, required for create (validated in service)
    private String password;
}
