package com.media.analytics.controller;

import com.media.analytics.model.PageView;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final MongoTemplate mongoTemplate;

    public AnalyticsController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    // Tracer une vue d'article
    @PostMapping("/track")
    public ResponseEntity<?> trackPageView(@RequestBody PageView pageView) {
        pageView.setViewDate(LocalDateTime.now());
        PageView saved = mongoTemplate.save(pageView);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Récupérer le classement des 5 articles les plus populaires (Agrégation MongoDB)
    @GetMapping("/reports/popular")
    public ResponseEntity<List<Map>> getPopularArticles() {
        // 1. Regrouper par articleId et titre d'article, et compter le nombre de vues
        GroupOperation groupByArticle = Aggregation.group("articleId", "title")
                .count().as("viewCount");

        // 2. Trier par nombre de vues décroissant
        SortOperation sortByViewsDesc = Aggregation.sort(Sort.by(Sort.Direction.DESC, "viewCount"));

        // 3. Limiter aux 5 premiers résultats
        LimitOperation limitToFive = Aggregation.limit(5);

        // 4. Mappage des champs pour la sortie
        ProjectionOperation projectFields = Aggregation.project()
                .andExpression("viewCount").as("viewCount")
                .andExpression("_id.articleId").as("articleId")
                .andExpression("_id.title").as("title")
                .andExclude("_id");

        Aggregation aggregation = Aggregation.newAggregation(
                groupByArticle,
                sortByViewsDesc,
                limitToFive,
                projectFields
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "page_views", Map.class);
        return ResponseEntity.ok(results.getMappedResults());
    }
}
