package com.media.notification.repository;

import com.media.notification.model.InternalMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternalMessageRepository extends JpaRepository<InternalMessage, Long> {
    List<InternalMessage> findAllByOrderByCreatedAtDesc();
    List<InternalMessage> findByCategoryOrderByCreatedAtDesc(String category);
}
