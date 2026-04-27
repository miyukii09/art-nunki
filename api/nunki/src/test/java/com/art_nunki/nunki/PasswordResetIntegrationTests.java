package com.art_nunki.nunki;

import com.art_nunki.nunki.model.User;
import com.art_nunki.nunki.repository.PasswordResetTokenRepository;
import com.art_nunki.nunki.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "app.password-reset.expose-reset-url=true")
class PasswordResetIntegrationTests {

    private static final Pattern TOKEN_PATTERN = Pattern.compile("token=([^\\\"]+)");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @BeforeEach
    void cleanUsers() {
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void resetsPasswordUsingGeneratedToken() throws Exception {
        User user = new User();
        user.setName("Reset");
        user.setEmail("reset@example.com");
        user.setPassword("1234");
        userRepository.save(user);

        String responseBody = mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "reset@example.com",
                                "appBaseUrl", "http://localhost:3000"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resetUrl").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Matcher matcher = TOKEN_PATTERN.matcher(responseBody);
        assertThat(matcher.find()).isTrue();
        String token = matcher.group(1);

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "token", token,
                                "password", "nova1234"
                        ))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "reset@example.com",
                                "password", "nova1234"
                        ))))
                .andExpect(status().isOk());
    }
}
