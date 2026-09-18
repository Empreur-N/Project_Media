package com.media.ad.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "ad_banners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdBanner implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "target_url", nullable = false)
    private String targetUrl; // URL de redirection au clic

    @Column(name = "image_url", nullable = false)
    private String imageUrl; // Image de la bannière

    @Column(nullable = false)
    private String placement; // HEADER, SIDEBAR, FOOTER

    @Column(name = "click_count")
    @Builder.Default
    private int clickCount = 0;

    @Column(name = "impression_count")
    @Builder.Default
    private int impressionCount = 0;

    @Builder.Default
    private boolean active = true;
}
