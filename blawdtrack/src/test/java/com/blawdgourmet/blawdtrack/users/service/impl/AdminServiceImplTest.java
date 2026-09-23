package com.blawdgourmet.blawdtrack.users.service.impl;

import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    private static Validator validator;

    @BeforeAll
    static void inicializarValidador() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @AfterAll
    static void cerrarValidador() {
        Validation.buildDefaultValidatorFactory().close();
    }

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuditService auditService;

    @Test
    void registraAdministradorConDocumentoYCorreoValidosYUnicos() {
        var service = new AdminServiceImpl(userRepository, roleRepository, passwordEncoder, auditService);
        var role = Role.builder().name(RoleName.SALES_ADMIN).build();
        var actor = new AuthenticatedUser(10L, "999999999", "Super usuario", "SUPER_USUARIO", "super@example.com");
        var request = request("1-2345-6789", "Admin@Example.com");
        when(userRepository.existsByDocumentId("123456789")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("Admin@Example.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.SALES_ADMIN)).thenReturn(java.util.Optional.of(role));
        when(passwordEncoder.encode("Clave1234")).thenReturn("hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(20L);
            return user;
        });

        var response = service.registrarAdministrador(request, actor);

        assertThat(response.cedulaIdentidad()).isEqualTo("123456789");
        assertThat(response.correoElectronico()).isEqualTo("Admin@Example.com");
        verify(userRepository).existsByDocumentId("123456789");
        verify(userRepository).existsByEmailIgnoreCase("Admin@Example.com");
        verify(userRepository).save(argThat(user -> "123456789".equals(user.getDocumentId())));
        verify(auditService).registrarCreacionAdministrador(eq(actor),
                argThat(user -> user.getId() != null && "123456789".equals(user.getDocumentId())));
    }

    @Test
    void rechazaDocumentoDuplicadoAunqueCambienLosSeparadores() {
        var service = new AdminServiceImpl(userRepository, roleRepository, passwordEncoder, auditService);
        when(userRepository.existsByDocumentId("123456789")).thenReturn(true);

        assertThatThrownBy(() -> service.registrarAdministrador(request(" 1-2345-6789 ", "nuevo@example.com"), null))
                .hasMessageContaining("identity document");

        verify(userRepository).existsByDocumentId("123456789");
        verify(userRepository, never()).existsByEmailIgnoreCase(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void rechazaCorreoDuplicadoSinDistinguirMayusculas() {
        var service = new AdminServiceImpl(userRepository, roleRepository, passwordEncoder, auditService);
        when(userRepository.existsByDocumentId("123456789")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("Admin@Example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.registrarAdministrador(request("123456789", " Admin@Example.com "), null))
                .hasMessageContaining("email address");

        verify(userRepository).existsByEmailIgnoreCase("Admin@Example.com");
        verify(userRepository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"12345678", "1234567890123", "12345678A"})
    void rechazaFormatoDeDocumentoInvalido(String documento) {
        assertThat(violaciones(request(documento, "admin@example.com"))).isNotEmpty();
    }

    @Test
    void aceptaDimexDeOnceODoceDigitos() {
        assertThat(violaciones(request("12345678901", "admin@example.com"))).isEmpty();
        assertThat(violaciones(request("123456789012", "admin@example.com"))).isEmpty();
    }

    @Test
    void rechazaFormatoDeCorreoInvalido() {
        assertThat(violaciones(request("123456789", "correo-invalido"))).isNotEmpty();
    }

    private static AdminRegistrationRequest request(String documento, String correo) {
        return new AdminRegistrationRequest("Administrador de prueba", "88888888", correo,
                "Clave1234", documento);
    }

    private static Set<jakarta.validation.ConstraintViolation<AdminRegistrationRequest>> violaciones(
            AdminRegistrationRequest request) {
        return validator.validate(request);
    }

}
