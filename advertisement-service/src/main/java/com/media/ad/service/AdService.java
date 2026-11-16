package com.media.ad.service;

import com.media.ad.model.AdBanner;
import com.media.ad.repository.AdBannerRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdService {

    private final AdBannerRepository adBannerRepository;

    public AdService(AdBannerRepository adBannerRepository) {
        this.adBannerRepository = adBannerRepository;
    }

    @Cacheable(value = "ads_active", key = "#placement", unless = "#result.isEmpty()")
    public List<AdBanner> getActiveAds(String placement) {
        return adBannerRepository.findByPlacementAndActiveTrue(placement);
    }
}
