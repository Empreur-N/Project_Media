package com.media.user.repository;

import com.media.user.model.UserSessionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionLogRepository extends JpaRepository<UserSessionLog, Long> {
    List<UserSessionLog> findAllByOrderByLoginTimeDesc();
    List<UserSessionLog> findByUsernameOrderByLoginTimeDesc(String username);
    Optional<UserSessionLog> findFirstByUsernameAndStatusOrderByLoginTimeDesc(String username, String status);
}
