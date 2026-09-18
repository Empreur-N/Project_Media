package com.media.media.repository;

import com.media.media.model.MediaMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MediaMetadataRepository extends MongoRepository<MediaMetadata, String> {
    List<MediaMetadata> findByAssociatedArticleId(Long associatedArticleId);
}
