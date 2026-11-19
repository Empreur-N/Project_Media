package com.media.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.media.user.model.User;
import com.media.user.model.Role;
import com.media.user.repository.UserRepository;

@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Création de l'Administrateur par défaut si absent
            if (!userRepository.existsByUsername("admin")) {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@lifechannel.cd")
                        .password(passwordEncoder.encode("AdminPass123!"))
                        .role(Role.ADMIN)
                        .active(true)
                        .build();
                userRepository.save(admin);
                System.out.println("Compte Administrateur par défaut inséré.");
            }

            // 2. Création d'un Rédacteur (Editor) par défaut si absent
            if (!userRepository.existsByUsername("editor")) {
                User editor = User.builder()
                        .username("editor")
                        .email("editor@lifechannel.cd")
                        .password(passwordEncoder.encode("EditorPass123!"))
                        .role(Role.EDITOR)
                        .active(true)
                        .build();
                userRepository.save(editor);
                System.out.println("Compte Rédacteur (Editor) par défaut inséré.");
            }

            // 3. Création d'un Journaliste par défaut si absent
            if (!userRepository.existsByUsername("journalist")) {
                User journalist = User.builder()
                        .username("journalist")
                        .email("journalist@lifechannel.cd")
                        .password(passwordEncoder.encode("JournalistPass123!"))
                        .role(Role.JOURNALIST)
                        .active(true)
                        .build();
                userRepository.save(journalist);
                System.out.println("Compte Journaliste par défaut inséré.");
            }

            // 4. Comptes de Supervision dédiés aux Fondateurs / Direction (Rôle SUPERVISOR)
            if (!userRepository.existsByUsername("directeur1")) {
                User dir1 = User.builder()
                        .username("directeur1")
                        .fullName("Direction Générale - Fondateur")
                        .email("direction1@lifechannelmedia.com")
                        .password(passwordEncoder.encode("DirectionPass2026!"))
                        .role(Role.SUPERVISOR)
                        .emailVerified(true)
                        .active(true)
                        .build();
                userRepository.save(dir1);
                System.out.println("Compte Supervision Fondateur 1 (directeur1) inséré.");
            }

            if (!userRepository.existsByUsername("directeur2")) {
                User dir2 = User.builder()
                        .username("directeur2")
                        .fullName("Co-Fondateur & Supervision Éditoriale")
                        .email("direction2@lifechannelmedia.com")
                        .password(passwordEncoder.encode("DirectionPass2026!"))
                        .role(Role.SUPERVISOR)
                        .emailVerified(true)
                        .active(true)
                        .build();
                userRepository.save(dir2);
                System.out.println("Compte Supervision Fondateur 2 (directeur2) inséré.");
            }
        };
    }
}
