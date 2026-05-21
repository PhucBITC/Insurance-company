package com.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class UserResponseDto {
    private Long id;
    private String email;
    private String role;
    private String status;
    private String fullName;
    private LocalDateTime createdAt;

    public UserResponseDto(Long id, String email, String role, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }

    public UserResponseDto(Long id, String email, String role, String status, String fullName, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.status = status;
        this.fullName = fullName;
        this.createdAt = createdAt;
    }
}
