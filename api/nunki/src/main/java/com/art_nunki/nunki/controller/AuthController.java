package com.art_nunki.nunki.controller;

import com.art_nunki.nunki.model.User;
import com.art_nunki.nunki.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        return userService.login(user.getEmail(), user.getPassword())
                .map(u -> ResponseEntity.ok(u))
                .orElse(ResponseEntity.status(401).body("Credenciais inválidas"));
    }
}
