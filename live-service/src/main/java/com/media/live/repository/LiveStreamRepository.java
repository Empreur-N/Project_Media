package com.media.live.repository;

import com.media.live.model.LiveStream;
import com.media.live.model.LiveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LiveStreamRepository extends JpaRepository<LiveStream, Long> {
    List<LiveStream> findByStatusOrderByStartTimeAsc(LiveStatus status);
    List<LiveStream> findAllByOrderByStartTimeDesc();
}
