package com.media.user.repository;

import com.media.user.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    Optional<OtpVerification> findTopByEmailAndOtpCodeAndUsedFalseOrderByCreatedAtDesc(String email, String otpCode);
}
