package com.media.podcast.controller;

import com.media.podcast.model.Episode;
import com.media.podcast.repository.EpisodeRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/podcasts")
public class PodcastController {

    private final EpisodeRepository episodeRepository;
    private final MongoTemplate mongoTemplate;

    public PodcastController(EpisodeRepository episodeRepository, MongoTemplate mongoTemplate) {
        this.episodeRepository = episodeRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // Récupérer les épisodes (avec filtres optionnels par émission ou catégorie)
    @GetMapping("/episodes")
    public ResponseEntity<List<Episode>> getEpisodes(
            @RequestParam(required = false) String showTitle,
            @RequestParam(required = false) String category) {
        
        if (showTitle != null && !showTitle.trim().isEmpty()) {
            return ResponseEntity.ok(episodeRepository.findByShowTitleOrderByPublishDateDesc(showTitle));
        } else if (category != null && !category.trim().isEmpty()) {
            return ResponseEntity.ok(episodeRepository.findByCategoryOrderByPublishDateDesc(category));
        } else {
            return ResponseEntity.ok(episodeRepository.findAllByOrderByPublishDateDesc());
        }
    }

    // Récupérer un seul épisode par son identifiant
    @GetMapping("/episodes/{id}")
    public ResponseEntity<?> getEpisodeById(@PathVariable String id) {
        Episode episode = episodeRepository.findById(id).orElse(null);
        if (episode == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Épisode de podcast introuvable"));
        }
        return ResponseEntity.ok(episode);
    }

    // Créer un nouvel épisode
    @PostMapping("/episodes")
    public ResponseEntity<?> createEpisode(@RequestBody Episode episode) {
        if (episode.getTitle() == null || episode.getAudioUrl() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Le titre et l'adresse audio sont requis"));
        }
        
        episode.setPublishDate(LocalDateTime.now());
        Episode saved = episodeRepository.save(episode);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Récupérer toutes les émissions distinctes
    @GetMapping("/shows")
    public ResponseEntity<List<String>> getShows() {
        try {
            List<String> distinctShows = mongoTemplate.query(Episode.class)
                    .distinct("showTitle")
                    .as(String.class)
                    .all()
                    .stream()
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .toList();
            return ResponseEntity.ok(distinctShows);
        } catch (Exception e) {
            // Fallback si la collection est vide ou erreur
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
}
