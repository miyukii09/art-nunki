package com.art_nunki.nunki.controller;

import com.art_nunki.nunki.model.Post;
import com.art_nunki.nunki.service.PostService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    @Autowired
    private PostService postService;

    private Long getAuthenticatedUserId(HttpSession session) {
        return (Long) session.getAttribute("userId");
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Post post, HttpSession session) {
        try {
            return ResponseEntity.ok(postService.create(post, getAuthenticatedUserId(session)));
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
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Post post, HttpSession session) {
        try {
            return ResponseEntity.ok(postService.update(id, getAuthenticatedUserId(session), post));
        } catch (IllegalArgumentException e) {
            String message = e.getMessage() != null ? e.getMessage() : "";
            int status = message.contains("nao foi encontrada") ? 404 : 400;
            return ResponseEntity.status(status).body(message);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpSession session) {
        try {
            postService.delete(id, getAuthenticatedUserId(session));
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            String message = e.getMessage() != null ? e.getMessage() : "";
            int status = message.contains("nao foi encontrada") ? 404 : 400;
            return ResponseEntity.status(status).body(message);
        }
    }
}
