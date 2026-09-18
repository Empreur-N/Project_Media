package com.media.ad.repository;

import com.media.ad.model.AdPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdPaymentRepository extends JpaRepository<AdPayment, Long> {
    List<AdPayment> findByAdBannerId(Long adBannerId);
    Optional<AdPayment> findByTransactionReference(String transactionReference);
    List<AdPayment> findAllByOrderByCreatedAtDesc();
}