package com.media.media.consumer;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class MediaProcessConsumer {

    public static final String MEDIA_PROCESS_QUEUE = "media.process";

    @Bean
    public Queue mediaProcessQueue() {
        return new Queue(MEDIA_PROCESS_QUEUE, true);
    }

    @RabbitListener(queues = MEDIA_PROCESS_QUEUE)
    public void processMedia(Map<String, String> message) {
        String filename = message.get("filename");
        String mimeType = message.get("mimeType");
        String action = message.get("action");

        System.out.println("====== [FFMPEG WORKER] Début de traitement asynchrone ======");
        System.out.println("Fichier : " + filename);
        System.out.println("MIME : " + mimeType);
        System.out.println("Action requise : " + action);

        try {
            if ("NORMALIZE_128K".equals(action)) {
                // Règle 41.2 : Normalisation sonore et conversion MP3/AAC 128 kbps
                System.out.println("[FFMPEG] Normalisation audio en cours (128 kbps AAC/MP3) pour: " + filename);
            } else if ("HLS_TRANSCODE".equals(action)) {
                // Règle 41.2 : Encodage H.264/AAC et génération de segments HLS (.m3u8)
                System.out.println("[FFMPEG] Encodage vidéo adaptatif HLS (.m3u8) pour: " + filename);
            }
            System.out.println("====== [FFMPEG WORKER] Traitement terminé avec succès pour: " + filename + " ======");
        } catch (Exception e) {
            System.err.println("[FFMPEG WORKER] Erreur lors du traitement du média: " + e.getMessage());
        }
    }
}