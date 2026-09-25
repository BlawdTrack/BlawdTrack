package com.blawdgourmet.blawdtrack.couriers.repository;

import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Persistence;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pruebas de integración para
 * {@link CourierRepository#findAllByOrderByUserFullNameAsc()}: confirma el
 * orden alfabético por nombre completo, que un mensajero INACTIVE se incluye
 * igual (el listado no filtra por status), y que el {@code @EntityGraph}
 * declarado sobre "user" lo carga sin necesitar una sesión abierta.
 */
@DataJpaTest
class CourierRepositoryFindAllTest {

    @Autowired
    private CourierRepository couriers;

    @Autowired
    private UserRepository users;

    @Autowired
    private RoleRepository roles;

    @Autowired
    private EntityManager em;

    private Role courierRole;

    @BeforeEach
    void setUp() {
        courierRole = roles.save(Role.builder().name("MENSAJERO").build());
    }

    @Test
    void findAllByOrderByUserFullNameAsc_ordenaIncluyeInactivosYCargaUserSinSesionAbierta() {
        createCourier("Bravo Mensajero", "1000000001", UserStatus.ACTIVE);
        createCourier("Alfa Mensajero", "1000000002", UserStatus.INACTIVE);
        createCourier("Charlie Mensajero", "1000000003", UserStatus.ACTIVE);

        List<Courier> result = couriers.findAllByOrderByUserFullNameAsc();

        assertThat(result).hasSize(3);
        assertThat(result).extracting(courier -> courier.getUser().getFullName())
                .containsExactly("Alfa Mensajero", "Bravo Mensajero", "Charlie Mensajero");
        assertThat(result).extracting(courier -> courier.getUser().getStatus())
                .contains(UserStatus.INACTIVE);

        em.flush();
        em.clear();

        List<Courier> reloaded = couriers.findAllByOrderByUserFullNameAsc();
        Courier firstCourier = reloaded.get(0);
        assertThat(Persistence.getPersistenceUtil().isLoaded(firstCourier, "user")).isTrue();
    }

    private Courier createCourier(String fullName, String documentNumber, UserStatus status) {
        User user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(documentNumber)
                .fullName(fullName)
                .email(documentNumber + "@blawdtrack.test")
                .passwordHash("hash-no-real")
                .status(status)
                .role(courierRole)
                .build());
        return couriers.saveAndFlush(Courier.builder()
                .user(user)
                .schedule("Lunes a viernes, 08:00-17:00")
                .maxPackageWeightKg(new BigDecimal("25.00"))
                .build());
    }
}
