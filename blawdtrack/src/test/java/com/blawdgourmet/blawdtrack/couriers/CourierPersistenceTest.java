package com.blawdgourmet.blawdtrack.couriers;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.validation.Validator;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:courier-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.flyway.enabled=true",
        "spring.jpa.hibernate.ddl-auto=validate"
})
@Transactional
class CourierPersistenceTest {

    @Autowired private CourierRepository couriers;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private EntityManager entityManager;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private Validator validator;

    private User user;

    @BeforeEach
    void createAccount() {
        user = users.saveAndFlush(User.builder()
                .documentId("123456789")
                .fullName("Mensajero de prueba")
                .email("mensajero@example.test")
                .phone("88888888")
                .passwordHash("hash-solo-para-pruebas")
                .role(roles.findByName(RoleName.COURIER).orElseThrow())
                .build());
    }

    @Test
    void guardaYRecuperaElPerfilConSuCuenta() {
        Long userId = user.getId();
        Courier saved = couriers.saveAndFlush(profile(new BigDecimal("25.50")));
        Long courierId = saved.getId();
        entityManager.clear();

        Courier found = couriers.findByUserId(userId).orElseThrow();
        assertThat(found.getId()).isEqualTo(courierId);
        assertThat(found.getSchedule()).isEqualTo("Lunes a viernes, 08:00-17:00");
        assertThat(found.getMaxPackageWeightKg()).isEqualByComparingTo("25.50");
        assertThat(found.getUser().getEmail()).isEqualTo("mensajero@example.test");
        assertThat(found.getUser().getDocumentId()).isEqualTo("123456789");
        assertThat(found.getUser().getPhone()).isEqualTo("88888888");
        assertThat(found.getUser().getPasswordHash()).isEqualTo("hash-solo-para-pruebas");
        assertThat(found.getUser().getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(found.getUser().getRole().getName()).isEqualTo(RoleName.COURIER);
    }

    @Test
    void migracionAplicadaYEstadoPredeterminadoCompatibleConJpa() {
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM \"flyway_schema_history\" WHERE \"version\" = '2' AND \"success\" = TRUE",
                Integer.class)).isEqualTo(1);
        jdbc.update("""
                INSERT INTO usuarios (cedula, nombre_completo, correo, contrasena_hash, rol_id)
                VALUES ('987654321', 'Otro mensajero', 'otro@example.test', 'hash-prueba', ?)
                """, user.getRole().getId());
        assertThat(users.findByEmail("otro@example.test").orElseThrow().getStatus())
                .isEqualTo(UserStatus.ACTIVE);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"0", "-1", "-0.01"})
    void rechazaCapacidadInvalidaEnModeloYBaseDeDatos(String value) {
        BigDecimal weight = value == null ? null : new BigDecimal(value);
        assertThat(validator.validate(profile(weight))).isNotEmpty();
        assertThatThrownBy(() -> insertProfile(user.getId(), "08:00-17:00", weight))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void rechazaHorarioVacioEnModeloYBaseDeDatos(String schedule) {
        Courier courier = profile(BigDecimal.ONE);
        courier.setSchedule(schedule);
        assertThat(validator.validate(courier)).isNotEmpty();
        assertThatThrownBy(() -> insertProfile(user.getId(), schedule, BigDecimal.ONE))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rechazaMasDeUnPerfilPorCuenta() {
        insertProfile(user.getId(), "08:00-17:00", BigDecimal.ONE);
        assertThatThrownBy(() -> insertProfile(user.getId(), "09:00-18:00", BigDecimal.TEN))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rechazaCuentaInexistenteONula() {
        assertThatThrownBy(() -> insertProfile(-1L, "08:00-17:00", BigDecimal.ONE))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertProfile(null, "08:00-17:00", BigDecimal.ONE))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void eliminarPerfilConservaLaCuenta() {
        Courier courier = couriers.saveAndFlush(profile(BigDecimal.ONE));
        couriers.delete(courier);
        couriers.flush();
        entityManager.clear();
        assertThat(users.findById(user.getId())).isPresent();
    }

    @Test
    void buscarCuentaSinPerfilDevuelveVacio() {
        assertThat(couriers.findByUserId(user.getId())).isEmpty();
    }

    @Test
    void actualizaHorarioYCapacidadSinModificarLaCuenta() {
        Courier courier = couriers.saveAndFlush(profile(BigDecimal.ONE));
        courier.setSchedule("Sábados, 09:00-13:00");
        courier.setMaxPackageWeightKg(new BigDecimal("12.75"));
        couriers.saveAndFlush(courier);
        entityManager.clear();

        Courier found = couriers.findByUserId(user.getId()).orElseThrow();
        assertThat(found.getSchedule()).isEqualTo("Sábados, 09:00-13:00");
        assertThat(found.getMaxPackageWeightKg()).isEqualByComparingTo("12.75");
        assertThat(found.getUser().getEmail()).isEqualTo("mensajero@example.test");
        assertThat(found.getUser().getRole().getName()).isEqualTo(RoleName.COURIER);
    }

    @ParameterizedTest
    @ValueSource(strings = {"0.01", "99999999.99"})
    void conservaLosLimitesValidosDeCapacidad(String value) {
        Courier courier = profile(new BigDecimal(value));
        courier.setSchedule("H".repeat(255));
        assertThat(validator.validate(courier)).isEmpty();
        couriers.saveAndFlush(courier);
        entityManager.clear();

        Courier found = couriers.findByUserId(user.getId()).orElseThrow();
        assertThat(found.getMaxPackageWeightKg()).isEqualByComparingTo(value);
        assertThat(found.getSchedule()).hasSize(255);
    }

    @ParameterizedTest
    @ValueSource(strings = {"0.001", "100000000.00"})
    void rechazaCapacidadQueExcedePrecisionDelModelo(String value) {
        assertThat(validator.validate(profile(new BigDecimal(value))))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("maxPackageWeightKg");
    }

    @Test
    void rechazaHorarioQueExcedeLongitudMaxima() {
        Courier courier = profile(BigDecimal.ONE);
        courier.setSchedule("H".repeat(256));
        assertThat(validator.validate(courier))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("schedule");
        assertThatThrownBy(() -> insertProfile(user.getId(), courier.getSchedule(), BigDecimal.ONE))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void impideEliminarUnaCuentaConPerfilAsociado() {
        insertProfile(user.getId(), "08:00-17:00", BigDecimal.ONE);
        assertThatThrownBy(() -> jdbc.update("DELETE FROM usuarios WHERE id = ?", user.getId()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private Courier profile(BigDecimal weight) {
        return Courier.builder()
                .user(user)
                .schedule("Lunes a viernes, 08:00-17:00")
                .maxPackageWeightKg(weight)
                .build();
    }

    private void insertProfile(Long userId, String schedule, BigDecimal weight) {
        jdbc.update("INSERT INTO mensajeros (usuario_id, horario, capacidad_maxima_carga_kg) VALUES (?, ?, ?)",
                userId, schedule, weight);
    }
}
