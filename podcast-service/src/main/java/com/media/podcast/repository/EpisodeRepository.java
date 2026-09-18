package com.media.podcast.repository;

import com.media.podcast.model.Episode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EpisodeRepository extends MongoRepository<Episode, String> {
    List<Episode> findByShowTitleOrderByPublishDateDesc(String showTitle);
    List<Episode> findByCategoryOrderByPublishDateDesc(String category);
    List<Episode> findAllByOrderByPublishDateDesc();
}
