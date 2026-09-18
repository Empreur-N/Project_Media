package com.media.notification.repository;

import com.media.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Récupérer les notifications personnelles de l'utilisateur + les alertes globales (destinataire null)
    List<Notification> findByRecipientUsernameOrRecipientUsernameIsNullOrderByCreatedAtDesc(String recipientUsername);
}
