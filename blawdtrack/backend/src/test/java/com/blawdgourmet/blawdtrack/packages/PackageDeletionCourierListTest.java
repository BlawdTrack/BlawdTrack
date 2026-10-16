package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackageItem;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import jakarta.persistence.EntityManager;

/**
 * HU-012 / T04 (#120): un paquete eliminado deja de aparecer en la lista del mensajero en la siguiente
 * consulta. La eliminación es física, así que basta con que la fila (y sus dependientes) desaparezca.
 *
 * <p>El endpoint del mensajero (HU-022) aún no existe: la consulta se hace aquí con JPQL, filtrando por
 * mensajero asignado, que es lo que esa consulta deberá hacer. No se agrega un método de producción para
 * no adelantar el contrato de HU-022.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PackageDeletionCourierListTest {

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private CourierRepository couriers;
    @Autowired private DeliveryPackageRepository packages;
    @Autowired private EntityManager entityManager;

    private Courier courier;
    private String adminToken;

    @BeforeEach
    void setUp() {
        User courierUser = user(RoleName.COURIER, "9-3500-0001", "mensajero-t04@example.test");
        courier = couriers.saveAndFlush(Courier.builder()
                .user(courierUser)
                .schedule("Lunes a viernes, 08:00-17:00")
                .maxPackageWeightKg(new BigDecimal("25.00"))
                .build());
        adminToken = jwt.generateToken(new UserPrincipal(
                user(RoleName.SALES_ADMIN, "9-3500-0002", "admin-t04@example.test")));
    }

    @Test
    void elPaqueteEliminadoYaNoApareceEnLaListaDelMensajero() throws Exception {
        assignedPackage("ENV-T04-1");
        assignedPackage("ENV-T04-2");
        assertThat(packagesOfCourier()).containsExactlyInAnyOrder("ENV-T04-1", "ENV-T04-2");

        mvc.perform(delete("/api/v1/packages/ENV-T04-1").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        assertThat(packagesOfCourier()).containsExactly("ENV-T04-2");
    }

    @Test
    void eliminarElPaqueteBorraSusArticulosSinDejarHuerfanos() throws Exception {
        Long packageId = assignedPackage("ENV-T04-3").getId();
        assertThat(itemsOf(packageId)).isEqualTo(2L);

        mvc.perform(delete("/api/v1/packages/ENV-T04-3").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        assertThat(itemsOf(packageId)).isZero();
    }

    @Test
    void unPaqueteNoEliminableSigueEnLaListaDelMensajero() throws Exception {
        DeliveryPackage shipped = assignedPackage("ENV-T04-4");
        shipped.setStatus(PackageStatus.SHIPPED);
        packages.saveAndFlush(shipped);

        mvc.perform(delete("/api/v1/packages/ENV-T04-4").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict());

        assertThat(packagesOfCourier()).containsExactly("ENV-T04-4");
    }

    /** "Siguiente consulta" del mensajero: se limpia el contexto de persistencia para leer de la base. */
    private List<String> packagesOfCourier() {
        entityManager.flush();
        entityManager.clear();
        return entityManager.createQuery(
                        "select p.shipmentNumber from DeliveryPackage p where p.assignedCourier.id = :courierId",
                        String.class)
                .setParameter("courierId", courier.getId())
                .getResultList();
    }

    private long itemsOf(Long packageId) {
        entityManager.flush();
        entityManager.clear();
        return entityManager.createQuery(
                        "select count(i) from DeliveryPackageItem i where i.deliveryPackage.id = :packageId",
                        Long.class)
                .setParameter("packageId", packageId)
                .getSingleResult();
    }

    private DeliveryPackage assignedPackage(String shipmentNumber) {
        DeliveryPackage deliveryPackage = DeliveryPackage.builder()
                .shipmentNumber(shipmentNumber)
                .status(PackageStatus.ASSIGNED)
                .assignedCourier(courier)
                .build();
        deliveryPackage.addItem(item("Chocolate amargo"));
        deliveryPackage.addItem(item("Trufas surtidas"));
        return packages.saveAndFlush(deliveryPackage);
    }

    private static DeliveryPackageItem item(String name) {
        return DeliveryPackageItem.builder().name(name).quantity(BigDecimal.ONE).build();
    }

    private User user(String role, String documentNumber, String email) {
        return users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(documentNumber)
                .fullName("Usuario T04")
                .email(email)
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow())
                .build());
    }
}
