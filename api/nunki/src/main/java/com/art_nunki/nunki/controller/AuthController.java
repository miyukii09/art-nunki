package com.art_nunki.nunki.controller;

import com.art_nunki.nunki.model.User;
import com.art_nunki.nunki.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

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
                    return ResponseEntity.ok(authenticatedUser);
                })
                .orElseGet(() -> ResponseEntity.status(401).body("Credenciais inválidas"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
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
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.noContent().build();
    }
}
