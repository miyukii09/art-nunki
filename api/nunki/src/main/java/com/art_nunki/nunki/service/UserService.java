package com.art_nunki.nunki.service;

import com.art_nunki.nunki.model.Post;
import com.art_nunki.nunki.repository.UserRepository;
import com.art_nunki.nunki.repository.PostRepository;
import com.art_nunki.nunki.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) {
        String normalizedEmail = normalizeEmail(user.getEmail());
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("Email e obrigatorio.");
        }
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("Ja existe uma conta com esse email.");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException("Senha e obrigatoria.");
        }

        user.setName(user.getName() != null ? user.getName().trim() : null);
        user.setEmail(normalizedEmail);
        if (user.getAvatarUrl() != null) {
            user.setAvatarUrl(user.getAvatarUrl().trim());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> login(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        Optional<User> user = normalizedEmail == null
                ? Optional.empty()
                : userRepository.findByEmail(normalizedEmail);

        if (user.isPresent() && password != null) {
            User existingUser = user.get();
            String storedPassword = existingUser.getPassword();

            if (storedPassword != null && passwordEncoder.matches(password, storedPassword)) {
                return Optional.of(existingUser);
            }

            // Compatibilidade com contas antigas salvas em texto puro.
            if (storedPassword != null && storedPassword.equals(password)) {
                existingUser.setPassword(passwordEncoder.encode(password));
                return Optional.of(userRepository.save(existingUser));
            }
        }

        return Optional.empty();
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> getById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> update(Long id, Long actingUserId, User updatedUser) {
        if (!id.equals(actingUserId)) {
            throw new IllegalArgumentException("Voce so pode atualizar a propria conta.");
        }

        return userRepository.findById(id).map(user -> {
            String normalizedEmail = normalizeEmail(updatedUser.getEmail());
            if (normalizedEmail == null || normalizedEmail.isBlank()) {
                throw new IllegalArgumentException("Email e obrigatorio.");
            }

            userRepository.findByEmail(normalizedEmail)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("Ja existe uma conta com esse email.");
                    });

            user.setName(updatedUser.getName());
            user.setEmail(normalizedEmail);
            user.setAvatarUrl(
                    updatedUser.getAvatarUrl() != null ? updatedUser.getAvatarUrl().trim() : null
            );

            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }

            return userRepository.save(user);
        });
    }

    public boolean delete(Long id, Long actingUserId) {
        if (!id.equals(actingUserId)) {
            throw new IllegalArgumentException("Voce so pode excluir a propria conta.");
        }

        if (!userRepository.existsById(id)) {
            return false;
        }

        List<Post> posts = postRepository.findAllByUserId(id);
        for (Post post : posts) {
            post.setUser(null);
        }
        postRepository.saveAll(posts);
        userRepository.deleteById(id);
        return true;
    }

    private String normalizeEmail(String email) {
        return email != null ? email.trim().toLowerCase() : null;
    }
}
