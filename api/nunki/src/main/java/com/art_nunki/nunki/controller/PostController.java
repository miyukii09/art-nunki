package com.art_nunki.nunki.controller;

import com.art_nunki.nunki.model.Post;
import com.art_nunki.nunki.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    @Autowired
    private PostService postService;

    private Long getAuthenticatedUserId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        return principal instanceof Number number ? number.longValue() : null;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Post post, Authentication authentication) {
        try {
            return ResponseEntity.ok(postService.create(post, getAuthenticatedUserId(authentication)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<Post> getAll() {
        return postService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getById(@PathVariable Long id) {
        return postService.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Post post, Authentication authentication) {
        try {
            return ResponseEntity.ok(postService.update(id, getAuthenticatedUserId(authentication), post));
        } catch (IllegalArgumentException e) {
            String message = e.getMessage() != null ? e.getMessage() : "";
            int status = message.contains("nao foi encontrada") ? 404 : 400;
            return ResponseEntity.status(status).body(message);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        try {
            postService.delete(id, getAuthenticatedUserId(authentication));
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            String message = e.getMessage() != null ? e.getMessage() : "";
            int status = message.contains("nao foi encontrada") ? 404 : 400;
            return ResponseEntity.status(status).body(message);
        }
    }
}
