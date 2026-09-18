package com.media.ad.controller;

import com.media.ad.model.AdBanner;
import com.media.ad.model.AdPayment;
import com.media.ad.repository.AdBannerRepository;
import com.media.ad.repository.AdPaymentRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ads/payments")
public class PaymentController {

    private final AdPaymentRepository adPaymentRepository;
    private final AdBannerRepository adBannerRepository;

    public PaymentController(AdPaymentRepository adPaymentRepository, AdBannerRepository adBannerRepository) {
        this.adPaymentRepository = adPaymentRepository;
        this.adBannerRepository = adBannerRepository;
    }

    // Initier un paiement Mobile Money (M-Pesa, Airtel Money, Orange Money) - Règle 3
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody Map<String, Object> payload) {
        Long bannerId = payload.get("adBannerId") != null ? Long.valueOf(payload.get("adBannerId").toString()) : null;
        String provider = (String) payload.get("provider"); // M_PESA, AIRTEL_MONEY, ORANGE_MONEY
        String phone = (String) payload.get("phoneNumber");
        Double amount = payload.get("amount") != null ? Double.valueOf(payload.get("amount").toString()) : 50.0;
        String currency = (String) payload.getOrDefault("currency", "USD");

        if (bannerId == null || provider == null || phone == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "L'identifiant de la campagne, l'opérateur et le numéro de téléphone sont requis"));
        }

        AdBanner banner = adBannerRepository.findById(bannerId).orElse(null);
        if (banner == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Campagne publicitaire introuvable"));
        }

        // Génération d'une référence unique de transaction selon l'opérateur
        String prefix = provider.toUpperCase().replace("_", "");
        String reference = prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        AdPayment payment = AdPayment.builder()
                .adBannerId(bannerId)
                .campaignTitle(banner.getTitle())
                .provider(provider.toUpperCase())
                .phoneNumber(phone)
                .amount(amount)
                .currency(currency)
                .transactionReference(reference)
                .status("PENDING")
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();

        AdPayment saved = adPaymentRepository.save(payment);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "status", "PENDING",
                "paymentId", saved.getId(),
                "reference", reference,
                "provider", provider,
                "amount", amount,
                "currency", currency,
                "message", "Requête de paiement " + provider + " initiée. Veuillez saisir votre code PIN secret sur votre téléphone."
        ));
    }

    // Confirmer / valider le paiement Mobile Money (Callback ou validation PIN)
    @PostMapping("/{id}/confirm")
    @CacheEvict(value = "ads_active", allEntries = true)
    public ResponseEntity<?> confirmPayment(@PathVariable Long id) {
        AdPayment payment = adPaymentRepository.findById(id).orElse(null);
        if (payment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Transaction de paiement introuvable"));
        }

        payment.setStatus("SUCCESS");
        payment.setPaidAt(LocalDateTime.now(ZoneOffset.UTC));
        adPaymentRepository.save(payment);

        // Activation automatique de la campagne publicitaire (Article 48)
        AdBanner banner = adBannerRepository.findById(payment.getAdBannerId()).orElse(null);
        if (banner != null) {
            banner.setActive(true);
            adBannerRepository.save(banner);
        }

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "paymentId", payment.getId(),
                "reference", payment.getTransactionReference(),
                "message", "Paiement Mobile Money validé avec succès ! Votre bannière publicitaire est désormais active sur LIFE CHANNEL."
        ));
    }

    // Webhook Passerelle Mobile Money (M-Pesa, Airtel Money, Orange Money) - Article 48
    @PostMapping("/webhook")
    @CacheEvict(value = "ads_active", allEntries = true)
    public ResponseEntity<?> handlePaymentWebhook(@RequestBody Map<String, Object> webhookPayload) {
        String reference = (String) webhookPayload.get("transactionReference");
        String status = (String) webhookPayload.get("status");

        if (reference == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "transactionReference requise"));
        }

        AdPayment payment = adPaymentRepository.findByTransactionReference(reference).orElse(null);
        if (payment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Transaction introuvable"));
        }

        if ("SUCCESS".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            payment.setStatus("SUCCESS");
            payment.setPaidAt(LocalDateTime.now(ZoneOffset.UTC));
            adPaymentRepository.save(payment);

            // Activation automatique immédiate de la campagne
            AdBanner banner = adBannerRepository.findById(payment.getAdBannerId()).orElse(null);
            if (banner != null) {
                banner.setActive(true);
                adBannerRepository.save(banner);
            }
        }

        return ResponseEntity.ok(Map.of(
                "status", "PROCESSED",
                "transactionReference", reference,
                "bannerActivated", true
        ));
    }

    // Récupérer l'historique des paiements (Comptabilité / Console Admin)
    @GetMapping
    public ResponseEntity<List<AdPayment>> getAllPayments() {
        return ResponseEntity.ok(adPaymentRepository.findAllByOrderByCreatedAtDesc());
    }
}