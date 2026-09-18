package com.media.notification.controller;

import com.media.notification.model.Notification;
import com.media.notification.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final List<SseEmitter> sseEmitters = new CopyOnWriteArrayList<>();

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Canal SSE en temps réel pour le flux Breaking News (Règle 2)
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamBreakingNews() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        sseEmitters.add(emitter);
        emitter.onCompletion(() -> sseEmitters.remove(emitter));
        emitter.onTimeout(() -> sseEmitters.remove(emitter));
        emitter.onError((e) -> sseEmitters.remove(emitter));
        return emitter;
    }

    // Récupérer le flux de notifications d'un utilisateur
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam String username) {
        List<Notification> notifications = notificationRepository
                .findByRecipientUsernameOrRecipientUsernameIsNullOrderByCreatedAtDesc(username);
        return ResponseEntity.ok(notifications);
    }

    // Marquer une notification comme lue
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Notification introuvable"));
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("message", "Notification marquée comme lue"));
    }

    // Publication d'une "Alerte Info" (Breaking News) diffusée en direct à tous les connectés sans F5
    @PostMapping("/breaking")
    public ResponseEntity<?> publishBreakingNews(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String message = payload.get("message");
        String articleId = payload.get("articleId");

        if (title == null || message == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Le titre et le message de l'alerte sont requis"));
        }

        // 1. Enregistrement en base
        Notification notification = Notification.builder()
                .title("🔴 ALERTE INFO : " + title)
                .message(message)
                .recipientUsername(null) // Diffusion globale
                .isRead(false)
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();

        Notification saved = notificationRepository.save(notification);

        // 2. Diffusion instantanée en temps réel via le canal SSE à tous les lecteurs
        Map<String, Object> ssePayload = Map.of(
                "type", "BREAKING_NEWS",
                "id", saved.getId(),
                "title", title,
                "message", message,
                "articleId", articleId != null ? articleId : "",
                "timestamp", LocalDateTime.now(ZoneOffset.UTC).toString()
        );

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : sseEmitters) {
            try {
                emitter.send(SseEmitter.event().name("breaking-news").data(ssePayload));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        sseEmitters.removeAll(deadEmitters);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "status", "PUBLISHED",
                "activeReaders", sseEmitters.size(),
                "alert", saved
        ));
    }

    // Envoyer manuellement une notification générale (Broadcast)
    @PostMapping("/broadcast")
    public ResponseEntity<?> broadcast(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String message = payload.get("message");

        if (title == null || message == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Le titre et le message sont requis"));
        }

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .recipientUsername(null) // Broadcast
                .isRead(false)
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();

        Notification saved = notificationRepository.save(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
