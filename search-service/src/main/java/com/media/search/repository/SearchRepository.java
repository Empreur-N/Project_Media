package com.media.search.repository;

import com.media.search.model.IndexedArticle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchRepository extends MongoRepository<IndexedArticle, Long> {
}
