package com.art_nunki.nunki;

import com.art_nunki.nunki.model.Post;
import com.art_nunki.nunki.model.User;
import com.art_nunki.nunki.repository.AuthSessionTokenRepository;
import com.art_nunki.nunki.repository.PasswordResetTokenRepository;
import com.art_nunki.nunki.repository.PostRepository;
import com.art_nunki.nunki.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Autowired
    private AuthSessionTokenRepository authSessionTokenRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        authSessionTokenRepository.deleteAll();
        passwordResetTokenRepository.deleteAll();
        postRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void blocksUnauthenticatedPostCreation() throws Exception {
        mockMvc.perform(post("/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Sem sessao",
                                "description", "Teste",
                                "imageUrl", "https://example.com/image.png",
                                "category", "Digital"
                        ))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void hashesPasswordAndAllowsAuthenticatedAuthoringWithBearerToken() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Yukii",
                                "email", "yukii@example.com",
                                "password", "1234"
                        ))))
                .andExpect(status().isOk());

        User savedUser = userRepository.findByEmail("yukii@example.com").orElseThrow();
        assertThat(savedUser.getPassword()).isNotEqualTo("1234");
        assertThat(passwordEncoder.matches("1234", savedUser.getPassword())).isTrue();

        String token = objectMapper.readTree(mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "yukii@example.com",
                                "password", "1234"
                        ))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString()).get("token").asText();

        mockMvc.perform(post("/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Com sessao",
                                "description", "Teste autenticado",
                                "imageUrl", "https://example.com/image.png",
                                "category", "Digital"
                        ))))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.user.email").value("yukii@example.com"));

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("yukii@example.com"));
    }

    @Test
    void deletingUserKeepsPostAndRemovesAuthorReference() throws Exception {
        User user = new User();
        user.setName("Artista");
        user.setEmail("artista@example.com");
        user.setPassword(passwordEncoder.encode("1234"));
        user = userRepository.save(user);

        Post post = new Post();
        post.setTitle("Obra");
        post.setDescription("Descricao");
        post.setImageUrl("https://example.com/obra.png");
        post.setCategory("Digital");
        post.setUser(user);
        post = postRepository.save(post);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", user.getId());

        mockMvc.perform(delete("/users/{id}", user.getId()).session(session))
                .andExpect(status().isNoContent());

        Post remainingPost = postRepository.findById(post.getId()).orElseThrow();
        assertThat(remainingPost.getUser()).isNull();
        assertThat(userRepository.findById(user.getId())).isEmpty();
    }

    @Test
    void migratesLegacyPlaintextPasswordOnLogin() throws Exception {
        User user = new User();
        user.setName("Legado");
        user.setEmail("legado@example.com");
        user.setPassword("1234");
        userRepository.save(user);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "legado@example.com",
                                "password", "1234"
                        ))))
                .andExpect(status().isOk());

        User migratedUser = userRepository.findByEmail("legado@example.com").orElseThrow();
        assertThat(migratedUser.getPassword()).isNotEqualTo("1234");
        assertThat(passwordEncoder.matches("1234", migratedUser.getPassword())).isTrue();
    }
}
