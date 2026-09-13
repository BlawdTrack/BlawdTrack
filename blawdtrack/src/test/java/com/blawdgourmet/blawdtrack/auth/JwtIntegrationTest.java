package com.blawdgourmet.blawdtrack.auth;

import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Task #55: emisión y uso de JWT reales a través de Spring Security. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(JwtIntegrationTest.TestConfig.class)
@Transactional
class JwtIntegrationTest {

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ObjectMapper objectMapper;
    @Value("${security.jwt.secret}") private String secret;
    @Value("${security.jwt.expiration-ms}") private long expirationMs;

    @Test
    void loginEmiteJwtFirmadoConExpiracionYPermiteAccesoSinSesion() throws Exception {
        Role role = roles.save(Role.builder().name("TASK55_ROLE").build());
        User user = users.saveAndFlush(User.builder()
                .nationalId("TASK55").fullName("Usuario JWT")
                .email("task55@example.com")
                .passwordHash(passwordEncoder.encode("Task55-password!"))
                .status(UserStatus.ACTIVE).role(role).build());

        var result = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"task55@example.com","password":"Task55-password!"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andReturn();
        String token = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();
        Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .build().parseSignedClaims(token).getPayload();
        assertThat(claims.getSubject()).isEqualTo(user.getEmail());
        assertThat(claims.get("id", Long.class)).isEqualTo(user.getId());
        assertThat(claims.get("roles", String.class)).isEqualTo("ROLE_TASK55_ROLE");
        assertThat(claims.getExpiration().getTime() - claims.getIssuedAt().getTime())
                .isEqualTo(expirationMs);
        assertThat(claims).doesNotContainKeys("password", "passwordHash");
        assertThat(result.getRequest().getSession(false)).isNull();

        mvc.perform(get("/test/jwt/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string(user.getEmail()));
        mvc.perform(get("/test/jwt/admin").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
        mvc.perform(get("/test/jwt/me")).andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"expired", "wrong-signature", "missing-expiration", "missing-subject", "missing-roles"})
    void tokensInvalidosNoPermitenAcceso(String scenario) throws Exception {
        var builder = Jwts.builder();
        if (!scenario.equals("missing-subject")) builder.subject("task55@example.com");
        if (!scenario.equals("missing-roles")) builder.claim("roles", "ROLE_TASK55_ROLE");
        if (!scenario.equals("missing-expiration")) {
            builder.expiration(new Date(System.currentTimeMillis()
                    + (scenario.equals("expired") ? -60000 : 60000)));
        }
        var key = scenario.equals("wrong-signature")
                ? Jwts.SIG.HS512.key().build()
                : Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        String token = builder.signWith(key).compact();
        mvc.perform(get("/test/jwt/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"Bearer invalid", "Bearer ", "Basic invalid"})
    void cabecerasInvalidasNoPermitenAcceso(String header) throws Exception {
        mvc.perform(get("/test/jwt/me").header("Authorization", header))
                .andExpect(status().isUnauthorized());
    }

    @TestConfiguration
    static class TestConfig {
        @Bean
        ProtectedController protectedController() { return new ProtectedController(); }
    }

    @RestController
    static class ProtectedController {
        @GetMapping("/test/jwt/me")
        @PreAuthorize("hasRole('TASK55_ROLE')")
        public String me(Authentication authentication) { return authentication.getName(); }

        @GetMapping("/test/jwt/admin")
        @PreAuthorize("hasRole('SUPER_USER')")
        public String admin() { return "admin"; }
    }
}
