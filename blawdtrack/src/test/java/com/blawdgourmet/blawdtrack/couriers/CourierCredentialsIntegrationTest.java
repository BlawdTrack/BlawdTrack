package com.blawdgourmet.blawdtrack.couriers;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Generador, BCrypt, eventos, correo y login reales; se sustituye solo el transporte externo. */
@SpringBootTest
@AutoConfigureMockMvc
class CourierCredentialsIntegrationTest {
    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private CourierRepository couriers;
    @Autowired private JwtService jwt;
    @Autowired private PasswordEncoder encoder;
    @MockitoBean private JavaMailSender sender;

    @Test
    void claveRecibidaPorCorreoPermiteLoginYEsDistintaParaCadaMensajero() throws Exception {
        List<MimeMessage> delivered = new ArrayList<>();
        when(sender.createMimeMessage()).thenAnswer(i -> new MimeMessage(Session.getInstance(new Properties())));
        doAnswer(i -> { delivered.add(i.getArgument(0)); return null; }).when(sender).send(any(MimeMessage.class));
        var actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA).documentNumber("ACTOR70E2E")
                .fullName("Administrador de prueba").email("actor70e2e@example.test").passwordHash("unused")
                .status(UserStatus.ACTIVE).role(roles.findByName("SUPER_USUARIO").orElseThrow()).build());
        String token = jwt.generateToken(new UserPrincipal(actor));
        List<String> passwords = new ArrayList<>();
        try {
            for (int i = 0; i < 2; i++) {
                String email = "courier70e2e" + i + "@example.test";
                String body = """
                        {"documentType":"CEDULA","documentNumber":"97000070%d","fullName":"Mensajero prueba",
                         "email":"%s","password":"ClaveElegidaPorCliente!",
                         "phone":"8888888%d","schedule":"Lunes a viernes","maxPackageWeightKg":20}
                        """.formatted(i, email, i);
                mvc.perform(post("/api/v1/couriers").header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON).content(body))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.password").doesNotExist())
                        .andExpect(jsonPath("$.passwordHash").doesNotExist())
                        .andExpect(jsonPath("$.temporaryPassword").doesNotExist());
                assertThat(delivered).hasSize(i + 1);
                var message = delivered.get(i);
                message.saveChanges();
                assertThat(message.getAllRecipients()[0].toString()).isEqualTo(email);
                String plain = plainText(message);
                assertThat(plain).contains("Contraseña temporal: ");
                String password = plain.split("Contraseña temporal: ", 2)[1].split("\\R", 2)[0];
                assertThat(password).hasSize(20).isNotEqualTo("ClaveElegidaPorCliente!");
                passwords.add(password);
                var user = users.findByEmail(email).orElseThrow();
                assertThat(encoder.matches(password, user.getPasswordHash())).isTrue();
                assertThat(user.getPasswordHash()).isNotEqualTo(password);
                assertThat(couriers.findByUserId(user.getId())).isPresent();
                mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                                .content(new ObjectMapper().writeValueAsString(java.util.Map.of("email", email, "password", password))))
                        .andExpect(status().isOk()).andExpect(jsonPath("$.role").value("MENSAJERO"))
                        .andExpect(jsonPath("$.token").isNotEmpty());
                mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                                .content(new ObjectMapper().writeValueAsString(java.util.Map.of("email", email, "password", "ClaveElegidaPorCliente!"))))
                        .andExpect(status().isUnauthorized());
                mvc.perform(post("/api/v1/couriers").header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON).content(body))
                        .andExpect(status().isConflict());
                assertThat(delivered).hasSize(i + 1);
            }
            assertThat(passwords.get(0)).isNotEqualTo(passwords.get(1));
            verify(sender, times(2)).send(any(MimeMessage.class));
        } finally {
            for (String email : List.of("courier70e2e0@example.test", "courier70e2e1@example.test", "actor70e2e@example.test")) {
                users.findByEmail(email).ifPresent(user -> {
                    couriers.findByUserId(user.getId()).ifPresent(couriers::delete);
                    users.delete(user);
                });
            }
        }
    }

    private String plainText(Part part) throws Exception {
        if (part.isMimeType("text/plain")) return (String) part.getContent();
        if (part.getContent() instanceof Multipart multipart) {
            for (int i = 0; i < multipart.getCount(); i++) {
                String text = plainText(multipart.getBodyPart(i));
                if (text != null) return text;
            }
        }
        return null;
    }
}
