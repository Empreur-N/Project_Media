package com.media.content.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "article_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "article_id", nullable = false)
    private Long articleId;

    @Column(name = "article_title")
    private String articleTitle;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, SUBMIT, REVIEW, DELETE

    @Column(name = "author_username")
    private String authorUsername;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "previous_title")
    private String previousTitle;

    @Column(name = "new_title")
    private String newTitle;

    @Column(name = "previous_content", columnDefinition = "TEXT")
    private String previousContent;

    @Column(name = "new_content", columnDefinition = "TEXT")
    private String newContent;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason; // Motifs de refus en cas de rejet

    @Column(nullable = false)
    private LocalDateTime timestamp;
}