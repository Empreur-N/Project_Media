package com.media.user.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        String subject = "[LIFE CHANNEL] Code de vérification d'inscription : " + otpCode;
        
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }
                    .card { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
                    .header { text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 24px; }
                    .logo-text { font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 1px; }
                    .logo-channel { color: #ef4444; }
                    .code-box { background: #0f172a; border: 2px dashed #f59e0b; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0; }
                    .otp-code { font-size: 36px; font-weight: bold; color: #fbbf24; letter-spacing: 6px; }
                    .info { font-size: 14px; line-height: 1.6; color: #94a3b8; }
                    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <div class="logo-text">LIFE <span class="logo-channel">CHANNEL</span></div>
                        <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Le Média Numérique Indépendant de la RDC</p>
                    </div>
                    <p class="info">Bonjour,</p>
                    <p class="info">Vous avez initié une inscription sur la plateforme <strong>LIFE CHANNEL</strong>. Voici votre code unique de vérification :</p>
                    <div class="code-box">
                        <div class="otp-code">%s</div>
                    </div>
                    <p class="info">⏱️ Ce code expire dans <strong>10 minutes</strong>. Ne le partagez avec personne.</p>
                    <p class="info">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
                    <div class="footer">
                        &copy; 2026 LIFE CHANNEL MEDIA &bull; Kinshasa & Goma, RDC<br>
                        <a href="https://lifechannelmedia.com" style="color: #ef4444; text-decoration: none;">https://lifechannelmedia.com</a>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(otpCode);

        // Journalisation de sécurité
        log.info("==========================================================");
        log.info("📧 [LIFE CHANNEL OTP] Envoi code pour : {}", toEmail);
        log.info("🔑 CODE OTP : [{}] (Valide 10 minutes)", otpCode);
        log.info("==========================================================");

        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                helper.setFrom("contact@lifechannelmedia.com", "LIFE CHANNEL");
                mailSender.send(message);
                log.info("✅ E-mail envoyé avec succès via SMTP à {}", toEmail);
            } catch (Exception e) {
                log.warn("⚠️ Impossible d'expédier via SMTP ({}), le code a été loggué pour vérification.", e.getMessage());
            }
        } else {
            log.info("ℹ️ Serveur SMTP non configuré par défaut. Code disponible pour test immédiat.");
        }
    }
}
