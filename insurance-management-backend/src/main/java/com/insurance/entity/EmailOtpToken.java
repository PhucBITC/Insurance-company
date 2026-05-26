package com.insurance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_otp_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailOtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 512)
    private String password;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;
}
