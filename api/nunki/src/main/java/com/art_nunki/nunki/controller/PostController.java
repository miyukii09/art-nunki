package com.art_nunki.nunki.controller;

import com.art_nunki.nunki.model.Post;
import com.art_nunki.nunki.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public Post create(@RequestBody Post post) {
        return postService.create(post);
    }

    @GetMapping
    public List<Post> getAll() {
        return postService.getAll();
    }
}