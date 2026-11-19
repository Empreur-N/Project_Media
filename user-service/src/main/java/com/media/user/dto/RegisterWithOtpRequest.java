package com.media.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterWithOtpRequest(
        @NotBlank(message = "Le nom d'utilisateur est requis")
        @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")
        String username,

        @NotBlank(message = "L'adresse email est requise")
        @Email(message = "Format d'adresse email invalide")
        String email,

        @NotBlank(message = "Le mot de passe est requis")
        @Size(min = 6, message = "Le mot de passe doit comporter au moins 6 caractères")
        String password,

        String fullName,

        String role,

        @NotBlank(message = "Le code de vérification OTP est requis")
        @Size(min = 6, max = 6, message = "Le code OTP doit comporter 6 chiffres")
        String otpCode
) {
}
