package com.blawdgourmet.blawdtrack.packages;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;

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

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackageItem;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

/**
 * Tests de autorización y respuesta para GET /api/v1/packages/{shipmentNumber}
 * (HU-013, Task 124: consulta de paquete por número de envío).
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
    @Autowired private DeliveryPackageRepository packages;
    @Autowired private AuditLogRepository auditLogs;
    @Autowired private JwtService jwt;

    private User adminVentas;
    private User courierUser;
    private Courier courier;
    private DeliveryPackage pkg;

    @BeforeEach
    void setUp() {
        // Usuario con permiso para consultar el paquete.
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

        var item = DeliveryPackageItem.builder()
                .itemId("ITEM-001")
                .name("Café molido")
                .quantity(new BigDecimal("2.00"))
                .sku("CAFE-001")
                .unitPrice(new BigDecimal("1250.00"))
                .build();
        pkg = DeliveryPackage.builder()
                .shipmentNumber("ENV-2024-0001")
                .orderNumber("SO-1001")
                .customerName("Cliente Prueba")
                .phone("77777777")
                .address("Avenida 456, San José")
                .schedule("De 8 a 5")
                .status(PackageStatus.ASSIGNED)
                .assignedCourier(courier)
                .items(new ArrayList<>())
                .build();
        pkg.addItem(item);
        pkg = packages.saveAndFlush(pkg);
    }

    private String token(User user) {
        return jwt.generateToken(new UserPrincipal(user));
    }

    private ResultActions getPackage(String token, String shipmentNumber) throws Exception {
        return mvc.perform(get("/api/v1/packages/{shipmentNumber}", shipmentNumber)
                .header("Authorization", "Bearer " + token));
    }

    @Test
    void adminVentasConsultaPaqueteExistenteRetornaDetalleCompleto() throws Exception {
        getPackage(token(adminVentas), "ENV-2024-0001")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(pkg.getId()))
                .andExpect(jsonPath("$.shipmentNumber").value("ENV-2024-0001"))
                .andExpect(jsonPath("$.orderNumber").value("SO-1001"))
                .andExpect(jsonPath("$.schedule").value("De 8 a 5"))
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.customerName").value("Cliente Prueba"))
                .andExpect(jsonPath("$.phone").value("77777777"))
                .andExpect(jsonPath("$.address").value("Avenida 456, San José"))
                .andExpect(jsonPath("$.items[0].itemId").value("ITEM-001"))
                .andExpect(jsonPath("$.items[0].name").value("Café molido"))
                .andExpect(jsonPath("$.items[0].quantity").value(2.00))
                .andExpect(jsonPath("$.items[0].sku").value("CAFE-001"))
                .andExpect(jsonPath("$.items[0].unitPrice").value(1250.00))
                .andExpect(jsonPath("$.description").doesNotExist())
                .andExpect(jsonPath("$.weightKg").doesNotExist())
                .andExpect(jsonPath("$.recipientSignature").doesNotExist())
                .andExpect(jsonPath("$.createdBy").doesNotExist())
                .andExpect(jsonPath("$.assignedCourier").exists())
                .andExpect(jsonPath("$.assignedCourier.courierId").value(courier.getId()))
                .andExpect(jsonPath("$.assignedCourier.fullName").value("Mensajero Test"))
                .andExpect(jsonPath("$.assignedCourier.phone").value("88888888"))
                .andExpect(jsonPath("$.assignedCourier.schedule").value("Lunes a viernes, 08:00-17:00"))
                .andExpect(jsonPath("$.assignedCourier.email").doesNotExist())
                .andExpect(jsonPath("$.assignedCourier.documentNumber").doesNotExist())
                .andExpect(jsonPath("$.assignedCourier.status").doesNotExist())
                .andExpect(jsonPath("$.assignedCourier.role").doesNotExist());
    }

    @Test
    void adminVentasConsultaPaqueteConNumeroEnMinusculasYEspacios() throws Exception {
        getPackage(token(adminVentas), "  env-2024-0001  ")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentNumber").value("ENV-2024-0001"));
    }

    @Test
    void paqueteImportadoSoloConNumeroPuedeConsultarseConEstadoPendiente() throws Exception {
        packages.saveAndFlush(DeliveryPackage.builder()
                .shipmentNumber("ENV-2024-0002")
                .build());

        getPackage(token(adminVentas), "ENV-2024-0002")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentNumber").value("ENV-2024-0002"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.orderNumber").doesNotExist())
                .andExpect(jsonPath("$.items").isEmpty())
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