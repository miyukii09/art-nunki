package com.art_nunki.nunki.controller;

import com.art_nunki.nunki.model.Post;
import com.art_nunki.nunki.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Post post) {
        try {
            return ResponseEntity.ok(postService.create(post));
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
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Post post) {
        try {
            return ResponseEntity.ok(postService.update(id, post));
        } catch (IllegalArgumentException e) {
            String message = e.getMessage() != null ? e.getMessage() : "";
            int status = message.contains("nao foi encontrada") ? 404 : 400;
            return ResponseEntity.status(status).body(message);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @RequestParam Long userId) {
        try {
            postService.delete(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            String message = e.getMessage() != null ? e.getMessage() : "";
            int status = message.contains("nao foi encontrada") ? 404 : 400;
            return ResponseEntity.status(status).body(message);
        }
    }
}
