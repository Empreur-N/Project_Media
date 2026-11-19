package com.media.comment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "article_id", nullable = false)
    private Long articleId;

    @Column(nullable = false)
    private String username;

    @Column(name = "author_name")
    private String authorName;

    @Column(name = "user_role")
    private String userRole;

    @Column(name = "likes_count")
    @Builder.Default
    private int likesCount = 0;

    @Column(nullable = false, length = 2000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommentStatus status;

    @Column(name = "flag_count")
    @Builder.Default
    private int flagCount = 0;

    @Column(name = "parent_comment_id")
    private Long parentCommentId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = CommentStatus.APPROVED; // Par défaut, approuvé immédiatement dans cette version de démonstration
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
