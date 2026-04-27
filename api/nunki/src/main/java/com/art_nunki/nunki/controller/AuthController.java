package com.art_nunki.nunki.controller;

import com.art_nunki.nunki.model.User;
import com.art_nunki.nunki.service.AuthSessionService;
import com.art_nunki.nunki.service.PasswordResetResult;
import com.art_nunki.nunki.service.PasswordResetService;
import com.art_nunki.nunki.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    @Autowired
    private PasswordResetService passwordResetService;
    @Autowired
    private AuthSessionService authSessionService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.register(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpSession session) {
        return userService.login(user.getEmail(), user.getPassword())
                .<ResponseEntity<?>>map(authenticatedUser -> {
                    session.setAttribute("userId", authenticatedUser.getId());
                    String token = authSessionService.createSessionToken(authenticatedUser);
                    return ResponseEntity.ok(new AuthResponse(authenticatedUser, token));
                })
                .orElseGet(() -> ResponseEntity.status(401).body("Credenciais inválidas"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication, HttpSession session) {
        Long userId = getAuthenticatedUserId(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).body("Sessao nao autenticada.");
        }

        return userService.getById(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> {
                    session.invalidate();
                    return ResponseEntity.status(401).body("Sessao nao autenticada.");
                });
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpSession session
    ) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String rawToken = authorization.substring("Bearer ".length()).trim();
            authSessionService.revokeToken(rawToken);
        }
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            PasswordResetResult result = passwordResetService.requestReset(
                    request.email(),
                    request.appBaseUrl()
            );
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.token(), request.password());
            return ResponseEntity.ok("Senha redefinida com sucesso.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public record ForgotPasswordRequest(String email, String appBaseUrl) {
    }

    public record ResetPasswordRequest(String token, String password) {
    }

    public record AuthResponse(User user, String token) {
    }

    private Long getAuthenticatedUserId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        return principal instanceof Number number ? number.longValue() : null;
    }
}
