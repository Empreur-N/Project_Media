package com.media.notification.controller;

import com.media.notification.model.InternalMessage;
import com.media.notification.model.InternalMessageReply;
import com.media.notification.model.Notification;
import com.media.notification.repository.InternalMessageRepository;
import com.media.notification.repository.InternalMessageReplyRepository;
import com.media.notification.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications/messages")
public class InternalMessageController {

    private final InternalMessageRepository internalMessageRepository;
    private final InternalMessageReplyRepository internalMessageReplyRepository;
    private final NotificationRepository notificationRepository;

    public InternalMessageController(InternalMessageRepository internalMessageRepository,
                                     InternalMessageReplyRepository internalMessageReplyRepository,
                                     NotificationRepository notificationRepository) {
        this.internalMessageRepository = internalMessageRepository;
        this.internalMessageReplyRepository = internalMessageReplyRepository;
        this.notificationRepository = notificationRepository;
    }

    // Récupérer la liste des échanges internes (filtrable par catégorie : TECH_SUPPORT, EDITORIAL, GENERAL)
    @GetMapping
    public ResponseEntity<List<InternalMessage>> getMessages(@RequestParam(required = false) String category) {
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("ALL")) {
            return ResponseEntity.ok(internalMessageRepository.findByCategoryOrderByCreatedAtDesc(category.trim()));
        }
        return ResponseEntity.ok(internalMessageRepository.findAllByOrderByCreatedAtDesc());
    }

    // Envoyer un nouveau message interne ou signalement support
    @PostMapping
    public ResponseEntity<?> createMessage(@RequestBody Map<String, String> payload) {
        String sender = payload.get("senderUsername");
        String role = payload.get("senderRole");
        String recipient = payload.get("recipientUsername");
        String subject = payload.get("subject");
        String content = payload.get("content");
        String category = payload.getOrDefault("category", "TECH_SUPPORT");

        if (sender == null || subject == null || content == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Expéditeur, sujet et contenu requis"));
        }

        InternalMessage msg = InternalMessage.builder()
                .senderUsername(sender)
                .senderRole(role != null ? role : "COLLABORATOR")
                .recipientUsername(recipient)
                .subject(subject.trim())
                .content(content.trim())
                .category(category)
                .isResolved(false)
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();

        InternalMessage saved = internalMessageRepository.save(msg);

        // Si c'est un signalement de support technique ou un message adressé, générer une notification pour la direction
        try {
            String notifTitle = "TECH_SUPPORT".equals(category) 
                    ? "Support technique : " + sender 
                    : "Message interne de " + sender;
            String snippet = content.length() > 90 ? content.substring(0, 90) + "..." : content;
            
            Notification notif = Notification.builder()
                    .title(notifTitle)
                    .message(subject + " — " + snippet)
                    .recipientUsername(recipient) // null = notification générale direction/admin
                    .isRead(false)
                    .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                    .build();
            notificationRepository.save(notif);
        } catch (Exception e) {
            System.err.println("Erreur notification message interne: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Marquer un incident / message comme résolu ou en cours
    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> toggleResolve(@PathVariable Long id) {
        InternalMessage msg = internalMessageRepository.findById(id).orElse(null);
        if (msg == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Message non trouvé"));
        }

        msg.setResolved(!msg.isResolved());
        InternalMessage updated = internalMessageRepository.save(msg);
        return ResponseEntity.ok(updated);
    }

    // Répondre directement à un message / donner des instructions à un agent
    @PostMapping("/{id}/replies")
    public ResponseEntity<?> addReply(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        InternalMessage msg = internalMessageRepository.findById(id).orElse(null);
        if (msg == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Message non trouvé"));
        }

        String sender = (String) payload.get("senderUsername");
        String role = (String) payload.get("senderRole");
        String content = (String) payload.get("content");
        
        Object markResolvedObj = payload.get("markResolved");
        boolean markResolved = false;
        if (markResolvedObj instanceof Boolean) {
            markResolved = (Boolean) markResolvedObj;
        } else if (markResolvedObj != null) {
            markResolved = Boolean.parseBoolean(markResolvedObj.toString());
        }

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Le contenu de la réponse est requis"));
        }

        InternalMessageReply reply = InternalMessageReply.builder()
                .message(msg)
                .senderUsername(sender != null ? sender.trim() : "Direction")
                .senderRole(role != null ? role : "ADMIN")
                .content(content.trim())
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();

        InternalMessageReply savedReply = internalMessageReplyRepository.save(reply);

        if (markResolved && !msg.isResolved()) {
            msg.setResolved(true);
            internalMessageRepository.save(msg);
        }

        // Notification envoyée directement à l'agent émetteur
        try {
            if (msg.getSenderUsername() != null && !msg.getSenderUsername().equalsIgnoreCase(sender)) {
                String snippet = content.length() > 90 ? content.substring(0, 90) + "..." : content;
                String roleLabel = role != null && !role.isBlank() ? role : "Direction";
                Notification notif = Notification.builder()
                        .title("Réponse Direction (" + roleLabel + ")")
                        .message("À propos de \"" + msg.getSubject() + "\" : " + snippet)
                        .recipientUsername(msg.getSenderUsername())
                        .isRead(false)
                        .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                        .build();
                notificationRepository.save(notif);
            }
        } catch (Exception e) {
            System.err.println("Erreur notification réponse: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedReply);
    }
}
