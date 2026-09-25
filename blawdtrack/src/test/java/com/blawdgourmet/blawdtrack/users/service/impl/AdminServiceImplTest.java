package com.blawdgourmet.blawdtrack.users.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminEliminacionElegibilidadResponse;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import com.blawdgourmet.blawdtrack.users.service.AdminNotFoundException;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuditService auditService;

    private AdminServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AdminServiceImpl(userRepository, roleRepository, passwordEncoder, auditService);
        ReflectionTestUtils.setField(service, "jwtExpirationMs", 3_600_000L);
    }

    @Test
    void documentoInexistenteLanzaExcepcionDeAdministradorNoExistente() {
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, "1-2345-6789"))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.validarElegibilidadEliminacion("1-2345-6789"))
                .isInstanceOf(AdminNotFoundException.class)
                .hasMessage("Administrador no existente");
    }

    @Test
    void usuarioConRolDistintoNoSeConsideraAdministrador() {
        User mensajero = usuarioConRol(RoleName.COURIER);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, mensajero.getDocumentNumber()))
            .thenReturn(Optional.of(mensajero));

        assertThatThrownBy(() -> service.validarElegibilidadEliminacion(mensajero.getDocumentNumber()))
                .isInstanceOf(AdminNotFoundException.class);
    }

    @Test
    void loginNuloOVencidoEsElegibleParaEliminar() {
        User sinLogin = usuarioConRol(RoleName.SALES_ADMIN);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, sinLogin.getDocumentNumber()))
            .thenReturn(Optional.of(sinLogin));
        AdminEliminacionElegibilidadResponse sinSesion = service.validarElegibilidadEliminacion(sinLogin.getDocumentNumber());

        User loginVencido = usuarioConRol(RoleName.SALES_ADMIN);
        loginVencido.setDocumentNumber("2-3456-7890");
        loginVencido.setLastLoginAt(LocalDateTime.now().minusHours(2));
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, loginVencido.getDocumentNumber()))
            .thenReturn(Optional.of(loginVencido));
        AdminEliminacionElegibilidadResponse vencida = service.validarElegibilidadEliminacion(loginVencido.getDocumentNumber());

        assertThat(sinSesion.elegibleParaEliminar()).isTrue();
        assertThat(sinSesion.tieneSesionActiva()).isFalse();
        assertThat(vencida.elegibleParaEliminar()).isTrue();
        assertThat(vencida.tieneSesionActiva()).isFalse();
    }

    @Test
    void loginRecienteImpideEliminarYExplicaElMotivo() {
        User administrador = usuarioConRol(RoleName.SALES_ADMIN);
        administrador.setLastLoginAt(LocalDateTime.now().minusMinutes(5));
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, administrador.getDocumentNumber()))
            .thenReturn(Optional.of(administrador));

        AdminEliminacionElegibilidadResponse response =
            service.validarElegibilidadEliminacion(administrador.getDocumentNumber());

        assertThat(response.tieneSesionActiva()).isTrue();
        assertThat(response.elegibleParaEliminar()).isFalse();
        assertThat(response.motivoNoElegible()).isNotBlank();
    }

    private User usuarioConRol(String nombreRol) {
        return User.builder()
                .id(5L)
                .documentType(DocumentType.CEDULA)
                .documentNumber("1-2345-6789")
                .fullName("Ana Perez")
                .email("ana@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(Role.builder().name(nombreRol).build())
                .build();
    }
}