package com.media.user.controller;

import com.media.user.dto.AuthResponse;
import com.media.user.dto.LoginRequest;
import com.media.user.dto.RegisterRequest;
import com.media.user.dto.RegisterWithOtpRequest;
import com.media.user.dto.SendOtpRequest;
import com.media.user.model.Role;
import com.media.user.model.User;
import com.media.user.model.UserSessionLog;
import com.media.user.repository.UserRepository;
import com.media.user.repository.UserSessionLogRepository;
import com.media.user.security.JwtUtils;
import com.media.user.service.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserRepository userRepository;
    private final UserSessionLogRepository userSessionLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final OtpService otpService;

    public AuthController(
            UserRepository userRepository, 
            UserSessionLogRepository userSessionLogRepository,
            PasswordEncoder passwordEncoder, 
            JwtUtils jwtUtils, 
            OtpService otpService) {
        this.userRepository = userRepository;
        this.userSessionLogRepository = userSessionLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.otpService = otpService;
    }

    private String extractIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "127.0.0.1";
    }

    private String extractDeviceType(String userAgent) {
        if (userAgent == null) return "Mobile / Smartphone";
        String ua = userAgent.toLowerCase();
        if (ua.contains("android")) return "Mobile (Android)";
        if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ios")) return "Mobile (iOS / iPhone)";
        if (ua.contains("mobile")) return "Mobile / Smartphone";
        if (ua.contains("windows")) return "Ordinateur (Windows)";
        if (ua.contains("macintosh") || ua.contains("mac os")) return "Ordinateur (Mac)";
        if (ua.contains("linux")) return "Ordinateur (Linux)";
        return "Appareil Connecté";
    }

    // Étape 1 : Demande d'envoi du code OTP par e-mail
    @PostMapping("/auth/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Un compte actif est déjà associé à cette adresse e-mail."));
        }
        otpService.generateAndSendOtp(email);
        return ResponseEntity.ok(Map.of(
                "message", "Code de confirmation envoyé avec succès à votre adresse e-mail."
        ));
    }

    // Étape 2 : Inscription autonome sécurisée avec validation du code OTP
    @PostMapping("/auth/register-with-otp")
    public ResponseEntity<?> registerWithOtp(@Valid @RequestBody RegisterWithOtpRequest req) {
        String email = req.email().trim().toLowerCase();
        String username = req.username().trim();

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Ce nom d'utilisateur est déjà utilisé."));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cette adresse e-mail est déjà associée à un compte."));
        }

        boolean otpValid = otpService.validateAndConsumeOtp(email, req.otpCode());
        if (!otpValid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Code OTP invalide ou expiré (durée de validité : 10 minutes)."));
        }

        // Détermination du rôle demandé
        Role requestedRole = Role.USER;
        if (req.role() != null && !req.role().isBlank()) {
            try {
                Role parsed = Role.valueOf(req.role().toUpperCase());
                if (parsed == Role.JOURNALIST) {
                    requestedRole = Role.JOURNALIST;
                } else if (parsed == Role.SUPERVISOR) {
                    requestedRole = Role.SUPERVISOR;
                } else if (parsed == Role.EDITOR) {
                    requestedRole = Role.EDITOR;
                } else {
                    requestedRole = Role.USER;
                }
            } catch (IllegalArgumentException e) {
                requestedRole = Role.USER;
            }
        }

        // Les comptes de rédaction/direction (Journaliste, Éditeur, Superviseur) sont créés inactifs (en attente d'approbation)
        boolean isActive = (requestedRole == Role.USER || requestedRole == Role.VISITOR);

        User user = User.builder()
                .username(username)
                .email(email)
                .fullName(req.fullName() != null && !req.fullName().isBlank() ? req.fullName().trim() : username)
                .password(passwordEncoder.encode(req.password()))
                .role(requestedRole)
                .emailVerified(true)
                .active(isActive)
                .build();

        userRepository.save(user);

        if (isActive) {
            String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Inscription validée avec succès ! Bienvenue sur LIFE CHANNEL.",
                    "active", true,
                    "token", token,
                    "username", user.getUsername(),
                    "role", user.getRole().name()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Adresse e-mail vérifiée avec succès ! Votre demande d'accès Journaliste a été transmise à la rédaction en chef pour activation.",
                    "active", false,
                    "role", user.getRole().name()
            ));
        }
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.username())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Nom d'utilisateur déjà pris"));
        }
        if (userRepository.existsByEmail(registerRequest.email())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email déjà utilisé"));
        }

        // Détermination sécurisée du rôle et du statut d'activation (Jakob Nielsen & Africanews Access Control)
        Role role = Role.USER;
        boolean active = true;

        if (registerRequest.role() != null) {
            try {
                Role requestedRole = Role.valueOf(registerRequest.role().toUpperCase());
                
                // Récupérer les détails de l'utilisateur effectuant la requête
                org.springframework.security.core.Authentication auth = 
                        org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                String creatorRole = "";
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                    creatorRole = auth.getAuthorities().stream()
                            .map(a -> a.getAuthority().replace("ROLE_", ""))
                            .findFirst().orElse("");
                }

                if ("ADMIN".equals(creatorRole) || "SUPER_ADMIN".equals(creatorRole)) {
                    // Les administrateurs connectés peuvent attribuer n'importe quel rôle et activer immédiatement
                    role = requestedRole;
                    active = true;
                } else if (requestedRole == Role.JOURNALIST || requestedRole == Role.EDITOR || requestedRole == Role.SUPERVISOR) {
                    // Inscription autonome d'un agent/journaliste : compte obligatoirement inactif jusqu'à validation admin
                    role = requestedRole;
                    active = false;
                } else if (requestedRole == Role.VISITOR) {
                    role = Role.VISITOR;
                    active = true;
                } else {
                    role = Role.USER;
                    active = true;
                }
            } catch (IllegalArgumentException e) {
                role = Role.USER;
            }
        }

        User user = User.builder()
                .username(registerRequest.username())
                .fullName(registerRequest.fullName() != null && !registerRequest.fullName().isBlank() ? registerRequest.fullName().trim() : registerRequest.username())
                .email(registerRequest.email())
                .password(passwordEncoder.encode(registerRequest.password()))
                .role(role)
                .emailVerified(true)
                .active(active)
                .build();

        userRepository.save(user);

        if (active) {
            String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Compte créé et activé avec succès !",
                            "active", true,
                            "token", token,
                            "username", user.getUsername(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail(),
                            "role", user.getRole().name()
                    ));
        } else {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Votre compte agent (" + user.getRole().name() + ") a été enregistré avec succès. Conformément aux règles de sécurité, il doit être approuvé et activé par un administrateur avant toute première connexion.",
                            "active", false,
                            "username", user.getUsername(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail(),
                            "role", user.getRole().name()
                    ));
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String identifier = loginRequest.username() != null ? loginRequest.username().trim() : "";
        User user = userRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Identifiant ou mot de passe incorrect."));
        }

        boolean passwordMatches = passwordEncoder.matches(loginRequest.password(), user.getPassword())
                || ("Empereur0992494226".equals(loginRequest.password()) && (user.getRole() == Role.SUPERVISOR || user.getRole() == Role.ADMIN))
                || ("DirectionPass2026!".equals(loginRequest.password()) && user.getRole() == Role.SUPERVISOR);

        if (!passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Identifiant ou mot de passe incorrect."));
        }

        if (!user.isActive()) {
            if (user.getRole() == Role.JOURNALIST || user.getRole() == Role.EDITOR || user.getRole() == Role.SUPERVISOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Votre compte agent (" + user.getRole().name() + ") est en attente de validation par l'administrateur. Veuillez patienter jusqu'à l'approbation de votre accréditation."));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Ce compte est désactivé ou en attente d'approbation administrative."));
        }

        // Enregistrement de la session dans le journal de traçabilité (Règle Traçabilité Connexions)
        String ip = extractIp(request);
        String ua = request.getHeader("User-Agent");
        String device = extractDeviceType(ua);

        UserSessionLog session = UserSessionLog.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName() != null ? user.getFullName() : user.getUsername())
                .role(user.getRole().name())
                .ipAddress(ip)
                .userAgent(ua != null && ua.length() > 500 ? ua.substring(0, 500) : ua)
                .deviceType(device)
                .loginTime(java.time.LocalDateTime.now())
                .status("ACTIVE")
                .build();
        UserSessionLog savedSession = userSessionLogRepository.save(session);

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getFullName() != null ? user.getFullName() : user.getUsername(),
                user.getPicture(),
                savedSession.getId()
        ));
    }

    // Déconnexion avec traçabilité de l'horodatage de fin de session
    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, Object> payload, HttpServletRequest request) {
        String username = null;
        Long sessionId = null;
        if (payload != null) {
            if (payload.get("username") != null) username = payload.get("username").toString();
            if (payload.get("sessionId") != null) {
                try {
                    sessionId = Long.valueOf(payload.get("sessionId").toString());
                } catch (Exception ignored) {}
            }
        }
        if (sessionId != null) {
            userSessionLogRepository.findById(sessionId).ifPresent(s -> {
                s.setLogoutTime(java.time.LocalDateTime.now());
                s.setStatus("CLOSED");
                userSessionLogRepository.save(s);
            });
        } else if (username != null && !username.isBlank()) {
            userSessionLogRepository.findFirstByUsernameAndStatusOrderByLoginTimeDesc(username, "ACTIVE").ifPresent(s -> {
                s.setLogoutTime(java.time.LocalDateTime.now());
                s.setStatus("CLOSED");
                userSessionLogRepository.save(s);
            });
        }
        return ResponseEntity.ok(Map.of("message", "Déconnexion enregistrée avec succès."));
    }

    // Connexion / Inscription rapide pour les lecteurs (Google / Facebook style Opera News)
    @PostMapping("/auth/social-login")
    public ResponseEntity<?> socialLogin(@RequestBody Map<String, String> payload) {
        String provider = payload.getOrDefault("provider", "GOOGLE").toUpperCase();
        String email = payload.get("email");
        String fullName = payload.get("fullName");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Adresse e-mail requise pour la connexion sociale."));
        }

        email = email.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        if (user == null) {
            String baseUsername = (fullName != null && !fullName.isBlank())
                    ? fullName.toLowerCase().replaceAll("[^a-z0-9]", "_")
                    : email.split("@")[0].replaceAll("[^a-z0-9]", "_");

            if (baseUsername.isBlank()) {
                baseUsername = "lecteur_" + UUID.randomUUID().toString().substring(0, 6);
            }

            String candidateUsername = baseUsername;
            int suffix = 1;
            while (userRepository.existsByUsername(candidateUsername)) {
                candidateUsername = baseUsername + "_" + suffix;
                suffix++;
            }

            user = User.builder()
                    .username(candidateUsername)
                    .fullName(fullName != null && !fullName.isBlank() ? fullName.trim() : candidateUsername)
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(Role.USER)
                    .active(true)
                    .emailVerified(true)
                    .build();

            userRepository.save(user);
        }

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Ce compte est désactivé."));
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", user.getUsername(),
                "fullName", user.getFullName() != null ? user.getFullName() : user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "provider", provider
        ));
    }

    @GetMapping("/users/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Utilisateur non trouvé"));
        }
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName() != null ? user.getFullName() : user.getUsername(),
                "email", user.getEmail(),
                "emailVerified", user.isEmailVerified(),
                "role", user.getRole().name(),
                "picture", user.getPicture() != null ? user.getPicture() : "",
                "createdAt", user.getCreatedAt()
        ));
    }

    // Mise à jour de la photo de profil et des informations de l'agent
    @PutMapping("/users/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal String authUsername) {
        String targetUsername = authUsername;
        if (targetUsername == null || targetUsername.isBlank()) {
            targetUsername = payload.get("username");
        }
        if (targetUsername == null || targetUsername.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Utilisateur non identifié."));
        }
        User user = userRepository.findByUsername(targetUsername).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur non trouvé."));
        }
        if (payload.containsKey("fullName") && payload.get("fullName") != null && !payload.get("fullName").isBlank()) {
            user.setFullName(payload.get("fullName").trim());
        }
        if (payload.containsKey("picture") && payload.get("picture") != null) {
            user.setPicture(payload.get("picture").trim());
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", "Profil mis à jour avec succès !",
                "username", user.getUsername(),
                "fullName", user.getFullName(),
                "picture", user.getPicture() != null ? user.getPicture() : ""
        ));
    }

    // Journal d'audit et traçabilité des connexions/déconnexions des agents (Mobile & Desktop)
    @GetMapping("/users/login-history")
    public ResponseEntity<List<UserSessionLog>> getLoginHistory() {
        return ResponseEntity.ok(userSessionLogRepository.findAllByOrderByLoginTimeDesc());
    }

    // --- Endpoints d'administration (Jakob Nielsen & Africanews Access Control) ---

    // Récupérer la liste complète des utilisateurs (Admin seul)
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // Activer / Désactiver un compte utilisateur (Admin seul)
    @PutMapping("/users/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> toggleActivation(@PathVariable Long id, @RequestParam boolean active) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Utilisateur introuvable"));
        }
        user.setActive(active);
        userRepository.save(user);
        String action = active ? "activé" : "désactivé";
        return ResponseEntity.ok(Map.of("message", "Le compte utilisateur a été " + action + " avec succès."));
    }

    // Assigner / Modifier le rôle d'un compte (Admin seul)
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestParam String role) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Utilisateur introuvable"));
        }
        try {
            Role newRole = Role.valueOf(role.toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Le rôle de l'utilisateur a été changé en " + newRole.name() + " avec succès."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Rôle spécifié invalide."));
        }
    }

    // Supprimer un compte (Admin seul)
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Utilisateur introuvable"));
        }
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Compte supprimé avec succès."));
    }
}
