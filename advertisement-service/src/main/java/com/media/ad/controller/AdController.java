package com.media.ad.controller;

import com.media.ad.model.AdBanner;
import com.media.ad.repository.AdBannerRepository;
import com.media.ad.service.AdService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ads")
public class AdController {

    private final AdBannerRepository adBannerRepository;
    private final AdService adService;

    public AdController(AdBannerRepository adBannerRepository, AdService adService) {
        this.adBannerRepository = adBannerRepository;
        this.adService = adService;
    }

    // Récupérer les publicités actives pour un emplacement spécifique
    @GetMapping("/active")
    public ResponseEntity<List<AdBanner>> getActiveAds(@RequestParam String placement) {
        List<AdBanner> banners = adService.getActiveAds(placement);
        return ResponseEntity.ok(banners);
    }

    // Récupérer toutes les publicités (pour la console admin)
    @GetMapping
    public ResponseEntity<List<AdBanner>> getAllAds() {
        return ResponseEntity.ok(adBannerRepository.findAll());
    }

    // Créer une nouvelle campagne publicitaire
    @PostMapping
    @CacheEvict(value = "ads_active", allEntries = true)
    public ResponseEntity<?> createAd(@RequestBody AdBanner adBanner) {
        if (adBanner.getTitle() == null || adBanner.getTargetUrl() == null || adBanner.getImageUrl() == null || adBanner.getPlacement() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tous les champs (titre, URL cible, URL image, emplacement) sont requis"));
        }
        adBanner.setActive(true);
        adBanner.setClickCount(0);
        adBanner.setImpressionCount(0);
        AdBanner saved = adBannerRepository.save(adBanner);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Comptabiliser un clic sur une publicité
    @PostMapping("/{id}/click")
    public ResponseEntity<?> trackClick(@PathVariable Long id) {
        AdBanner banner = adBannerRepository.findById(id).orElse(null);
        if (banner == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Publicité introuvable"));
        }

        banner.setClickCount(banner.getClickCount() + 1);
        adBannerRepository.save(banner);
        return ResponseEntity.ok(Map.of(
                "message", "Clic comptabilisé avec succès",
                "clicks", banner.getClickCount()
        ));
    }
}
