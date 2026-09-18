package com.media.ad.repository;

import com.media.ad.model.AdBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AdBannerRepository extends JpaRepository<AdBanner, Long> {
    List<AdBanner> findByPlacementAndActiveTrue(String placement);
}
