package com.blawdgourmet.blawdtrack.packages;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.packages.model.Package;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.PackageRepository;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

/**
 * Tests de autorización y respuesta para GET /api/v1/packages/{shipmentNumber}
 * (HU-XXX: consulta de paquete por número de envío).
 * El endpoint es accesible solo para ADMIN_VENTAS.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PackageControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private CourierRepository couriers;
    @Autowired private PackageRepository packages;
    @Autowired private JwtService jwt;

    private User adminVentas;
    private User courierUser;
    private Courier courier;
    private Package pkg;

    @BeforeEach
    void setUp() {
        // Administrador de ventas (creador del paquete)
        adminVentas = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("100000001")
                .documentId("100000001")
                .fullName("Admin Ventas Test")
                .email("adminventas-test@example.com")
                .passwordHash("unused")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName("ADMIN_VENTAS").orElseThrow())
                .build());

        // Mensajero asignado al paquete
        courierUser = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("200000002")
                .documentId("200000002")
                .fullName("Mensajero Test")
                .email("courier-test@example.com")
                .phone("88888888")
                .passwordHash("unused")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName("MENSAJERO").orElseThrow())
                .build());

        courier = couriers.saveAndFlush(Courier.builder()
                .user(courierUser)
                .schedule("Lunes a viernes, 08:00-17:00")
                .maxPackageWeightKg(new BigDecimal("30.00"))
                .build());

        // Paquete de prueba
        pkg = packages.saveAndFlush(Package.builder()
                .shipmentNumber("ENV-2024-0001")
                .description("Paquete de prueba")
                .weightKg(new BigDecimal("5.50"))
                .lengthCm(new BigDecimal("30.00"))
                .widthCm(new BigDecimal("20.00"))
                .heightCm(new BigDecimal("15.00"))
                .status(PackageStatus.ASSIGNED)
                .clientName("Cliente Prueba")
                .clientDocument("300000003")
                .clientPhone("77777777")
                .clientEmail("cliente@example.com")
                .clientAddress("Calle 123, San José")
                .deliveryAddress("Avenida 456, San José")
                .deliveryCity("San José")
                .deliveryReference("Frente al parque central")
                .scheduledDeliveryDate(LocalDateTime.now().plusDays(2))
                .deliveryNotes("Entregar en horario de oficina")
                .assignedCourier(courier)
                .createdBy(adminVentas)
                .build());
    }

    private String token(User user) {
        return jwt.generateToken(new UserPrincipal(user));
    }

    private ResultActions getPackage(String token, String shipmentNumber) throws Exception {
        return mvc.perform(get("/api/v1/packages/" + shipmentNumber)
                .header("Authorization", "Bearer " + token));
    }

    @Test
    void adminVentasConsultaPaqueteExistenteRetornaDetalleCompleto() throws Exception {
        getPackage(token(adminVentas), "ENV-2024-0001")
                .andExpect(status().isOk())
                // Datos generales
                .andExpect(jsonPath("$.id").value(pkg.getId()))
                .andExpect(jsonPath("$.shipmentNumber").value("ENV-2024-0001"))
                .andExpect(jsonPath("$.description").value("Paquete de prueba"))
                .andExpect(jsonPath("$.weightKg").value(5.50))
                .andExpect(jsonPath("$.lengthCm").value(30.00))
                .andExpect(jsonPath("$.widthCm").value(20.00))
                .andExpect(jsonPath("$.heightCm").value(15.00))
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").doesNotExist())
                // Datos del cliente
                .andExpect(jsonPath("$.clientName").value("Cliente Prueba"))
                .andExpect(jsonPath("$.clientDocument").value("300000003"))
                .andExpect(jsonPath("$.clientPhone").value("77777777"))
                .andExpect(jsonPath("$.clientEmail").value("cliente@example.com"))
                .andExpect(jsonPath("$.clientAddress").value("Calle 123, San José"))
                // Datos de entrega
                .andExpect(jsonPath("$.deliveryAddress").value("Avenida 456, San José"))
                .andExpect(jsonPath("$.deliveryCity").value("San José"))
                .andExpect(jsonPath("$.deliveryReference").value("Frente al parque central"))
                .andExpect(jsonPath("$.scheduledDeliveryDate").exists())
                .andExpect(jsonPath("$.actualDeliveryDate").doesNotExist())
                .andExpect(jsonPath("$.deliveryNotes").value("Entregar en horario de oficina"))
                .andExpect(jsonPath("$.recipientSignature").doesNotExist())
                // Mensajero asignado
                .andExpect(jsonPath("$.assignedCourier").exists())
                .andExpect(jsonPath("$.assignedCourier.courierId").value(courier.getId()))
                .andExpect(jsonPath("$.assignedCourier.userId").value(courierUser.getId()))
                .andExpect(jsonPath("$.assignedCourier.documentType").value("CEDULA"))
                .andExpect(jsonPath("$.assignedCourier.documentNumber").value("200000002"))
                .andExpect(jsonPath("$.assignedCourier.fullName").value("Mensajero Test"))
                .andExpect(jsonPath("$.assignedCourier.email").value("courier-test@example.com"))
                .andExpect(jsonPath("$.assignedCourier.phone").value("88888888"))
                .andExpect(jsonPath("$.assignedCourier.schedule").value("Lunes a viernes, 08:00-17:00"))
                .andExpect(jsonPath("$.assignedCourier.maxPackageWeightKg").value(30.00))
                .andExpect(jsonPath("$.assignedCourier.status").value("ACTIVE"))
                .andExpect(jsonPath("$.assignedCourier.role").value("MENSAJERO"))
                // Administrador que creó el paquete
                .andExpect(jsonPath("$.createdBy").exists())
                .andExpect(jsonPath("$.createdBy.userId").value(adminVentas.getId()))
                .andExpect(jsonPath("$.createdBy.documentType").value("CEDULA"))
                .andExpect(jsonPath("$.createdBy.documentNumber").value("100000001"))
                .andExpect(jsonPath("$.createdBy.fullName").value("Admin Ventas Test"))
                .andExpect(jsonPath("$.createdBy.email").value("adminventas-test@example.com"))
                .andExpect(jsonPath("$.createdBy.role").value("ADMIN_VENTAS"));
    }

    @Test
    void adminVentasConsultaPaqueteSinMensajeroAsignadoRetornaNullEnAssignedCourier() throws Exception {
        // Crear paquete sin mensajero asignado
        var pkgSinCourier = packages.saveAndFlush(Package.builder()
                .shipmentNumber("ENV-2024-0002")
                .description("Sin mensajero")
                .weightKg(new BigDecimal("2.00"))
                .clientName("Otro Cliente")
                .deliveryAddress("Dirección entrega")
                .createdBy(adminVentas)
                .build());

        getPackage(token(adminVentas), "ENV-2024-0002")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentNumber").value("ENV-2024-0002"))
                .andExpect(jsonPath("$.assignedCourier").doesNotExist());
    }

    @Test
    void paqueteInexistenteRetorna404() throws Exception {
        getPackage(token(adminVentas), "ENV-NO-EXISTE")
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PACKAGE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Paquete no encontrado con número de envío: ENV-NO-EXISTE"))
                .andExpect(jsonPath("$.status").value(404));
    }

    @ParameterizedTest
    @ValueSource(strings = {"SUPER_USUARIO", "MENSAJERO"})
    void otrosRolesReciben403(String role) throws Exception {
        var otroUsuario = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("999999999")
                .documentId("999999999")
                .fullName("Otro Rol " + role)
                .email("otro-" + role.toLowerCase() + "@example.com")
                .passwordHash("unused")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow())
                .build());

        getPackage(token(otroUsuario), "ENV-2024-0001")
                .andExpect(status().isForbidden());
    }

    @Test
    void sinTokenRetorna401() throws Exception {
        mvc.perform(get("/api/v1/packages/ENV-2024-0001"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenInvalidoRetorna401() throws Exception {
        getPackage("token-invalido", "ENV-2024-0001")
                .andExpect(status().isUnauthorized());
    }
}