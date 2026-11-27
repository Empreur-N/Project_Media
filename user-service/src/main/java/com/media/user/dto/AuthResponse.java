package com.media.user.dto;

public record AuthResponse(
    String token,
    String username,
    String email,
    String role,
    String fullName,
    String picture,
    Long sessionId
) {
    public AuthResponse(String token, String username, String email, String role) {
        this(token, username, email, role, username, null, null);
    }
}
