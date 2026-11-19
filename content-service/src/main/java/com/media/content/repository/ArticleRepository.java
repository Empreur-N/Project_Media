package com.media.content.repository;

import com.media.content.model.Article;
import com.media.content.model.ArticleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    List<Article> findByStatusOrderByCreatedAtDesc(ArticleStatus status);
    List<Article> findByAuthorUsernameOrderByCreatedAtDesc(String authorUsername);
    List<Article> findByStatusAndCategoryOrderByCreatedAtDesc(ArticleStatus status, String category);
    List<Article> findByStatusAndRegionOrderByCreatedAtDesc(ArticleStatus status, String region);
    List<Article> findByStatusAndCategoryAndRegionOrderByCreatedAtDesc(ArticleStatus status, String category, String region);
    boolean existsByTitle(String title);
    boolean existsByTagsContaining(String tagPart);
    List<Article> findByTagsContainingOrderByCreatedAtDesc(String tagPart);
}
