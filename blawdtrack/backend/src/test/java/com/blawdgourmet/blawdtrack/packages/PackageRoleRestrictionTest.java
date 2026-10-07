package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.packages.controller.PackageDeletionController;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.packages.service.PackageNotFoundException;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

/**
 * HU-012 / T02 (#118): la eliminacion de paquetes (DELETE /api/v1/packages/{numeroEnvio}) es
 * exclusiva del rol Administrador de Ventas. Un usuario autenticado con otro rol recibe 403 y
 * una solicitud sin token recibe 401.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PackageRoleRestrictionTest {

    private static final String DELETE_URL = "/api/v1/packages/ENV-0001";

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private DeliveryPackageRepository packages;
    @Autowired private PackageDeletionController controller;

    private final AtomicInteger documentNumberSequence = new AtomicInteger(1);

    @Test
    void solicitudSinTokenDevuelve401() throws Exception {
        mvc.perform(delete(DELETE_URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenInvalidoDevuelve401() throws Exception {
        mvc.perform(delete(DELETE_URL).header("Authorization", "Bearer token-invalido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void mensajeroRecibe403() throws Exception {
        mvc.perform(delete(DELETE_URL).header("Authorization", "Bearer " + token(RoleName.COURIER)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void superUsuarioRecibe403() throws Exception {
        mvc.perform(delete(DELETE_URL).header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void administradorDeVentasEliminaElPaquete() throws Exception {
        packages.saveAndFlush(DeliveryPackage.builder().shipmentNumber("ENV-0001").build());

        mvc.perform(delete(DELETE_URL).header("Authorization", "Bearer " + token(RoleName.SALES_ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Paquete eliminado correctamente."));

        assertThat(packages.findByShipmentNumber("ENV-0001")).isEmpty();
    }

    @Test
    void mensajeroNoEliminaElPaqueteExistente() throws Exception {
        packages.saveAndFlush(DeliveryPackage.builder().shipmentNumber("ENV-0001").build());

        mvc.perform(delete(DELETE_URL).header("Authorization", "Bearer " + token(RoleName.COURIER)))
                .andExpect(status().isForbidden());

        assertThat(packages.findByShipmentNumber("ENV-0001")).isPresent();
    }

    // Las pruebas siguientes invocan el controller directamente para verificar el @PreAuthorize
    // por si solo: con MockMvc la regla de URL de SecurityConfig responde antes y lo taparia.

    @Test
    void preAuthorizeRechazaAlMensajero() {
        autenticarComo(RoleName.COURIER);
        assertThatThrownBy(() -> controller.deletePackage("ENV-0001", null))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void preAuthorizeRechazaAlSuperUsuario() {
        autenticarComo(RoleName.SUPER_USER);
        assertThatThrownBy(() -> controller.deletePackage("ENV-0001", null))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void preAuthorizePermiteAlAdministradorDeVentas() {
        autenticarComo(RoleName.SALES_ADMIN);
        // Supera el guard y llega al servicio, que no encuentra el paquete.
        assertThatThrownBy(() -> controller.deletePackage("ENV-NO-EXISTE", null))
                .isInstanceOf(PackageNotFoundException.class);
    }

    @AfterEach
    void limpiarContextoDeSeguridad() {
        SecurityContextHolder.clearContext();
    }

    private static void autenticarComo(String rol) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "actor-de-prueba", "n/a", List.of(new SimpleGrantedAuthority("ROLE_" + rol))));
    }

    private String token(String rol) {
        User user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("9-3100-%04d", documentNumberSequence.getAndIncrement()))
                .fullName("Actor de prueba")
                .email("actor-package-authz-" + rol + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(rol).orElseThrow())
                .build());
        return jwt.generateToken(new UserPrincipal(user));
    }
}
