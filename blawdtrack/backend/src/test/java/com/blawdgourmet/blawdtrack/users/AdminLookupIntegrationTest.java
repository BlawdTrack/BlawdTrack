package com.blawdgourmet.blawdtrack.users;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Búsqueda y validación de existencia de un administrador antes de modificarlo (HU-007 / T01). */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminLookupIntegrationTest {

    private static final String PATH = "/api/v1/admins/{documentType}/{documentNumber}";

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;

    private final AtomicInteger sequence = new AtomicInteger(1);

    @Test
    void superUserFindsAnExistingAdminAndGetsItsProfileWithoutCredentials() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-existente@example.test");

        mvc.perform(get(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(admin.getId()))
                .andExpect(jsonPath("$.documentType").value("CEDULA"))
                .andExpect(jsonPath("$.documentNumber").value(admin.getDocumentNumber()))
                .andExpect(jsonPath("$.fullName").value("Administrador de prueba"))
                .andExpect(jsonPath("$.email").value("admin-existente@example.test"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void unknownDocumentReturns404WithADescriptiveError() throws Exception {
        mvc.perform(get(PATH, DocumentType.CEDULA, "1-2345-6780")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ADMINISTRADOR_NO_EXISTENTE"))
                .andExpect(jsonPath("$.message").value("Administrador no existente"));
    }

    @Test
    void aUserThatIsNotASalesAdminIsNotFound() throws Exception {
        User courier = save(RoleName.COURIER, "mensajero-existente@example.test");

        mvc.perform(get(PATH, courier.getDocumentType(), courier.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ADMINISTRADOR_NO_EXISTENTE"));
    }

    @Test
    void sameDocumentNumberUnderAnotherTypeIsAnotherPerson() throws Exception {
        save(RoleName.SALES_ADMIN, "admin-dimex@example.test", DocumentType.DIMEX, "12345678901");

        mvc.perform(get(PATH, DocumentType.CEDULA, "12345678901")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isNotFound());
        mvc.perform(get(PATH, DocumentType.DIMEX, "12345678901")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documentType").value("DIMEX"));
    }

    @Test
    void invalidDocumentFormatReturns400() throws Exception {
        mvc.perform(get(PATH, DocumentType.CEDULA, "abc")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void onlyTheSuperUserCanSearch() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-objetivo@example.test");

        for (String role : new String[] {RoleName.SALES_ADMIN, RoleName.COURIER}) {
            mvc.perform(get(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                            .header("Authorization", "Bearer " + token(role)))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void authorizationIsResolvedBeforeValidatingTheDocument() throws Exception {
        mvc.perform(get(PATH, DocumentType.CEDULA, "abc")
                        .header("Authorization", "Bearer " + token(RoleName.SALES_ADMIN)))
                .andExpect(status().isForbidden());
        mvc.perform(get(PATH, "NIT", "123456789")
                        .header("Authorization", "Bearer " + token(RoleName.COURIER)))
                .andExpect(status().isForbidden());
    }

    @Test
    void requestWithoutTokenReturns401() throws Exception {
        mvc.perform(get(PATH, DocumentType.CEDULA, "1-2345-6789"))
                .andExpect(status().isUnauthorized());
    }

    private User save(String role, String email) {
        return save(role, email, DocumentType.CEDULA, String.format("9-0100-%04d", sequence.getAndIncrement()));
    }

    private User save(String role, String email, DocumentType documentType, String documentNumber) {
        return users.saveAndFlush(User.builder()
                .documentType(documentType)
                .documentNumber(documentNumber)
                .fullName("Administrador de prueba")
                .email(email)
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow())
                .build());
    }

    private String token(String role) {
        User actor = save(role, "actor-lookup-" + role + "-" + sequence.get() + "@example.test");
        return jwt.generateToken(new UserPrincipal(actor));
    }
}
