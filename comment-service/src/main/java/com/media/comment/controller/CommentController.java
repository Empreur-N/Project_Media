package com.media.comment.controller;

import com.media.comment.model.Comment;
import com.media.comment.model.CommentStatus;
import com.media.comment.repository.CommentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentRepository commentRepository;

    public CommentController(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    // Récupérer les commentaires approuvés pour un article
    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<Comment>> getCommentsByArticle(@PathVariable Long articleId) {
        List<Comment> comments = commentRepository.findByArticleIdAndStatusOrderByCreatedAtDesc(articleId, CommentStatus.APPROVED);
        return ResponseEntity.ok(comments);
    }

    // Publier un nouveau commentaire
    @PostMapping
    public ResponseEntity<?> createComment(@Valid @RequestBody Comment comment) {
        comment.setStatus(CommentStatus.APPROVED); // Approuvé par défaut
        comment.setFlagCount(0);
        if (comment.getLikesCount() < 0) {
            comment.setLikesCount(0);
        }
        if (comment.getAuthorName() == null || comment.getAuthorName().trim().isEmpty()) {
            comment.setAuthorName(comment.getUsername());
        }
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Aimer un commentaire (Like)
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeComment(@PathVariable Long id) {
        Comment comment = commentRepository.findById(id).orElse(null);
        if (comment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Commentaire non trouvé"));
        }
        comment.setLikesCount(comment.getLikesCount() + 1);
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.ok(Map.of("likesCount", saved.getLikesCount()));
    }

    // Supprimer/Désactiver son propre commentaire (Soft Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        Comment comment = commentRepository.findById(id).orElse(null);
        if (comment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Commentaire non trouvé"));
        }

        comment.setStatus(CommentStatus.DELETED);
        commentRepository.save(comment);

        return ResponseEntity.ok(Map.of("message", "Commentaire supprimé avec succès"));
    }

    // Signaler un commentaire abusif
    @PostMapping("/{id}/flag")
    public ResponseEntity<?> flagComment(@PathVariable Long id) {
        Comment comment = commentRepository.findById(id).orElse(null);
        if (comment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Commentaire non trouvé"));
        }

        comment.setFlagCount(comment.getFlagCount() + 1);
        
        // Règle automatique : si plus de 5 signalements, l'article passe à PENDING (caché du public)
        if (comment.getFlagCount() >= 5) {
            comment.setStatus(CommentStatus.PENDING);
        }

        commentRepository.save(comment);
        return ResponseEntity.ok(Map.of(
                "message", "Commentaire signalé avec succès",
                "flagCount", comment.getFlagCount(),
                "status", comment.getStatus().name()
        ));
    }

    // Récupérer les commentaires nécessitant modération (signalés, ou PENDING)
    @GetMapping("/moderation")
    public ResponseEntity<List<Comment>> getCommentsForModeration() {
        // Renvoie les commentaires ayant reçu au moins 1 signalement
        List<Comment> flagged = commentRepository.findByFlagCountGreaterThanOrderByFlagCountDesc(0);
        return ResponseEntity.ok(flagged);
    }

    // Modérer un commentaire (Approuver ou Rejeter)
    @PutMapping("/{id}/moderate")
    public ResponseEntity<?> moderateComment(
            @PathVariable Long id,
            @RequestParam CommentStatus action) {
        
        Comment comment = commentRepository.findById(id).orElse(null);
        if (comment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Commentaire non trouvé"));
        }

        if (action != CommentStatus.APPROVED && action != CommentStatus.REJECTED && action != CommentStatus.DELETED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Action de modération invalide"));
        }

        comment.setStatus(action);
        if (action == CommentStatus.APPROVED) {
            comment.setFlagCount(0); // Réinitialiser le compteur sur approbation
        }

        commentRepository.save(comment);
        return ResponseEntity.ok(Map.of(
                "message", "Commentaire modéré avec succès",
                "newStatus", comment.getStatus().name()
        ));
    }
}
