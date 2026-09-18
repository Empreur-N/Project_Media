package com.media.media.controller;

import com.media.media.model.MediaMetadata;
import com.media.media.repository.MediaMetadataRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/medias")
public class MediaController {

    private final MediaMetadataRepository mediaMetadataRepository;
    private final Path fileStorageLocation;
    private final org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;

    public MediaController(
            MediaMetadataRepository mediaMetadataRepository,
            org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate,
            @Value("${upload.dir}") String uploadDir) {
        this.mediaMetadataRepository = mediaMetadataRepository;
        this.rabbitTemplate = rabbitTemplate;
        
        // Résolution dynamique du dossier d'upload et création si manquant
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Impossible de créer le dossier de stockage des fichiers.", ex);
        }
    }

    // Endpoint d'upload de fichiers avec validation stricte Magic Bytes & Optimisation
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "articleId", required = false) Long articleId) {
        
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Fichier vide"));
        }

        try {
            // 1. Vérification stricte du type MIME réel (Magic Bytes - Règle 44.3)
            byte[] headerBytes = new byte[16];
            try (java.io.InputStream is = file.getInputStream()) {
                int read = is.read(headerBytes);
                if (read < 4) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Fichier invalide ou illisible"));
                }
            }

            String detectedMime = detectRealMimeType(headerBytes);
            if (detectedMime == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Format de fichier non autorisé ou signature binaire (Magic Bytes) invalide"));
            }

            // 2. Génération d'un nom unique UUID
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            }
            String baseUuid = UUID.randomUUID().toString();
            String newFileName = baseUuid + fileExtension;
            
            // Stockage physique du fichier original
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Construction de l'URL d'accès
            String fileUrl = "/api/medias/files/" + newFileName;

            // 3. Pipeline d'optimisation automatique des images (Règle 41.1)
            Map<String, String> variants = new java.util.HashMap<>();
            if (detectedMime.startsWith("image/") && !detectedMime.equals("image/gif")) {
                try {
                    java.awt.image.BufferedImage img = javax.imageio.ImageIO.read(targetLocation.toFile());
                    if (img != null) {
                        String thumbUrl = createVariant(img, 300, baseUuid, "thumbnail");
                        String standardUrl = createVariant(img, 800, baseUuid, "standard");
                        String hdUrl = createVariant(img, 1600, baseUuid, "hd");
                        
                        variants.put("thumbnail", thumbUrl);
                        variants.put("standard", standardUrl);
                        variants.put("hd", hdUrl);
                    }
                } catch (Exception imgEx) {
                    System.err.println("Avertissement génération déclinaisons: " + imgEx.getMessage());
                }
            }

            // 4. File de traitement asynchrone RabbitMQ pour Audio et Vidéo (Règle 41.2)
            if (detectedMime.startsWith("video/") || detectedMime.startsWith("audio/")) {
                try {
                    Map<String, String> processPayload = Map.of(
                            "filename", newFileName,
                            "mimeType", detectedMime,
                            "action", detectedMime.startsWith("video/") ? "HLS_TRANSCODE" : "NORMALIZE_128K"
                    );
                    rabbitTemplate.convertAndSend("media.process", processPayload);
                } catch (Exception mqEx) {
                    System.err.println("Avertissement envoi file media.process: " + mqEx.getMessage());
                }
            }

            // 5. Enregistrement des métadonnées dans MongoDB
            MediaMetadata metadata = MediaMetadata.builder()
                    .filename(newFileName)
                    .contentType(detectedMime)
                    .fileSize(file.getSize())
                    .fileUrl(fileUrl)
                    .variants(variants.isEmpty() ? null : variants)
                    .associatedArticleId(articleId)
                    .uploadDate(LocalDateTime.now())
                    .build();

            MediaMetadata saved = mediaMetadataRepository.save(metadata);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur lors de l'enregistrement du fichier: " + ex.getMessage()));
        }
    }

    // Helper : Détection Magic Bytes
    private String detectRealMimeType(byte[] b) {
        // JPEG: FF D8 FF
        if ((b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        // PNG: 89 50 4E 47
        if ((b[0] & 0xFF) == 0x89 && (b[1] & 0xFF) == 0x50 && (b[2] & 0xFF) == 0x4E && (b[3] & 0xFF) == 0x47) {
            return "image/png";
        }
        // GIF: 47 49 46
        if (b[0] == 'G' && b[1] == 'I' && b[2] == 'F') {
            return "image/gif";
        }
        // WebP: RIFF ... WEBP
        if (b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "image/webp";
        }
        // MP3: ID3 or FF FB
        if ((b[0] == 'I' && b[1] == 'D' && b[2] == '3') || ((b[0] & 0xFF) == 0xFF && ((b[1] & 0xE0) == 0xE0))) {
            return "audio/mpeg";
        }
        // MP4: ftyp
        if (b[4] == 'f' && b[5] == 't' && b[6] == 'y' && b[7] == 'p') {
            return "video/mp4";
        }
        // PDF: %PDF
        if (b[0] == '%' && b[1] == 'P' && b[2] == 'D' && b[3] == 'F') {
            return "application/pdf";
        }
        return null;
    }

    // Helper : Générateur de déclinaison d'image haute fidélité (Redimensionnement Bicubique & Netteté Écrans PC)
    private String createVariant(java.awt.image.BufferedImage src, int targetWidth, String baseUuid, String suffix) throws IOException {
        int origWidth = src.getWidth();
        int origHeight = src.getHeight();
        if (origWidth <= 0 || origHeight <= 0) return null;

        int finalWidth = Math.min(origWidth, targetWidth);
        int finalHeight = (int) Math.round((double) origHeight * finalWidth / origWidth);

        // Détection de transparence éventuelle
        boolean hasAlpha = src.getColorModel().hasAlpha();
        java.awt.image.BufferedImage resized = new java.awt.image.BufferedImage(
                finalWidth, 
                finalHeight, 
                hasAlpha ? java.awt.image.BufferedImage.TYPE_INT_ARGB : java.awt.image.BufferedImage.TYPE_INT_RGB
        );

        java.awt.Graphics2D g = resized.createGraphics();
        
        // Optimisation du rendu pour une netteté maximale sur écrans PC
        g.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, java.awt.RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(java.awt.RenderingHints.KEY_RENDERING, java.awt.RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(java.awt.RenderingHints.KEY_COLOR_RENDERING, java.awt.RenderingHints.VALUE_COLOR_RENDER_QUALITY);

        if (!hasAlpha) {
            g.setColor(java.awt.Color.WHITE);
            g.fillRect(0, 0, finalWidth, finalHeight);
        }

        g.drawImage(src, 0, 0, finalWidth, finalHeight, null);
        g.dispose();

        String format = hasAlpha ? "png" : "jpg";
        String variantFileName = baseUuid + "_" + suffix + "." + format;
        Path variantPath = this.fileStorageLocation.resolve(variantFileName);
        javax.imageio.ImageIO.write(resized, format, variantPath.toFile());
        return "/api/medias/files/" + variantFileName;
    }

    // Récupérer le fichier physique binaire
    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<?> getFile(@PathVariable String filename) {
        try {
            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                // Détecter le content-type
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Fichier introuvable"));
            }
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur de lecture du fichier"));
        }
    }

    // Récupérer la liste des métadonnées des médias associés à un article
    @GetMapping("/articles/{articleId}")
    public ResponseEntity<List<MediaMetadata>> getMediaByArticle(@PathVariable Long articleId) {
        return ResponseEntity.ok(mediaMetadataRepository.findByAssociatedArticleId(articleId));
    }
}
