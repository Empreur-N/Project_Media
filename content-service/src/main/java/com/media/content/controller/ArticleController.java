package com.media.content.controller;

import com.media.content.model.Article;
import com.media.content.model.ArticleStatus;
import com.media.content.model.AuditLog;
import com.media.content.repository.ArticleRepository;
import com.media.content.repository.AuditLogRepository;
import com.media.content.service.ArticleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.CacheEvict;
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
    private final ArticleService articleService;
    private final RestClient restClient = RestClient.create();

    public ArticleController(
            ArticleRepository articleRepository, 
            AuditLogRepository auditLogRepository,
            RabbitTemplate rabbitTemplate,
            ArticleService articleService) {
        this.articleRepository = articleRepository;
        this.auditLogRepository = auditLogRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.articleService = articleService;
    }

    // Récupérer les articles (Public : affiche uniquement les PUBLISHED. Rôle interne : possibilité de filtrer par statut)
    @GetMapping("/articles")
    public ResponseEntity<List<Article>> getArticles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) ArticleStatus status) {
        return ResponseEntity.ok(articleService.getArticles(category, region, status));
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

    // Créer un nouvel article (Support de publication immédiate en ligne ou brouillon)
    @PostMapping("/articles")
    @CacheEvict(value = "articles", allEntries = true)
    public ResponseEntity<?> createArticle(@Valid @RequestBody Article article, HttpServletRequest request) {
        boolean isDirectPublish = article.getStatus() == ArticleStatus.PUBLISHED;
        if (isDirectPublish) {
            article.setStatus(ArticleStatus.PUBLISHED);
            article.setPublicationDate(LocalDateTime.now(ZoneOffset.UTC));
        } else {
            article.setStatus(ArticleStatus.DRAFT);
        }

        Article saved = articleRepository.save(article);

        // Enregistrement dans le journal d'audit légal (Règle 4)
        saveAuditLog(saved.getId(), saved.getTitle(), isDirectPublish ? "DIRECT_PUBLISH" : "CREATE", saved.getAuthorUsername(), extractIp(request), null, saved.getTitle(), null, saved.getContent(), null);

        if (isDirectPublish) {
            notifyArticlePublished(saved);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Publication immédiate d'un article par le journaliste / rédacteur
    @PostMapping("/articles/{id}/publish")
    @CacheEvict(value = "articles", allEntries = true)
    public ResponseEntity<?> publishArticleDirectly(@PathVariable Long id, HttpServletRequest request) {
        Article article = articleRepository.findById(id).orElse(null);
        if (article == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Article non trouvé"));
        }

        ArticleStatus prevStatus = article.getStatus();
        article.setStatus(ArticleStatus.PUBLISHED);
        article.setPublicationDate(LocalDateTime.now(ZoneOffset.UTC));
        Article saved = articleRepository.save(article);

        saveAuditLog(saved.getId(), saved.getTitle(), "DIRECT_PUBLISH", saved.getAuthorUsername(), extractIp(request), saved.getTitle(), saved.getTitle(), "Statut: " + prevStatus, "Statut: PUBLISHED", null);

        notifyArticlePublished(saved);

        return ResponseEntity.ok(saved);
    }

    // Modifier un article (Permet de modifier brouillon, article soumis ou article déjà publié pour mise à jour/photo)
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

        // Si l'article est déjà en ligne, réindexer immédiatement la recherche
        if (saved.getStatus() == ArticleStatus.PUBLISHED) {
            notifyArticlePublished(saved);
        }

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

        // Indexer l'article et notifier la direction s'il est publié
        if (saved.getStatus() == ArticleStatus.PUBLISHED) {
            notifyArticlePublished(saved);
        }

        return ResponseEntity.ok(saved);
    }

    private void notifyArticlePublished(Article saved) {
        // 1. Indexation Search
        try {
            restClient.post()
                    .uri("http://search-service:8085/api/search/index")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(saved)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("Échec indexation search: " + e.getMessage());
        }

        // 2. Notification asynchrone pour la Direction et les Administrateurs
        try {
            String author = (saved.getAuthorUsername() != null && !saved.getAuthorUsername().isEmpty()) 
                    ? saved.getAuthorUsername() 
                    : "la rédaction";
            Map<String, String> notifPayload = Map.of(
                    "title", "Nouvel article publié par " + author,
                    "body", "Le journaliste " + author + " vient de publier : \"" + saved.getTitle() + "\" (" + saved.getCategory() + ").",
                    "recipient", "" // diffusion générale direction & équipe
            );
            rabbitTemplate.convertAndSend("notificationQueue", notifPayload);
        } catch (Exception e) {
            System.err.println("Échec d'envoi du message RabbitMQ: " + e.getMessage());
        }
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
