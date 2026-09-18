package com.media.content.controller;

import com.media.content.model.Article;
import com.media.content.model.ArticleStatus;
import com.media.content.repository.ArticleRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/contents")
public class RssController {

    private final ArticleRepository articleRepository;

    public RssController(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    // Flux RSS 2.0 global (20 derniers articles publiés)
    @GetMapping(value = "/rss", produces = MediaType.APPLICATION_XML_VALUE)
    public String getGlobalRssFeed() {
        List<Article> articles = articleRepository.findByStatusOrderByCreatedAtDesc(ArticleStatus.PUBLISHED);
        return generateRssXml("LIFE CHANNEL - Flux d'Actualités en Direct", "Toutes les dernières informations nationales et internationales en continu.", articles);
    }

    // Flux RSS 2.0 par catégorie (ex: /rss/politique, /rss/sport)
    @GetMapping(value = "/rss/{category}", produces = MediaType.APPLICATION_XML_VALUE)
    public String getCategoryRssFeed(@PathVariable String category) {
        List<Article> articles = articleRepository.findByStatusAndCategoryOrderByCreatedAtDesc(ArticleStatus.PUBLISHED, category);
        return generateRssXml("LIFE CHANNEL - " + category.toUpperCase(), "Dernières actualités de la rubrique " + category, articles);
    }

    // Sitemap XML Google Actualités / Google Search Console
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String getSitemapXml() {
        List<Article> articles = articleRepository.findByStatusOrderByCreatedAtDesc(ArticleStatus.PUBLISHED);
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Page d'accueil
        sb.append("  <url>\n");
        sb.append("    <loc>https://lifechannel.cd/</loc>\n");
        sb.append("    <changefreq>always</changefreq>\n");
        sb.append("    <priority>1.0</priority>\n");
        sb.append("  </url>\n");

        // Pages d'articles
        DateTimeFormatter isoFormatter = DateTimeFormatter.ISO_LOCAL_DATE;
        for (Article a : articles) {
            String dateStr = (a.getPublicationDate() != null) ? a.getPublicationDate().format(isoFormatter) : "2026-01-01";
            sb.append("  <url>\n");
            sb.append("    <loc>https://lifechannel.cd/articles/").append(a.getId()).append("</loc>\n");
            sb.append("    <lastmod>").append(dateStr).append("</lastmod>\n");
            sb.append("    <changefreq>daily</changefreq>\n");
            sb.append("    <priority>0.8</priority>\n");
            sb.append("  </url>\n");
        }

        sb.append("</urlset>");
        return sb.toString();
    }

    private String generateRssXml(String feedTitle, String feedDescription, List<Article> articles) {
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n");
        sb.append("  <channel>\n");
        sb.append("    <title>").append(escapeXml(feedTitle)).append("</title>\n");
        sb.append("    <link>https://lifechannel.cd</link>\n");
        sb.append("    <description>").append(escapeXml(feedDescription)).append("</description>\n");
        sb.append("    <language>fr</language>\n");

        DateTimeFormatter rfc822 = DateTimeFormatter.RFC_1123_DATE_TIME;

        int count = 0;
        for (Article a : articles) {
            if (count++ >= 25) break;
            sb.append("    <item>\n");
            sb.append("      <title>").append(escapeXml(a.getTitle())).append("</title>\n");
            sb.append("      <link>https://lifechannel.cd/articles/").append(a.getId()).append("</link>\n");
            sb.append("      <guid isPermaLink=\"true\">https://lifechannel.cd/articles/").append(a.getId()).append("</guid>\n");
            sb.append("      <description>").append(escapeXml(a.getSummary() != null ? a.getSummary() : a.getTitle())).append("</description>\n");
            if (a.getCategory() != null) {
                sb.append("      <category>").append(escapeXml(a.getCategory())).append("</category>\n");
            }
            sb.append("    </item>\n");
        }

        sb.append("  </channel>\n");
        sb.append("</rss>");
        return sb.toString();
    }

    private String escapeXml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&apos;");
    }
}