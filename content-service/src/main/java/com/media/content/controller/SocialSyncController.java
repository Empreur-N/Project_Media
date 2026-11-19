package com.media.content.controller;

import com.media.content.dto.SocialSyncRequest;
import com.media.content.model.Article;
import com.media.content.service.SocialSyncService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contents/social-sync")
public class SocialSyncController {

    private final SocialSyncService socialSyncService;

    public SocialSyncController(SocialSyncService socialSyncService) {
        this.socialSyncService = socialSyncService;
    }

    private boolean isAuthorized(String headerKey, String queryKey, HttpServletRequest request) {
        String expected = socialSyncService.getSyncSecret();
        if (expected == null || expected.trim().isEmpty()) {
            return true;
        }
        if (expected.equals(headerKey) || expected.equals(queryKey)) {
            return true;
        }
        // Permettre également l'accès si un Bearer token d'administration est fourni
        String authHeader = request.getHeader("Authorization");
        return authHeader != null && authHeader.startsWith("Bearer ");
    }

    /**
     * Webhook d'ingestion pour Facebook, TikTok, YouTube, Instagram
     */
    @PostMapping
    public ResponseEntity<?> ingestPost(
            @RequestHeader(value = "X-Social-Sync-Key", required = false) String headerKey,
            @RequestParam(value = "key", required = false) String queryKey,
            @RequestBody SocialSyncRequest req,
            HttpServletRequest request) {

        if (!isAuthorized(headerKey, queryKey, request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Clé de synchronisation 'X-Social-Sync-Key' invalide ou absente."));
        }

        try {
            Article saved = socialSyncService.ingestSocialPost(req);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Publication " + req.getNetwork() + " synchronisée avec succès !");
            response.put("articleId", saved.getId());
            response.put("title", saved.getTitle());
            response.put("status", saved.getStatus());
            response.put("publicationDate", saved.getPublicationDate());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la synchronisation : " + e.getMessage()));
        }
    }

    /**
     * Déclenchement manuel de la synchronisation YouTube
     */
    @PostMapping("/pull-youtube")
    public ResponseEntity<?> pullYouTube(
            @RequestHeader(value = "X-Social-Sync-Key", required = false) String headerKey,
            @RequestParam(value = "key", required = false) String queryKey,
            @RequestParam(value = "channelId", required = false) String channelId,
            HttpServletRequest request) {

        if (!isAuthorized(headerKey, queryKey, request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Clé de synchronisation 'X-Social-Sync-Key' invalide ou absente."));
        }

        int count = socialSyncService.syncYouTubeFeed(channelId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "importedCount", count,
                "message", count + " nouvelle(s) vidéo(s) synchronisée(s) depuis YouTube."
        ));
    }

    /**
     * Statut des passerelles et documentation d'intégration
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("gateway", "Life Channel Social Synchronization Gateway");
        status.put("status", "ACTIVE");
        status.put("supportedNetworks", new String[]{"YOUTUBE", "FACEBOOK", "TIKTOK", "INSTAGRAM", "X"});
        status.put("webhookEndpoint", "https://lifechannelmedia.com/api/contents/social-sync");
        status.put("authHeader", "X-Social-Sync-Key");
        status.put("documentation", "Envoyez une requête POST en JSON dès qu'une publication est mise en ligne sur vos réseaux pour qu'elle s'affiche instantanément sur le site.");
        return ResponseEntity.ok(status);
    }
}
