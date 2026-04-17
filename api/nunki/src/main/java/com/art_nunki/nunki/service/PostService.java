package com.art_nunki.nunki.service;

import com.art_nunki.nunki.model.Post;
import com.art_nunki.nunki.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public Post create(Post post) {
        return postRepository.save(post);
    }

    public List<Post> getAll() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }
}
