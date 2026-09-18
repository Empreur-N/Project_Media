package com.media.notification.consumer;

import com.media.notification.config.RabbitMQConfig;
import com.media.notification.model.Notification;
import com.media.notification.repository.NotificationRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationConsumer {

    private final NotificationRepository notificationRepository;

    public NotificationConsumer(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void consumeNotification(Map<String, String> payload) {
        try {
            String title = payload.get("title");
            String body = payload.get("body");
            String recipient = payload.get("recipient"); // null si diffusion globale

            Notification notification = Notification.builder()
                    .title(title)
                    .message(body)
                    .recipientUsername(recipient)
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
            System.out.println("Notification reçue et enregistrée de manière asynchrone: " + title);
        } catch (Exception e) {
            System.err.println("Erreur de traitement du message RabbitMQ: " + e.getMessage());
        }
    }
}
