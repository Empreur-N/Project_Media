package com.media.content.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialSyncRequest {
    private String network;         // YOUTUBE, FACEBOOK, TIKTOK, INSTAGRAM, X
    private String externalId;      // Identifiant unique du post d'origine
    private String title;           // Titre de la vidéo ou du statut
    private String summary;         // Résumé ou chapeau
    private String content;         // Texte intégral du post
    private String mediaUrl;        // URL de l'image de couverture ou de la vidéo
    private String postUrl;         // URL directe du post sur le réseau social
    private String author;          // Nom du contributeur / chaîne
    private String category;        // Catégorie cible (ex: Réseaux Sociaux, Actualité)
    private String tags;            // Tags associés
    @Builder.Default
    private Boolean publishDirectly = true; // Si vrai, statut PUBLISHED direct
}
