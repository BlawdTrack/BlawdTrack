package com.blawdgourmet.blawdtrack.users;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminDeletionEligibilityIntegrationTest {

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;

    private static final String PATH = "/api/v1/admins/{documentType}/{documentNumber}/elegibilidad-eliminacion";

    private final AtomicInteger documentNumberSequence = new AtomicInteger(1);

    @Test
    void superUserQueriesAdminWithoutRecentSession() throws Exception {
        User admin = guardarUsuario(RoleName.SALES_ADMIN, "admin-sin-sesion@example.test", null);

        mvc.perform(get(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documentType").value("CEDULA"))
                .andExpect(jsonPath("$.documentNumber").value(admin.getDocumentNumber()))
                .andExpect(jsonPath("$.eligibleForDeletion").value(true))
                .andExpect(jsonPath("$.hasActiveSession").value(false))
                .andExpect(jsonPath("$.ineligibilityReason").doesNotExist());
    }

    @Test
    void superUserQueriesAdminWithRecentSession() throws Exception {
        User admin = guardarUsuario(RoleName.SALES_ADMIN, "admin-con-sesion@example.test", LocalDateTime.now());

        mvc.perform(get(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eligibleForDeletion").value(false))
                .andExpect(jsonPath("$.hasActiveSession").value(true))
                .andExpect(jsonPath("$.ineligibilityReason").isNotEmpty());
    }

    @Test
    void unknownDocumentReturns404WithBusinessCode() throws Exception {
        mvc.perform(get(PATH, DocumentType.CEDULA, "1-2345-6780")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ADMINISTRADOR_NO_EXISTENTE"));
    }

    @Test
    void invalidDocumentReturns400() throws Exception {
        mvc.perform(get(PATH, DocumentType.CEDULA, "abc")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownDocumentTypeReturns400() throws Exception {
        mvc.perform(get(PATH, "NIT", "123456789")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void sameDocumentNumberUnderAnotherTypeResolvesToTheRightAdmin() throws Exception {
        // Una CEDULA y un DIMEX pueden compartir los mismos 11-12 dígitos (unicidad por tipo + número).
        guardarUsuario(RoleName.COURIER, "mensajero-mismo-numero@example.test",
                DocumentType.CEDULA, "12345678901", null);
        User admin = guardarUsuario(RoleName.SALES_ADMIN, "admin-mismo-numero@example.test",
                DocumentType.DIMEX, "12345678901", null);

        String tokenSuperUsuario = token(RoleName.SUPER_USER);

        mvc.perform(get(PATH, DocumentType.DIMEX, "12345678901")
                        .header("Authorization", "Bearer " + tokenSuperUsuario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(admin.getId()))
                .andExpect(jsonPath("$.documentType").value("DIMEX"))
                .andExpect(jsonPath("$.documentNumber").value("12345678901"));

        mvc.perform(get(PATH, DocumentType.CEDULA, "12345678901")
                        .header("Authorization", "Bearer " + tokenSuperUsuario))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ADMINISTRADOR_NO_EXISTENTE"));
    }

    @Test
    void operationalRolesCannotQuery() throws Exception {
        User admin = guardarUsuario(RoleName.SALES_ADMIN, "admin-objetivo@example.test", null);

        mvc.perform(get(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SALES_ADMIN)))
                .andExpect(status().isForbidden());
        mvc.perform(get(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.COURIER)))
                .andExpect(status().isForbidden());
    }

    @Test
    void operationalRolesWithInvalidDocumentGetForbiddenNotValidation() throws Exception {
        // La autorizacion debe resolverse antes del binding/validacion: un rol sin permiso
        // no debe enterarse de si el formato de lo que envio es valido.
        String tokenSalesAdmin = token(RoleName.SALES_ADMIN);
        String tokenCourier = token(RoleName.COURIER);

        mvc.perform(get(PATH, DocumentType.CEDULA, "abc")
                        .header("Authorization", "Bearer " + tokenSalesAdmin))
                .andExpect(status().isForbidden());
        mvc.perform(get(PATH, "NIT", "123456789")
                        .header("Authorization", "Bearer " + tokenSalesAdmin))
                .andExpect(status().isForbidden());
        mvc.perform(get(PATH, DocumentType.CEDULA, "abc")
                        .header("Authorization", "Bearer " + tokenCourier))
                .andExpect(status().isForbidden());
        mvc.perform(get(PATH, "NIT", "123456789")
                        .header("Authorization", "Bearer " + tokenCourier))
                .andExpect(status().isForbidden());
    }

    @Test
    void requestWithoutTokenAndInvalidDocumentReturns401() throws Exception {
        mvc.perform(get(PATH, "NIT", "abc"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void requestWithoutTokenReturns401() throws Exception {
        mvc.perform(get(PATH, DocumentType.CEDULA, "1-2345-6789"))
                .andExpect(status().isUnauthorized());
    }

    private User guardarUsuario(String rol, String correo, LocalDateTime lastLoginAt) {
        return guardarUsuario(rol, correo, DocumentType.CEDULA,
                String.format("9-0000-%04d", documentNumberSequence.getAndIncrement()), lastLoginAt);
    }

    private User guardarUsuario(String rol, String correo, DocumentType documentType, String documentNumber,
            LocalDateTime lastLoginAt) {
        User user = User.builder()
            .documentType(documentType)
            .documentNumber(documentNumber)
                .fullName("Administrador de prueba")
                .email(correo)
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(rol).orElseThrow())
                .lastLoginAt(lastLoginAt)
                .build();
        return users.saveAndFlush(user);
    }

    private String token(String rol) {
        User user = guardarUsuario(rol, "actor-" + rol + "@example.test", null);
        return jwt.generateToken(new UserPrincipal(user));
    }
}
