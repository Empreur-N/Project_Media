package com.media.comment.repository;

import com.media.comment.model.Comment;
import com.media.comment.model.CommentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByArticleIdAndStatusOrderByCreatedAtDesc(Long articleId, CommentStatus status);
    List<Comment> findByFlagCountGreaterThanOrderByFlagCountDesc(int minFlags);
}
