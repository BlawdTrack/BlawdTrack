package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.couriers.service.CourierWorkloadPort;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import java.math.BigDecimal;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * HU-005 / Task 301: el puerto real de carga de trabajo del mensajero contra la base de datos de pruebas, y su efecto
 * en la desactivación (el validador y el endpoint no cambian).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PackageCourierWorkloadIntegrationTest {

    @Autowired private CourierWorkloadPort workload;
    @Autowired private DeliveryPackageRepository packages;
    @Autowired private CourierRepository couriers;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private JwtService jwt;
    @Autowired private MockMvc mvc;

    private final AtomicInteger sequence = new AtomicInteger(1);
    private Courier courier;

    @BeforeEach
    void courier() {
        courier = newCourier("mensajero-carga");
    }

    @ParameterizedTest
    @EnumSource(value = PackageStatus.class, names = {"ASSIGNED", "SHIPPED", "IN_TRANSIT"})
    void unPaqueteEnUnEstadoOperativoCuentaComoAsignacionActiva(PackageStatus status) {
        assign(courier, status);

        assertThat(workload.hasActiveAssignments(courier.getId())).isTrue();
    }

    @ParameterizedTest
    @EnumSource(value = PackageStatus.class, names = {"DELIVERED", "NOT_DELIVERED"})
    void losPaquetesTerminadosNoCuentan(PackageStatus status) {
        assign(courier, status);

        assertThat(workload.hasActiveAssignments(courier.getId())).isFalse();
    }

    @Test
    void sinPaquetesNoTieneAsignacionesActivas() {
        assertThat(workload.hasActiveAssignments(courier.getId())).isFalse();
    }

    @Test
    void unSoloPaqueteActivoEntreVariosTerminadosBasta() {
        assign(courier, PackageStatus.DELIVERED);
        assign(courier, PackageStatus.NOT_DELIVERED);
        assign(courier, PackageStatus.IN_TRANSIT);

        assertThat(workload.hasActiveAssignments(courier.getId())).isTrue();
    }

    @Test
    void losPaquetesDeOtroMensajeroNoCuentan() {
        assign(newCourier("otro-mensajero"), PackageStatus.IN_TRANSIT);

        assertThat(workload.hasActiveAssignments(courier.getId())).isFalse();
    }

    @Test
    void conPaquetesActivosElEndpointNoDesactivaAlMensajeroYRespondeConflicto() throws Exception {
        assign(courier, PackageStatus.ASSIGNED);

        mvc.perform(patch("/api/v1/couriers/" + courier.getId() + "/deactivate")
                        .header("Authorization", "Bearer " + superUserToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("COURIER_HAS_ACTIVE_ASSIGNMENTS"));

        assertThat(users.findById(courier.getUser().getId()).orElseThrow().getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    void sinPaquetesActivosElEndpointDesactivaAlMensajero() throws Exception {
        assign(courier, PackageStatus.DELIVERED);

        mvc.perform(patch("/api/v1/couriers/" + courier.getId() + "/deactivate")
                        .header("Authorization", "Bearer " + superUserToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        assertThat(users.findById(courier.getUser().getId()).orElseThrow().getStatus()).isEqualTo(UserStatus.INACTIVE);
    }

    private Courier newCourier(String name) {
        int n = sequence.getAndIncrement();
        User user = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("7-0301-" + String.format("%04d", n)).fullName("Mensajero " + name)
                .email(name + "-" + n + "@example.test").passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("MENSAJERO").orElseThrow()).build());
        return couriers.saveAndFlush(Courier.builder().user(user).schedule("Lunes a viernes")
                .maxPackageWeightKg(new BigDecimal("20.00")).build());
    }

    private void assign(Courier target, PackageStatus status) {
        packages.saveAndFlush(DeliveryPackage.builder()
                .shipmentNumber("ENV-301-" + sequence.getAndIncrement())
                .assignedCourier(target)
                .status(status)
                .build());
    }

    private String superUserToken() {
        User actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("7-0301-9" + String.format("%03d", sequence.getAndIncrement()))
                .fullName("Super Task 301").email("super-301-" + sequence.get() + "@example.test")
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("SUPER_USUARIO").orElseThrow()).build());
        return jwt.generateToken(new UserPrincipal(actor));
    }
}
