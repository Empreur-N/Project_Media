package com.media.ad.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "ad_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdPayment implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ad_banner_id", nullable = false)
    private Long adBannerId;

    @Column(name = "campaign_title")
    private String campaignTitle;

    @Column(nullable = false)
    private String provider; // M_PESA, AIRTEL_MONEY, ORANGE_MONEY

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "transaction_reference", nullable = false, unique = true)
    private String transactionReference;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, SUCCESS, FAILED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}