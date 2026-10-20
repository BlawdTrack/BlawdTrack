package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.time.LocalTime;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PackageBulkRegistrationIntegrationTest {

    private static final String ENDPOINT = "/api/v1/packages/import";
    private static final String CSV = """
            Packing Number,SO Number,Customer Name,Shipping Address,Shipping Phone,Notes
            ENV-266-1,SO-1,Cliente Uno,San Jose,8888-0001,
            ENV-266-2,SO-2,Cliente Dos,Heredia,8888-0002,De 10 a 2
            ENV-266-3,,Cliente Invalido,,,
            ENV-266-4,SO-4,Cliente Duplicado,Alajuela,8888-0004,
            """;

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private DeliveryPackageRepository packageRepository;
    @Autowired private AuditLogRepository auditLogRepository;

    private final AtomicInteger sequence = new AtomicInteger();

    @Test
    void administradorVentasPersisteSoloValidosConEstadoPendienteYHorarioCalculado()
            throws Exception {
        packageRepository.saveAndFlush(DeliveryPackage.builder()
                .shipmentNumber("ENV-266-4")
                .build());

        mvc.perform(multipart(ENDPOINT)
                        .file(file(CSV))
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalRecords").value(4))
                .andExpect(jsonPath("$.registeredRecordsCount").value(2))
                .andExpect(jsonPath("$.invalidRecordsCount").value(1))
                .andExpect(jsonPath("$.duplicateRecordsCount").value(1))
                .andExpect(jsonPath("$.registeredShipmentNumbers[0]").value("ENV-266-1"))
                .andExpect(jsonPath("$.registeredShipmentNumbers[1]").value("ENV-266-2"));

        DeliveryPackage defaultWindow = find("ENV-266-1");
        assertThat(defaultWindow.getStatus()).isEqualTo(PackageStatus.PENDING);
        assertThat(defaultWindow.getDeliveryStartTime()).isEqualTo(LocalTime.of(9, 0));
        assertThat(defaultWindow.getDeliveryEndTime()).isEqualTo(LocalTime.of(16, 0));
        assertThat(defaultWindow.getCustomerName()).isEqualTo("Cliente Uno");

        DeliveryPackage requestedWindow = find("ENV-266-2");
        assertThat(requestedWindow.getDeliveryStartTime()).isEqualTo(LocalTime.of(10, 0));
        assertThat(requestedWindow.getDeliveryEndTime()).isEqualTo(LocalTime.of(14, 0));
        assertThat(packageRepository.findExistingShipmentNumbers(
                java.util.Set.of("ENV-266-3"))).isEmpty();
    }

    @Test
    void guardaElRangoDeEntregaQueCalculanLasRestriccionesDeHorario() throws Exception {
        String csv = """
                Packing Number,SO Number,Customer Name,Shipping Address,Shipping Phone,Notes
                ENV-300-1,SO-1,Cliente Uno,San Jose,8888-0001,
                ENV-300-2,SO-2,Cliente Dos,Heredia,8888-0002,Antes de las 3 p.m.
                ENV-300-3,SO-3,Cliente Tres,Alajuela,8888-0003,Después de las dos de la tarde
                ENV-300-4,SO-4,Cliente Cuatro,Cartago,8888-0004,antes de las 10 a.m.
                ENV-300-5,SO-5,Cliente Cinco,Limon,8888-0005,Dejar en recepción
                """;

        mvc.perform(multipart(ENDPOINT)
                        .file(file(csv))
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.registeredRecordsCount").value(5));

        assertWindow("ENV-300-1", LocalTime.of(9, 0), LocalTime.of(16, 0));   // sin restricción
        assertWindow("ENV-300-2", LocalTime.of(9, 0), LocalTime.of(14, 0));   // una hora antes de las 3 p.m.
        assertWindow("ENV-300-3", LocalTime.of(14, 0), LocalTime.of(16, 0));  // desde las 2 p.m.
        assertWindow("ENV-300-4", LocalTime.of(9, 0), LocalTime.of(16, 0));   // rango imposible: por defecto
        assertWindow("ENV-300-5", LocalTime.of(9, 0), LocalTime.of(16, 0));   // texto sin hora
    }

    private void assertWindow(String shipmentNumber, LocalTime start, LocalTime end) {
        DeliveryPackage stored = find(shipmentNumber);
        assertThat(stored.getDeliveryStartTime()).as(shipmentNumber).isEqualTo(start);
        assertThat(stored.getDeliveryEndTime()).as(shipmentNumber).isEqualTo(end);
    }

    @Test
    void elAltaDeCadaPaqueteEsElPrimerEventoDeSuLineaDeTiempo() throws Exception {
        mvc.perform(multipart(ENDPOINT)
                        .file(file(CSV))
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.registeredRecordsCount").value(3));

        var registros = auditLogRepository.findByActionOrderByTimestampDescIdDesc(
                AuditAction.PACKAGE_CREATED.getCode());
        assertThat(registros).hasSize(3);
        assertThat(registros).allSatisfy(registro -> {
            assertThat(registro.getActor().getFullName()).isEqualTo("Actor T266");
            assertThat(registro.getTimestamp()).isNotNull();
            assertThat(registro.getPreviousStatus()).isNull();
            assertThat(registro.getNewStatus()).isEqualTo(PackageStatus.PENDING.name());
        });

        mvc.perform(get("/api/v1/packages/ENV-266-1/history")
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].action").value("REGISTRAR_PAQUETE"))
                .andExpect(jsonPath("$[0].actorName").value("Actor T266"))
                .andExpect(jsonPath("$[0].newStatus").value("PENDING"))
                .andExpect(jsonPath("$[0].timestamp").isNotEmpty());
    }

    @Test
    void losPaquetesNoRegistradosNoDejanAltaEnLaAuditoria() throws Exception {
        packageRepository.saveAndFlush(DeliveryPackage.builder().shipmentNumber("ENV-266-4").build());

        mvc.perform(multipart(ENDPOINT)
                        .file(file(CSV))
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isCreated());

        assertThat(auditLogRepository.findByActionOrderByTimestampDescIdDesc(
                AuditAction.PACKAGE_CREATED.getCode())).hasSize(2);
    }

    @Test
    void superUsuarioPuedeEjecutarRegistroMasivoPorSuPermisoDeImportacion() throws Exception {
        mvc.perform(multipart(ENDPOINT)
                        .file(file(CSV))
                        .header("Authorization", bearer(RoleName.SUPER_USER)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalRecords").value(4))
                .andExpect(jsonPath("$.registeredRecordsCount").value(3))
                .andExpect(jsonPath("$.invalidRecordsCount").value(1))
                .andExpect(jsonPath("$.duplicateRecordsCount").value(0));

        assertThat(packageRepository.count()).isEqualTo(3);
    }

    @Test
    void peticionSinSesionNoPuedeRegistrarPaquetes() throws Exception {
        mvc.perform(multipart(ENDPOINT).file(file(CSV)))
                .andExpect(status().isUnauthorized());
    }

    private DeliveryPackage find(String shipmentNumber) {
        return packageRepository.findAll().stream()
                .filter(deliveryPackage -> shipmentNumber.equals(deliveryPackage.getShipmentNumber()))
                .findFirst()
                .orElseThrow();
    }

    private MockMultipartFile file(String content) {
        return new MockMultipartFile(
                "file", "paquetes.csv", "text/csv",
                content.getBytes(StandardCharsets.UTF_8));
    }

    private String bearer(String roleName) {
        int id = sequence.incrementAndGet();
        User actor = userRepository.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("8-2660-%04d", id))
                .fullName("Actor T266")
                .email("task266-" + roleName + "-" + id + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roleRepository.findByName(roleName).orElseThrow())
                .build());
        return "Bearer " + jwtService.generateToken(new UserPrincipal(actor));
    }
}
