package com.media.analytics.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "page_views")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageView {

    @Id
    private String id;

    private Long articleId;

    private String title;

    private String viewerUsername; // Optionnel (null si visiteur anonyme)

    private String ipAddress;

    private LocalDateTime viewDate;
}
