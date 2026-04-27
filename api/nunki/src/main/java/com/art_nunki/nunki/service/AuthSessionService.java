package com.art_nunki.nunki.service;

import com.art_nunki.nunki.model.AuthSessionToken;
import com.art_nunki.nunki.model.User;
import com.art_nunki.nunki.repository.AuthSessionTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class AuthSessionService {

    private final AuthSessionTokenRepository authSessionTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.auth.token-hours:168}")
    private long tokenHours;

    public AuthSessionService(AuthSessionTokenRepository authSessionTokenRepository) {
        this.authSessionTokenRepository = authSessionTokenRepository;
    }

    public String createSessionToken(User user) {
        authSessionTokenRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());

        String rawToken = generateToken();
        AuthSessionToken token = new AuthSessionToken();
        token.setUser(user);
        token.setTokenHash(hashToken(rawToken));
        token.setExpiresAt(LocalDateTime.now().plusHours(tokenHours));
        authSessionTokenRepository.save(token);
        return rawToken;
    }

    public Optional<Long> resolveUserId(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }

        return authSessionTokenRepository.findByTokenHash(hashToken(rawToken))
                .filter(token -> token.getRevokedAt() == null)
                .filter(token -> token.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(token -> token.getUser().getId());
    }

    public void revokeToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        authSessionTokenRepository.findByTokenHash(hashToken(rawToken))
                .ifPresent(token -> {
                    token.setRevokedAt(LocalDateTime.now());
                    authSessionTokenRepository.save(token);
                });
    }

    public void revokeAllForUser(User user) {
        authSessionTokenRepository.deleteAllByUser(user);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 nao disponivel.", e);
        }
    }
}
