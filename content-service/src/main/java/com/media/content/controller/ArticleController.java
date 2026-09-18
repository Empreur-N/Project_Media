package com.media.content.controller;

import com.media.content.model.Article;
import com.media.content.model.ArticleStatus;
import com.media.content.model.AuditLog;
import com.media.content.repository.ArticleRepository;
import com.media.content.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contents")
public class ArticleController {

    private final ArticleRepository articleRepository;
    private final AuditLogRepository auditLogRepository;
    private final RabbitTemplate rabbitTemplate;
    private final RestClient restClient = RestClient.create();

    public ArticleController(
            ArticleRepository articleRepository, 
            AuditLogRepository auditLogRepository,
            RabbitTemplate rabbitTemplate) {
        this.articleRepository = articleRepository;
        this.auditLogRepository = auditLogRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    // Récupérer les articles (Public : affiche uniquement les PUBLISHED. Rôle interne : possibilité de filtrer par statut)
    @GetMapping("/articles")
    @Cacheable(value = "articles", key = "#category + '-' + #region + '-' + #status", unless = "#result.body.isEmpty()")
    public ResponseEntity<List<Article>> getArticles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) ArticleStatus status) {
        
        ArticleStatus targetStatus = (status != null) ? status : ArticleStatus.PUBLISHED;

        if (category != null && region != null) {
            return ResponseEntity.ok(articleRepository.findByStatusAndCategoryAndRegionOrderByCreatedAtDesc(targetStatus, category, region));
        } else if (category != null) {
            return ResponseEntity.ok(articleRepository.findByStatusAndCategoryOrderByCreatedAtDesc(targetStatus, category));
        } else if (region != null) {
            return ResponseEntity.ok(articleRepository.findByStatusAndRegionOrderByCreatedAtDesc(targetStatus, region));
        } else {
            return ResponseEntity.ok(articleRepository.findByStatusOrderByCreatedAtDesc(targetStatus));
        }
    }

    // Récupérer un article par ID
    @GetMapping("/articles/{id}")
    public ResponseEntity<?> getArticleById(@PathVariable Long id) {
        Article article = articleRepository.findById(id).orElse(null);
        if (article == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Article non trouvé"));
        }
        return ResponseEntity.ok(article);
    }

    // Récupérer les articles d'un auteur particulier
    @GetMapping("/articles/author/{username}")
    public ResponseEntity<List<Article>> getArticlesByAuthor(@PathVariable String username) {
        return ResponseEntity.ok(articleRepository.findByAuthorUsernameOrderByCreatedAtDesc(username));
    }

    // Créer un nouvel article (Initialisé à DRAFT)
    @PostMapping("/articles")
    @CacheEvict(value = "articles", allEntries = true)
    public ResponseEntity<?> createArticle(@Valid @RequestBody Article article, HttpServletRequest request) {
        article.setStatus(ArticleStatus.DRAFT);
        Article saved = articleRepository.save(article);

        // Enregistrement dans le journal d'audit légal (Règle 4)
        saveAuditLog(saved.getId(), saved.getTitle(), "CREATE", saved.getAuthorUsername(), extractIp(request), null, saved.getTitle(), null, saved.getContent(), null);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Modifier un article (Uniquement si DRAFT ou REVISION_REQUIRED)
    @PutMapping("/articles/{id}")
    @CacheEvict(value = "articles", allEntries = true)
    public ResponseEntity<?> updateArticle(
            @PathVariable Long id, 
            @Valid @RequestBody Article updatedArticle, 
            HttpServletRequest request) {
        Article existing = articleRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Article non trouvé"));
        }

        if (existing.getStatus() != ArticleStatus.DRAFT && existing.getStatus() != ArticleStatus.REVISION_REQUIRED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Impossible de modifier un article déjà soumis ou publié"));
        }

        String previousTextSnapshot = "Titre: " + existing.getTitle() + "\nRésumé: " + existing.getSummary() + "\nContenu: " + existing.getContent();

        existing.setTitle(updatedArticle.getTitle());
        existing.setSummary(updatedArticle.getSummary());
        existing.setContent(updatedArticle.getContent());
        existing.setCategory(updatedArticle.getCategory());
        existing.setRegion(updatedArticle.getRegion());
        existing.setTags(updatedArticle.getTags());
        if (updatedArticle.getMainImageUrl() != null) {
            existing.setMainImageUrl(updatedArticle.getMainImageUrl());
        }
        if (updatedArticle.getPublicationDate() != null) {
            existing.setPublicationDate(updatedArticle.getPublicationDate());
        }

        String previousTitleSnapshot = existing.getTitle();
        Article saved = articleRepository.save(existing);

        String newTextSnapshot = "Titre: " + saved.getTitle() + "\nRésumé: " + saved.getSummary() + "\nContenu: " + saved.getContent();
        // Sauvegarde de la trace légale avec snapshot de l'ancien texte et titre
        saveAuditLog(saved.getId(), saved.getTitle(), "UPDATE", saved.getAuthorUsername(), extractIp(request), previousTitleSnapshot, saved.getTitle(), previousTextSnapshot, newTextSnapshot, null);

        return ResponseEntity.ok(saved);
    }

    // Soumettre un article pour relecture (DRAFT/REVISION_REQUIRED ➔ SUBMITTED)
    @PostMapping("/articles/{id}/submit")
    @CacheEvict(value = "articles", allEntries = true)
    public ResponseEntity<?> submitArticle(@PathVariable Long id, HttpServletRequest request) {
        Article article = articleRepository.findById(id).orElse(null);
        if (article == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Article non trouvé"));
        }

        if (article.getStatus() != ArticleStatus.DRAFT && article.getStatus() != ArticleStatus.REVISION_REQUIRED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "L'article n'est pas dans un état modifiable"));
        }

        ArticleStatus prevStatus = article.getStatus();
        article.setStatus(ArticleStatus.SUBMITTED);
        Article saved = articleRepository.save(article);

        saveAuditLog(saved.getId(), saved.getTitle(), "SUBMIT", saved.getAuthorUsername(), extractIp(request), saved.getTitle(), saved.getTitle(), "Statut: " + prevStatus, "Statut: SUBMITTED", null);

        return ResponseEntity.ok(saved);
    }

    // Évaluer / valider un article (SUBMITTED ➔ APPROVED / PUBLISHED / REVISION_REQUIRED)
    @PostMapping("/articles/{id}/review")
    @CacheEvict(value = "articles", allEntries = true)
    public ResponseEntity<?> reviewArticle(
            @PathVariable Long id,
            @RequestParam ArticleStatus action,
            @RequestParam String reviewerUsername,
            @RequestParam(required = false) String rejectionReason,
            HttpServletRequest request) {
        
        Article article = articleRepository.findById(id).orElse(null);
        if (article == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Article non trouvé"));
        }

        if (article.getStatus() != ArticleStatus.SUBMITTED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "L'article doit être soumis pour révision"));
        }

        if (action != ArticleStatus.PUBLISHED && action != ArticleStatus.APPROVED && action != ArticleStatus.REVISION_REQUIRED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Statut de révision invalide"));
        }

        ArticleStatus prevStatus = article.getStatus();
        article.setStatus(action);
        article.setReviewerUsername(reviewerUsername);
        
        if (action == ArticleStatus.PUBLISHED) {
            // Stockage strict en UTC (Règle 1)
            article.setPublicationDate(LocalDateTime.now(ZoneOffset.UTC));
        }

        Article saved = articleRepository.save(article);

        // Journalisation de la validation éditoriale avec motif de rejet éventuel
        saveAuditLog(saved.getId(), saved.getTitle(), "REVIEW_" + action, reviewerUsername, extractIp(request), saved.getTitle(), saved.getTitle(), "Statut: " + prevStatus, "Nouveau Statut: " + action, rejectionReason);

        // Indexer l'article et envoyer une notification RabbitMQ s'il est publié
        if (saved.getStatus() == ArticleStatus.PUBLISHED) {
            // 1. Indexation Search
            try {
                restClient.post()
                        .uri("http://localhost:8085/api/search/index")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(saved)
                        .retrieve()
                        .toBodilessEntity();
            } catch (Exception e) {
                System.err.println("Échec de l'indexation de l'article dans le Search Service: " + e.getMessage());
            }

            // 2. Envoi de notification asynchrone via RabbitMQ
            try {
                Map<String, String> notifPayload = Map.of(
                        "title", "Nouvel article publié !",
                        "body", "L'article \"" + saved.getTitle() + "\" vient d'être mis en ligne.",
                        "recipient", "" // broadcast
                );
                rabbitTemplate.convertAndSend("notificationQueue", notifPayload);
            } catch (Exception e) {
                System.err.println("Échec d'envoi du message RabbitMQ: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(saved);
    }

    // Récupérer l'historique d'audit d'un article spécifique (Directeur de publication / Editeur)
    @GetMapping("/articles/{id}/audit")
    public ResponseEntity<List<AuditLog>> getArticleAuditLogs(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogRepository.findByArticleIdOrderByTimestampDesc(id));
    }

    // Récupérer l'ensemble des logs légaux de la rédaction
    @GetMapping("/audit")
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    // Helper : Enregistrement dans la table article_audit_logs
    private void saveAuditLog(Long articleId, String title, String action, String author, String ip,
                              String prevTitle, String newTitle,
                              String prevContent, String newContent,
                              String rejectionReason) {
        try {
            AuditLog log = AuditLog.builder()
                    .articleId(articleId)
                    .articleTitle(title)
                    .action(action)
                    .authorUsername(author)
                    .ipAddress(ip)
                    .previousTitle(prevTitle)
                    .newTitle(newTitle)
                    .previousContent(prevContent)
                    .newContent(newContent)
                    .rejectionReason(rejectionReason)
                    .timestamp(LocalDateTime.now(ZoneOffset.UTC))
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Échec enregistrement log audit: " + e.getMessage());
        }
    }

    // Helper : Extraction de l'adresse IP du client
    private String extractIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
