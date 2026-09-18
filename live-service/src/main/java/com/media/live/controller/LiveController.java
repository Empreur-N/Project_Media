package com.media.live.controller;

import com.media.live.model.LiveStatus;
import com.media.live.model.LiveStream;
import com.media.live.repository.LiveStreamRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lives")
public class LiveController {

    private final LiveStreamRepository liveStreamRepository;

    public LiveController(LiveStreamRepository liveStreamRepository) {
        this.liveStreamRepository = liveStreamRepository;
    }

    // Récupérer le direct en cours de diffusion (un seul direct actif à la fois)
    @GetMapping("/active")
    public ResponseEntity<?> getActiveLive() {
        List<LiveStream> activeLives = liveStreamRepository.findByStatusOrderByStartTimeAsc(LiveStatus.LIVE);
        if (activeLives.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "Aucun direct en cours de diffusion"));
        }
        return ResponseEntity.ok(activeLives.get(0));
    }

    // Récupérer la liste des directs planifiés (à venir)
    @GetMapping("/upcoming")
    public ResponseEntity<List<LiveStream>> getUpcomingLives() {
        List<LiveStream> upcoming = liveStreamRepository.findByStatusOrderByStartTimeAsc(LiveStatus.UPCOMING);
        return ResponseEntity.ok(upcoming);
    }

    // Récupérer tout l'historique des directs (tous statuts confondus)
    @GetMapping
    public ResponseEntity<List<LiveStream>> getAllLives() {
        return ResponseEntity.ok(liveStreamRepository.findAllByOrderByStartTimeDesc());
    }

    // Programmer un direct
    @PostMapping
    public ResponseEntity<?> scheduleLive(@Valid @RequestBody LiveStream liveStream) {
        if (liveStream.getStatus() == null) {
            liveStream.setStatus(LiveStatus.UPCOMING);
        }
        LiveStream saved = liveStreamRepository.save(liveStream);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Modifier le statut du direct (Démarrer LIVE ou Clore ENDED)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateLiveStatus(
            @PathVariable Long id,
            @RequestParam LiveStatus status) {
        
        LiveStream live = liveStreamRepository.findById(id).orElse(null);
        if (live == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Direct introuvable"));
        }

        // Si on lance un direct, on passe automatiquement tous les autres directs actifs à ENDED
        if (status == LiveStatus.LIVE) {
            List<LiveStream> activeStreams = liveStreamRepository.findByStatusOrderByStartTimeAsc(LiveStatus.LIVE);
            for (LiveStream s : activeStreams) {
                if (!s.getId().equals(id)) {
                    s.setStatus(LiveStatus.ENDED);
                    liveStreamRepository.save(s);
                }
            }
        }

        live.setStatus(status);
        LiveStream saved = liveStreamRepository.save(live);
        return ResponseEntity.ok(saved);
    }
}
