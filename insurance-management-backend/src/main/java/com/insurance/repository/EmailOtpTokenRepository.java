package com.insurance.repository;

import com.insurance.entity.EmailOtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailOtpTokenRepository extends JpaRepository<EmailOtpToken, Long> {
    Optional<EmailOtpToken> findByEmail(String email);
}
