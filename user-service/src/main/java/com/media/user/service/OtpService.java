package com.media.user.service;

import com.media.user.model.OtpVerification;
import com.media.user.repository.OtpVerificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(OtpVerificationRepository otpRepository, EmailService emailService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void generateAndSendOtp(String email) {
        String cleanEmail = email.trim().toLowerCase();
        
        // Génération d'un code à 6 chiffres sécurisé (000000 - 999999)
        String otpCode = String.format("%06d", secureRandom.nextInt(1_000_000));
        
        OtpVerification verification = OtpVerification.builder()
                .email(cleanEmail)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();

        otpRepository.save(verification);
        emailService.sendOtpEmail(cleanEmail, otpCode);
    }

    @Transactional
    public boolean validateAndConsumeOtp(String email, String otpCode) {
        String cleanEmail = email.trim().toLowerCase();
        String cleanCode = otpCode.trim();

        Optional<OtpVerification> opt = otpRepository
                .findTopByEmailAndOtpCodeAndUsedFalseOrderByCreatedAtDesc(cleanEmail, cleanCode);

        if (opt.isEmpty()) {
            return false;
        }

        OtpVerification otp = opt.get();
        if (otp.isExpired()) {
            return false;
        }

        otp.setUsed(true);
        otpRepository.save(otp);
        return true;
    }
}
