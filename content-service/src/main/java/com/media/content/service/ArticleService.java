package com.media.content.service;

import com.media.content.model.Article;
import com.media.content.model.ArticleStatus;
import com.media.content.repository.ArticleRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Cacheable(value = "articles", key = "#category + '-' + #region + '-' + #status", unless = "#result.isEmpty()")
    public List<Article> getArticles(String category, String region, ArticleStatus status) {
        ArticleStatus targetStatus = (status != null) ? status : ArticleStatus.PUBLISHED;

        if (category != null && region != null) {
            return articleRepository.findByStatusAndCategoryAndRegionOrderByCreatedAtDesc(targetStatus, category, region);
        } else if (category != null) {
            return articleRepository.findByStatusAndCategoryOrderByCreatedAtDesc(targetStatus, category);
        } else if (region != null) {
            return articleRepository.findByStatusAndRegionOrderByCreatedAtDesc(targetStatus, region);
        } else {
            return articleRepository.findByStatusOrderByCreatedAtDesc(targetStatus);
        }
    }
}
