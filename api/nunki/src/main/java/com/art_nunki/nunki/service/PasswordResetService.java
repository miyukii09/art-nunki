package com.art_nunki.nunki.service;

import com.art_nunki.nunki.model.PasswordResetToken;
import com.art_nunki.nunki.model.User;
import com.art_nunki.nunki.repository.PasswordResetTokenRepository;
import com.art_nunki.nunki.repository.UserRepository;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
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
public class PasswordResetService {

    private static final String GENERIC_MESSAGE =
            "Se o email estiver cadastrado, enviaremos as instrucoes para redefinir a senha.";

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.password-reset.token-minutes:30}")
    private long tokenMinutes;

    @Value("${app.password-reset.expose-reset-url:false}")
    private boolean exposeResetUrl;

    @Value("${app.mail.from:}")
    private String mailFrom;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            ObjectProvider<JavaMailSender> mailSenderProvider
    ) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSenderProvider = mailSenderProvider;
    }

    public PasswordResetResult requestReset(String email, String appBaseUrl) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("Informe um email valido.");
        }

        passwordResetTokenRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());

        Optional<User> userOptional = userRepository.findByEmail(normalizedEmail);
        if (userOptional.isEmpty()) {
            return new PasswordResetResult(GENERIC_MESSAGE, null);
        }

        User user = userOptional.get();
        passwordResetTokenRepository.deleteAll(passwordResetTokenRepository.findAllByUserAndUsedAtIsNull(user));

        String rawToken = generateToken();
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(hashToken(rawToken));
        token.setExpiresAt(LocalDateTime.now().plusMinutes(tokenMinutes));
        passwordResetTokenRepository.save(token);

        String normalizedBaseUrl = normalizeBaseUrl(appBaseUrl);
        String resetUrl = normalizedBaseUrl == null
                ? null
                : normalizedBaseUrl + "/reset-password?token=" + rawToken;

        if (resetUrl != null) {
            sendResetEmailIfPossible(user.getEmail(), resetUrl);
        }

        return new PasswordResetResult(
                GENERIC_MESSAGE,
                exposeResetUrl ? resetUrl : null
        );
    }

    public void resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Token de redefinicao invalido.");
        }

        if (newPassword == null || newPassword.isBlank() || newPassword.length() < 4) {
            throw new IllegalArgumentException("A nova senha deve ter no minimo 4 caracteres.");
        }

        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> new IllegalArgumentException("Token de redefinicao invalido."));

        if (token.getUsedAt() != null || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token de redefinicao expirado ou ja utilizado.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(token);
    }

    private void sendResetEmailIfPossible(String recipient, String resetUrl) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || mailFrom == null || mailFrom.isBlank()) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(recipient);
        message.setSubject("Redefinicao de senha - Nunki");
        message.setText(
                "Recebemos um pedido para redefinir sua senha.\n\n" +
                        "Use este link para criar uma nova senha:\n" +
                        resetUrl + "\n\n" +
                        "Se voce nao fez esse pedido, pode ignorar esta mensagem."
        );
        mailSender.send(message);
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

    private String normalizeBaseUrl(String appBaseUrl) {
        if (appBaseUrl == null || appBaseUrl.isBlank()) {
            return null;
        }

        return appBaseUrl.trim().replaceAll("/+$", "");
    }

    private String normalizeEmail(String email) {
        return email != null ? email.trim().toLowerCase() : null;
    }
}
