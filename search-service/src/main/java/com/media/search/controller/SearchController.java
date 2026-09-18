package com.media.search.controller;

import com.media.search.model.IndexedArticle;
import com.media.search.repository.SearchRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchRepository searchRepository;
    private final MongoTemplate mongoTemplate;

    public SearchController(SearchRepository searchRepository, MongoTemplate mongoTemplate) {
        this.searchRepository = searchRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // Indexer ou mettre à jour un article dans MongoDB
    @PostMapping("/index")
    public ResponseEntity<?> indexArticle(@RequestBody IndexedArticle article) {
        IndexedArticle saved = searchRepository.save(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Retirer un article de l'index
    @DeleteMapping("/index/{id}")
    public ResponseEntity<?> deleteArticleIndex(@PathVariable Long id) {
        if (searchRepository.existsById(id)) {
            searchRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Article retiré de l'index"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Article non trouvé dans l'index"));
    }

    // Moteur de recherche plein texte dynamique
    @GetMapping
    public ResponseEntity<List<IndexedArticle>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String region) {

        Query query = new Query();

        // 1. Recherche par mot-clé (dans Titre, Résumé, Contenu et Tags)
        if (q != null && !q.trim().isEmpty()) {
            String regexPattern = ".*" + q.trim() + ".*";
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("title").regex(regexPattern, "i"),
                    Criteria.where("summary").regex(regexPattern, "i"),
                    Criteria.where("content").regex(regexPattern, "i"),
                    Criteria.where("tags").regex(regexPattern, "i")
            );
            query.addCriteria(searchCriteria);
        }

        // 2. Filtre par catégorie
        if (category != null && !category.trim().isEmpty()) {
            query.addCriteria(Criteria.where("category").is(category));
        }

        // 3. Filtre par région
        if (region != null && !region.trim().isEmpty()) {
            query.addCriteria(Criteria.where("region").is(region));
        }

        // Tri par date de publication décroissante
        query.with(Sort.by(Sort.Direction.DESC, "publicationDate"));

        List<IndexedArticle> results = mongoTemplate.find(query, IndexedArticle.class);
        return ResponseEntity.ok(results);
    }
}
