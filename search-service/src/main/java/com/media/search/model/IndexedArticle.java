package com.media.search.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "articles_index")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndexedArticle {

    @Id
    private Long id;

    private String title;

    private String summary;

    private String content;

    private String category;

    private String region;

    private String tags;

    private String mainImageUrl;

    private String authorUsername;

    private LocalDateTime publicationDate;
}
