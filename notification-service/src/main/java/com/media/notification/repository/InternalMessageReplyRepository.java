package com.media.notification.repository;

import com.media.notification.model.InternalMessageReply;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InternalMessageReplyRepository extends JpaRepository<InternalMessageReply, Long> {
    List<InternalMessageReply> findByMessageIdOrderByCreatedAtAsc(Long messageId);
}
