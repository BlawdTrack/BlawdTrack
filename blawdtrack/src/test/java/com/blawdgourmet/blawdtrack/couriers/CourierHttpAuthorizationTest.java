package com.blawdgourmet.blawdtrack.couriers;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;
import static org.assertj.core.api.Assertions.assertThat;

/** Usa Tomcat real para incluir los despachos de error que MockMvc no reproduce. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CourierHttpAuthorizationTest {
    @Value("${local.server.port}") private int port;
    @Autowired private JwtService jwt;
    @Autowired private RoleRepository roles;

    @Test
    void mensajeroAutenticadoRecibe403EnHttpReal() throws Exception {
        var user = User.builder().id(987654L).email("http-test@example.test")
                .fullName("Prueba HTTP").status(UserStatus.ACTIVE)
                .role(roles.findByName("MENSAJERO").orElseThrow()).build();
        String token = jwt.generateToken(new UserPrincipal(user));
        assertThat(post(token)).isEqualTo(403);
    }

    @Test
    void tokenInvalidoRecibe401EnHttpReal() throws Exception {
        assertThat(post("invalid-token")).isEqualTo(401);
    }

    private int post(String token) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1/couriers"))
                .header("Authorization", "Bearer " + token).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("""
                        {"nationalId":"HTTP70","fullName":"Prueba HTTP","email":"new-http@example.test",
                         "phone":"88888888","schedule":"Lunes a viernes","maxPackageWeightKg":20}
                        """)).build();
        try (var client = HttpClient.newHttpClient()) {
            return client.send(request, HttpResponse.BodyHandlers.discarding()).statusCode();
        }
    }
}
