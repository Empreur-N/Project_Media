package com.media.media.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "media_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaMetadata {

    @Id
    private String id;

    private String filename;

    private String contentType;

    private Long fileSize;

    private String fileUrl;

    // Déclinaisons optimisées : "thumbnail" (300px), "standard" (800px), "hd" (1600px)
    private Map<String, String> variants;

    private Long associatedArticleId;

    private LocalDateTime uploadDate;
}
