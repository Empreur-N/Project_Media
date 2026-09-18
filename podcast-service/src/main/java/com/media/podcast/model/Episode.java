package com.media.podcast.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "episodes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Episode {

    @Id
    private String id;

    private String showTitle; // Titre de l'émission (ex: Décryptage, Actualité du jour)

    private String title;

    private String description;

    private String audioUrl; // URL du fichier audio MP3

    private String coverUrl; // URL de la pochette de l'émission/épisode

    private Integer durationSeconds; // Durée en secondes

    private String category; // Optionnel (Ex: Economie, Sport)

    private LocalDateTime publishDate;
}
