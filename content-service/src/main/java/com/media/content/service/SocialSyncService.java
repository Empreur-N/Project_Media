package com.media.content.service;

import com.media.content.dto.SocialSyncRequest;
import com.media.content.model.Article;
import com.media.content.model.ArticleStatus;
import com.media.content.repository.ArticleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SocialSyncService {

    private static final Logger log = LoggerFactory.getLogger(SocialSyncService.class);

    private final ArticleRepository articleRepository;
    private final RestClient restClient;

    @Value("${social.sync.secret:lifechannel_social_sync_secret_2026}")
    private String syncSecret;

    @Value("${social.youtube.channel-id:}")
    private String defaultYouTubeChannelId;

    public SocialSyncService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
        this.restClient = RestClient.create();
    }

    public String getSyncSecret() {
        return syncSecret;
    }

    /**
     * Ingestion d'un post provenant des réseaux sociaux (YouTube, Facebook, TikTok, Instagram)
     */
    @CacheEvict(value = "articles", allEntries = true)
    public Article ingestSocialPost(SocialSyncRequest req) {
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Le titre du post est obligatoire.");
        }

        String network = (req.getNetwork() != null ? req.getNetwork().toUpperCase() : "SOCIAL");
        String externalId = req.getExternalId();
        if (externalId == null || externalId.trim().isEmpty()) {
            externalId = String.valueOf(req.getTitle().trim().hashCode());
        }

        String dedupeTag = "[SOCIAL_ID:" + network + "_" + externalId + "]";

        // Vérification d'anti-doublon
        if (articleRepository.existsByTagsContaining(dedupeTag) || articleRepository.existsByTitle(req.getTitle())) {
            log.info("Post social déjà importé, doublon ignoré: {} ({})", req.getTitle(), dedupeTag);
            List<Article> existing = articleRepository.findByTagsContainingOrderByCreatedAtDesc(dedupeTag);
            if (!existing.isEmpty()) {
                return existing.get(0);
            }
        }

        // Formatage du contenu selon la plateforme
        String formattedContent = formatContentForNetwork(network, externalId, req);
        String finalImageUrl = resolveImageUrl(network, externalId, req.getMediaUrl());
        String category = (req.getCategory() != null && !req.getCategory().trim().isEmpty())
                ? req.getCategory()
                : "Réseaux Sociaux";

        String tags = (req.getTags() != null ? req.getTags() + ", " : "")
                + "#" + network.toLowerCase() + ", #lifechannel, " + dedupeTag;

        boolean publishNow = (req.getPublishDirectly() == null || req.getPublishDirectly());

        Article article = Article.builder()
                .title(req.getTitle())
                .summary(req.getSummary() != null && !req.getSummary().trim().isEmpty() 
                        ? req.getSummary() 
                        : "Publication automatique synchronisée depuis " + network + " — Life Channel Media.")
                .content(formattedContent)
                .category(category)
                .region("National")
                .tags(tags)
                .mainImageUrl(finalImageUrl)
                .status(publishNow ? ArticleStatus.PUBLISHED : ArticleStatus.SUBMITTED)
                .authorUsername(req.getAuthor() != null && !req.getAuthor().trim().isEmpty() 
                        ? req.getAuthor() 
                        : "Life Channel Social (" + network + ")")
                .publicationDate(publishNow ? LocalDateTime.now() : null)
                .build();

        Article saved = articleRepository.save(article);
        log.info("Article social synchronisé avec succès [ID={}] pour le réseau {}", saved.getId(), network);
        return saved;
    }

    /**
     * Génère un code HTML propre avec player intégré selon la plateforme
     */
    private String formatContentForNetwork(String network, String externalId, SocialSyncRequest req) {
        StringBuilder sb = new StringBuilder();

        switch (network) {
            case "YOUTUBE":
                String youtubeVideoId = extractYouTubeVideoId(externalId, req.getPostUrl(), req.getMediaUrl());
                if (youtubeVideoId != null) {
                    sb.append("<div style=\"position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5rem 0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.3);\">")
                      .append("<iframe src=\"https://www.youtube.com/embed/").append(youtubeVideoId).append("?rel=0\" ")
                      .append("frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" ")
                      .append("allowfullscreen style=\"position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;\"></iframe>")
                      .append("</div>\n\n");
                }
                if (req.getContent() != null && !req.getContent().trim().isEmpty()) {
                    sb.append("<p>").append(escapeHtml(req.getContent()).replace("\n", "<br/>")).append("</p>\n\n");
                }
                if (req.getPostUrl() != null && !req.getPostUrl().trim().isEmpty()) {
                    sb.append("<p style=\"margin-top:1.5rem;\"><a href=\"").append(req.getPostUrl())
                      .append("\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"btn btn-primary\" style=\"display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:8px;text-decoration:none;\">")
                      .append("▶️ Regarder sur la chaîne YouTube officielle LIFE CHANNEL</a></p>");
                }
                break;

            case "FACEBOOK":
                sb.append("<div style=\"border-left:4px solid #1877f2;padding-left:14px;margin:1rem 0;font-style:italic;color:var(--text-secondary);\">")
                  .append("📲 Publication diffusée en direct sur la page officielle <strong>Facebook Life Channel</strong>.")
                  .append("</div>\n\n");
                if (req.getContent() != null) {
                    sb.append("<p>").append(escapeHtml(req.getContent()).replace("\n", "<br/>")).append("</p>\n\n");
                }
                if (req.getPostUrl() != null && !req.getPostUrl().trim().isEmpty()) {
                    sb.append("<p><a href=\"").append(req.getPostUrl())
                      .append("\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:#1877f2;font-weight:bold;text-decoration:none;\">")
                      .append("👉 Voir la publication originale et les réactions sur Facebook</a></p>");
                }
                break;

            case "TIKTOK":
                sb.append("<div style=\"border-left:4px solid #fe2c55;padding-left:14px;margin:1rem 0;font-style:italic;color:var(--text-secondary);\">")
                  .append("🎵 Vidéo courte tendance diffusée sur le compte officiel <strong>TikTok @LifeChannelMedia</strong>.")
                  .append("</div>\n\n");
                if (req.getContent() != null) {
                    sb.append("<p>").append(escapeHtml(req.getContent()).replace("\n", "<br/>")).append("</p>\n\n");
                }
                if (req.getPostUrl() != null && !req.getPostUrl().trim().isEmpty()) {
                    sb.append("<p><a href=\"").append(req.getPostUrl())
                      .append("\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:#fe2c55;font-weight:bold;text-decoration:none;\">")
                      .append("👉 Regarder la vidéo originale sur TikTok</a></p>");
                }
                break;

            case "INSTAGRAM":
                sb.append("<div style=\"border-left:4px solid #e1306c;padding-left:14px;margin:1rem 0;font-style:italic;color:var(--text-secondary);\">")
                  .append("📸 Publication diffusée sur notre compte <strong>Instagram Life Channel</strong>.")
                  .append("</div>\n\n");
                if (req.getContent() != null) {
                    sb.append("<p>").append(escapeHtml(req.getContent()).replace("\n", "<br/>")).append("</p>\n\n");
                }
                if (req.getPostUrl() != null && !req.getPostUrl().trim().isEmpty()) {
                    sb.append("<p><a href=\"").append(req.getPostUrl())
                      .append("\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:#e1306c;font-weight:bold;text-decoration:none;\">")
                      .append("👉 Découvrir la publication sur Instagram</a></p>");
                }
                break;

            default:
                if (req.getContent() != null) {
                    sb.append("<p>").append(escapeHtml(req.getContent()).replace("\n", "<br/>")).append("</p>\n\n");
                }
                if (req.getPostUrl() != null && !req.getPostUrl().trim().isEmpty()) {
                    sb.append("<p><a href=\"").append(req.getPostUrl())
                      .append("\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:var(--primary);font-weight:bold;\">")
                      .append("👉 Lien direct vers le contenu source</a></p>");
                }
                break;
        }

        return sb.toString();
    }

    private String resolveImageUrl(String network, String externalId, String providedMediaUrl) {
        if (providedMediaUrl != null && !providedMediaUrl.trim().isEmpty()) {
            return providedMediaUrl;
        }
        if ("YOUTUBE".equals(network)) {
            String vId = extractYouTubeVideoId(externalId, null, null);
            if (vId != null) {
                return "https://img.youtube.com/vi/" + vId + "/hqdefault.jpg";
            }
        }
        return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
    }

    private String extractYouTubeVideoId(String externalId, String postUrl, String mediaUrl) {
        if (externalId != null && externalId.length() == 11 && !externalId.contains(" ") && !externalId.contains("/")) {
            return externalId;
        }

        String[] candidates = { postUrl, mediaUrl, externalId };
        Pattern pattern = Pattern.compile("(?:v=|/v/|youtu\\.be/|/embed/|/shorts/)([a-zA-Z0-9_-]{11})");

        for (String url : candidates) {
            if (url != null) {
                Matcher matcher = pattern.matcher(url);
                if (matcher.find()) {
                    return matcher.group(1);
                }
            }
        }
        return null;
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;");
    }

    /**
     * Récupère automatiquement les dernières vidéos d'un flux YouTube RSS public
     */
    public int syncYouTubeFeed(String channelId) {
        if (channelId == null || channelId.trim().isEmpty()) {
            channelId = defaultYouTubeChannelId;
        }
        if (channelId == null || channelId.trim().isEmpty()) {
            log.info("Aucun identifiant de chaîne YouTube configuré pour la synchronisation automatique.");
            return 0;
        }

        String feedUrl = "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelId.trim();
        log.info("Interrogation du flux YouTube RSS officiel: {}", feedUrl);

        try {
            String xmlResponse = restClient.get()
                    .uri(feedUrl)
                    .retrieve()
                    .body(String.class);

            if (xmlResponse == null || xmlResponse.isEmpty()) {
                return 0;
            }

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlResponse.getBytes(StandardCharsets.UTF_8)));

            NodeList entries = doc.getElementsByTagName("entry");
            int importedCount = 0;

            for (int i = 0; i < entries.getLength(); i++) {
                Element entry = (Element) entries.item(i);

                String videoId = getElementText(entry, "yt:videoId");
                String title = getElementText(entry, "title");
                String description = getElementText(entry, "media:description");

                String postUrl = "https://www.youtube.com/watch?v=" + videoId;
                String mediaUrl = "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg";

                if (videoId != null && title != null) {
                    String dedupeTag = "[SOCIAL_ID:YOUTUBE_" + videoId + "]";
                    if (!articleRepository.existsByTagsContaining(dedupeTag) && !articleRepository.existsByTitle(title)) {
                        SocialSyncRequest req = SocialSyncRequest.builder()
                                .network("YOUTUBE")
                                .externalId(videoId)
                                .title(title)
                                .summary(description != null && description.length() > 200 ? description.substring(0, 200) + "..." : description)
                                .content(description != null ? description : title)
                                .mediaUrl(mediaUrl)
                                .postUrl(postUrl)
                                .author("Life Channel TV (YouTube)")
                                .category("Actualité")
                                .tags("#YouTube, #Direct, #LifeChannel")
                                .publishDirectly(true)
                                .build();

                        ingestSocialPost(req);
                        importedCount++;
                    }
                }
            }

            log.info("Synchronisation YouTube terminée : {} nouvelles vidéos importées.", importedCount);
            return importedCount;

        } catch (Exception e) {
            log.warn("Impossible de synchroniser le flux YouTube ({}): {}", feedUrl, e.getMessage());
            return 0;
        }
    }

    private String getElementText(Element parent, String tagName) {
        NodeList list = parent.getElementsByTagName(tagName);
        if (list != null && list.getLength() > 0) {
            return list.item(0).getTextContent();
        }
        return null;
    }

    /**
     * Tâche planifiée automatique : Exécutée toutes les 30 minutes
     */
    @Scheduled(fixedDelay = 1800000, initialDelay = 60000)
    public void scheduledSocialSync() {
        if (defaultYouTubeChannelId != null && !defaultYouTubeChannelId.trim().isEmpty()) {
            log.info("Lancement de la synchronisation planifiée des réseaux sociaux...");
            syncYouTubeFeed(defaultYouTubeChannelId);
        }
    }
}
