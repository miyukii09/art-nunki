package com.art_nunki.nunki.service;

import com.art_nunki.nunki.model.Post;
import com.art_nunki.nunki.repository.PostRepository;
import com.art_nunki.nunki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserRepository userRepository;

    public Post create(Post post) {
        if (post.getTitle() == null || post.getTitle().isBlank()) {
            throw new IllegalArgumentException("Titulo da arte e obrigatorio.");
        }

        if (post.getImageUrl() == null || post.getImageUrl().isBlank()) {
            throw new IllegalArgumentException("URL da imagem e obrigatoria.");
        }

        if (post.getImageUrl().length() > Post.IMAGE_DATA_MAX_CHARS) {
            throw new IllegalArgumentException("A imagem enviada e grande demais. Escolha um arquivo menor.");
        }

        if (post.getCategory() == null || post.getCategory().isBlank()) {
            throw new IllegalArgumentException("Categoria da arte e obrigatoria.");
        }

        if (post.getUser() == null || post.getUser().getId() == null) {
            throw new IllegalArgumentException("Usuario da publicacao e obrigatorio.");
        }

        var author = userRepository.findById(post.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario informado nao foi encontrado."));

        post.setUser(author);
        post.setTitle(post.getTitle().trim());
        post.setDescription(post.getDescription() != null ? post.getDescription().trim() : "");
        post.setImageUrl(post.getImageUrl().trim());
        post.setCategory(post.getCategory().trim());
        return postRepository.save(post);
    }

    public List<Post> getAll() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Post> getById(Long id) {
        return postRepository.findById(id);
    }

    public Post update(Long id, Post updatedPost) {
        if (updatedPost.getTitle() == null || updatedPost.getTitle().isBlank()) {
            throw new IllegalArgumentException("Titulo da arte e obrigatorio.");
        }

        if (updatedPost.getImageUrl() == null || updatedPost.getImageUrl().isBlank()) {
            throw new IllegalArgumentException("URL da imagem e obrigatoria.");
        }

        if (updatedPost.getImageUrl().length() > Post.IMAGE_DATA_MAX_CHARS) {
            throw new IllegalArgumentException("A imagem enviada e grande demais. Escolha um arquivo menor.");
        }

        if (updatedPost.getCategory() == null || updatedPost.getCategory().isBlank()) {
            throw new IllegalArgumentException("Categoria da arte e obrigatoria.");
        }

        if (updatedPost.getUser() == null || updatedPost.getUser().getId() == null) {
            throw new IllegalArgumentException("Usuario da edicao e obrigatorio.");
        }

        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Arte informada nao foi encontrada."));

        Long editorId = updatedPost.getUser().getId();
        Long ownerId = existingPost.getUser() != null ? existingPost.getUser().getId() : null;

        if (ownerId == null || !ownerId.equals(editorId)) {
            throw new IllegalArgumentException("Apenas o autor pode editar esta arte.");
        }

        existingPost.setTitle(updatedPost.getTitle().trim());
        existingPost.setDescription(updatedPost.getDescription() != null ? updatedPost.getDescription().trim() : "");
        existingPost.setImageUrl(updatedPost.getImageUrl().trim());
        existingPost.setCategory(updatedPost.getCategory().trim());

        return postRepository.save(existingPost);
    }

    public void delete(Long id, Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("Usuario da exclusao e obrigatorio.");
        }

        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Arte informada nao foi encontrada."));

        Long ownerId = existingPost.getUser() != null ? existingPost.getUser().getId() : null;

        if (ownerId == null || !ownerId.equals(userId)) {
            throw new IllegalArgumentException("Apenas o autor pode excluir esta arte.");
        }

        postRepository.delete(existingPost);
    }
}
