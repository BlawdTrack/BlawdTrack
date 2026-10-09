package com.blawdgourmet.blawdtrack.couriers;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.service.EmailService;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.couriers.service.TemporaryPasswordGenerator;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@SuppressWarnings({"unused", "deprecation"})
class CourierRegistrationTest {

    private static final String BODY = """
            {"documentType":"CEDULA","documentNumber":"123456789","fullName":"Mensajero de prueba",
             "email":"courier69@example.com",
             "phone":"88888888","schedule":"Lunes a viernes, 08:00-17:00",
             "maxPackageWeightKg":25.50}
            """;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserRepository users;

    @Autowired
    private RoleRepository roles;

    @Autowired
    private AuditLogRepository auditLogs;

    @MockitoSpyBean
    private CourierRepository couriers;

    @Autowired
    private JwtService jwt;

    @Autowired
    private PasswordEncoder encoder;

    @MockitoBean
    private TemporaryPasswordGenerator temporaryPasswords;

    @MockitoBean
    private EmailService emailService;

    @BeforeEach
    void generatedPassword() {
        when(temporaryPasswords.generate())
                .thenReturn("Courier69-password!");
    }

    private String token(String role, UserStatus status) {
        var user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("555555555")
                .documentId("555555555")
                .fullName("Actor")
                .email("actor69@example.com")
                .passwordHash("unused")
                .status(status)
                .role(roles.findByName(role).orElseThrow())
                .build());

        return jwt.generateToken(new UserPrincipal(user));
    }

    private ResultActions register(String token, String body) throws Exception {
        return mvc.perform(post("/api/v1/couriers")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    @Test
    void registrarUnMensajeroDejaUnRegistroDeCreacionSinDatosPersonalesYApareceEnElHistorial()
            throws Exception {
        var token = token("SUPER_USUARIO", UserStatus.ACTIVE);

        register(token, BODY).andExpect(status().isCreated());

        var created = users.findByEmail("courier69@example.com").orElseThrow();
        var actor = users.findByEmail("actor69@example.com").orElseThrow();
        var records = auditLogs.findAll().stream()
                .filter(log -> log.getUsuarioAfectado() != null
                        && created.getId().equals(log.getUsuarioAfectado().getId())
                        && "CREAR_MENSAJERO".equals(log.getAction()))
                .toList();
        assertThat(records).hasSize(1);
        assertThat(records.get(0).getActor().getId()).isEqualTo(actor.getId());
        assertThat(records.get(0).getTimestamp()).isNotNull();
        // El detalle no lleva datos personales ni la contraseña temporal.
        assertThat(records.get(0).getDetails()).isEqualTo("created");

        var courierId = couriers.findByUserId(created.getId()).orElseThrow().getId();
        mvc.perform(get("/api/v1/couriers/" + courierId + "/history")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].action").value("CREAR_MENSAJERO"))
                .andExpect(jsonPath("$[0].details").value("created"))
                .andExpect(jsonPath("$[0].actorName").value("Actor"));
    }

    @Test
    void superUsuarioCreaCuentaActivaConRolFijoYContrasenaCifrada()
            throws Exception {
        var token = token("SUPER_USUARIO", UserStatus.ACTIVE);

        register(
                token,
                BODY.replace(
                                "courier69@example.com",
                                " COURIER69@EXAMPLE.COM "
                        )
                        .replace(
                                "\"phone\":",
                                "\"role\":\"SUPER_USUARIO\",\"status\":\"INACTIVE\",\"phone\":"
                        )
        )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.userId").isNumber())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.role").value("MENSAJERO"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        var user = users.findByEmail("courier69@example.com")
                .orElseThrow();

        assertThat(
                encoder.matches(
                        "Courier69-password!",
                        user.getPasswordHash()
                )
        ).isTrue();

        var courier = couriers.findByUserId(user.getId())
                .orElseThrow();

        assertThat(courier.getSchedule())
                .isEqualTo("Lunes a viernes, 08:00-17:00");

        assertThat(courier.getMaxPackageWeightKg())
                .isEqualByComparingTo("25.50");
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN_VENTAS", "MENSAJERO"})
    void otrosRolesNoPuedenRegistrar(String role) throws Exception {
        register(token(role, UserStatus.ACTIVE), BODY)
                .andExpect(status().isForbidden());

        assertThat(
                users.existsByDocumentTypeAndDocumentNumber(
                        DocumentType.CEDULA,
                        "123456789"
                )
        ).isFalse();
    }

    @Test
    void requiereAutenticacionConTokenValido() throws Exception {
        mvc.perform(post("/api/v1/couriers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY))
                .andExpect(status().isUnauthorized());

        register("invalid-token", BODY)
                .andExpect(status().isUnauthorized());

        assertThat(
                users.existsByDocumentTypeAndDocumentNumber(
                        DocumentType.CEDULA,
                        "123456789"
                )
        ).isFalse();
    }

    @Test
    void mensajeroRegistradoPuedeIniciarSesionPeroNoRegistrarOtros()
            throws Exception {
        register(token("SUPER_USUARIO", UserStatus.ACTIVE), BODY)
                .andExpect(status().isCreated());

        var result = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "courier69@example.com",
                                  "password": "Courier69-password!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("MENSAJERO"))
                .andReturn();

        String courierToken = new tools.jackson.databind.ObjectMapper()
                .readTree(result.getResponse().getContentAsString())
                .get("token")
                .asText();

        long count = users.count();

        register(
                courierToken,
                BODY.replace("123456789", "987654321")
                        .replace(
                                "courier69@example.com",
                                "other69@example.com"
                        )
        )
                .andExpect(status().isForbidden());

        assertThat(users.count()).isEqualTo(count);
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void falloAlGuardarPerfilRevierteLaCuentaCompleta() throws Exception {
        String actorToken = token(
                "SUPER_USUARIO",
                UserStatus.ACTIVE
        );

        long userCount = users.count();
        long courierCount = couriers.count();

        try {
            doThrow(new DataIntegrityViolationException(
                    "Conflicto simulado"
            ))
                    .when(couriers)
                    .saveAndFlush(any(Courier.class));

            register(actorToken, BODY)
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code")
                            .value("COURIER_CONFLICT"));

            assertThat(
                    users.existsByEmail("courier69@example.com")
            ).isFalse();

            assertThat(users.count()).isEqualTo(userCount);
            assertThat(couriers.count()).isEqualTo(courierCount);

            verifyNoInteractions(emailService);
        } finally {
            users.findByEmail("actor69@example.com")
                    .ifPresent(users::delete);
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"documentNumber", "email"})
    void duplicadosEnCualquierUsuarioSeRechazanSinCrearPerfil(
            String field
    ) throws Exception {
        var token = token(
                "SUPER_USUARIO",
                UserStatus.ACTIVE
        );

        long userCount = users.count();
        long courierCount = couriers.count();

        String body = field.equals("documentNumber")
                // Mismo número con guiones: se normaliza antes de validar la unicidad.
                ? BODY.replace("123456789", " 5-5555-5555 ")
                : BODY.replace(
                        "courier69@example.com",
                        " ACTOR69@EXAMPLE.COM "
                );

        register(token, body)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code")
                        .value("COURIER_CONFLICT"))
                .andExpect(jsonPath("$.message")
                        .value(field.equals("documentNumber")
                                ? "El documento ya está registrado"
                                : "El correo ya está registrado"));

        assertThat(users.count()).isEqualTo(userCount);
        assertThat(couriers.count()).isEqualTo(courierCount);
    }

    @Test
    void telefonoExistenteEnOtroUsuarioSeRechazaConMensajeEspecifico()
            throws Exception {
        var token = token(
                "SUPER_USUARIO",
                UserStatus.ACTIVE
        );

        users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("EXISTING-PHONE")
                .documentId("EXISTING-PHONE")
                .fullName("Usuario existente")
                .email("existing-phone@example.com")
                .phone("88888888")
                .passwordHash("unused")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName("ADMIN_VENTAS").orElseThrow())
                .build());

        long userCount = users.count();
        long courierCount = couriers.count();

        register(token, BODY)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code")
                        .value("COURIER_CONFLICT"))
                .andExpect(jsonPath("$.message")
                        .value("El teléfono ya está registrado"));

        assertThat(users.count()).isEqualTo(userCount);
        assertThat(couriers.count()).isEqualTo(courierCount);

        verifyNoInteractions(emailService);
    }

    @Test
    void telefonoVacioSeGuardaComoNuloYPermiteMasDeUnRegistro()
            throws Exception {
        var token = token(
                "SUPER_USUARIO",
                UserStatus.ACTIVE
        );

        String withoutPhone = BODY.replace(
                "88888888",
                "   "
        );

        register(token, withoutPhone)
                .andExpect(status().isCreated());

        register(
                token,
                withoutPhone.replace(
                                "123456789",
                                "987654321"
                        )
                        .replace(
                                "courier69@example.com",
                                "courier70@example.com"
                        )
        )
                .andExpect(status().isCreated());

        assertThat(
                users.findByEmail("courier69@example.com")
                        .orElseThrow()
                        .getPhone()
        ).isNull();

        assertThat(
                users.findByEmail("courier70@example.com")
                        .orElseThrow()
                        .getPhone()
        ).isNull();
    }

    @ParameterizedTest
    @CsvSource({
            "CEDULA,12345678",
            "CEDULA,ABC123456",
            "DIMEX,12345678",
            "DIMEX,1558-1234567",
            "PASAPORTE,12345678",
            "PASAPORTE,AB1"
    })
    void documentoConFormatoInvalidoParaSuTipoSeRechaza(String type, String number)
            throws Exception {
        var token = token("SUPER_USUARIO", UserStatus.ACTIVE);
        long count = users.count();

        register(token, BODY
                .replace("\"CEDULA\"", "\"" + type + "\"")
                .replace("123456789", number))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("documentNumber")));

        assertThat(users.count()).isEqualTo(count);
    }

    @ParameterizedTest
    @CsvSource({
            "CEDULA,1-2345-6789,123456789",
            "DIMEX,155812345678,155812345678",
            "PASAPORTE,ab12345,AB12345"
    })
    void documentoValidoSeAceptaYSeGuardaNormalizado(String type, String number, String stored)
            throws Exception {
        var token = token("SUPER_USUARIO", UserStatus.ACTIVE);

        register(token, BODY
                .replace("\"CEDULA\"", "\"" + type + "\"")
                .replace("123456789", number))
                .andExpect(status().isCreated());

        var user = users.findByEmail("courier69@example.com").orElseThrow();
        assertThat(user.getDocumentType()).isEqualTo(DocumentType.valueOf(type));
        assertThat(user.getDocumentNumber()).isEqualTo(stored);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "blank-id",
            "invalid-email",
            "blank-name",
            "blank-schedule",
            "zero-weight",
            "negative-weight",
            "precision",
            "missing"
    })
    void datosInvalidosNoCreanUsuarios(String scenario)
            throws Exception {
        var token = token(
                "SUPER_USUARIO",
                UserStatus.ACTIVE
        );

        String body = switch (scenario) {
            case "blank-id" ->
                    BODY.replace("123456789", " ");

            case "invalid-email" ->
                    BODY.replace(
                            "courier69@example.com",
                            "invalid"
                    );

            case "blank-name" ->
                    BODY.replace(
                            "Mensajero de prueba",
                            " "
                    );

            case "blank-schedule" ->
                    BODY.replace(
                            "Lunes a viernes, 08:00-17:00",
                            " "
                    );

            case "zero-weight" ->
                    BODY.replace("25.50", "0");

            case "negative-weight" ->
                    BODY.replace("25.50", "-1");

            case "precision" ->
                    BODY.replace("25.50", "1.001");

            default -> "{}";
        };

        long count = users.count();

        register(token, body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code")
                        .value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.password")
                        .doesNotExist());

        assertThat(users.count()).isEqualTo(count);
    }

    @Test
    void noEnviaAntesDeConfirmarLaTransaccion() throws Exception {
        register(
                token("SUPER_USUARIO", UserStatus.ACTIVE),
                BODY
        )
                .andExpect(status().isCreated());

        verifyNoInteractions(emailService);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void enviaCredencialesDespuesDelCommitYConservaCuentaSiSmtpFalla(
            boolean smtpFails
    ) throws Exception {
        String actorToken = token(
                "SUPER_USUARIO",
                UserStatus.ACTIVE
        );

        try {
            doAnswer(invocation -> {
                var user = users.findByEmail(
                                "courier69@example.com"
                        )
                        .orElseThrow();

                assertThat(
                        couriers.findByUserId(user.getId())
                ).isPresent();

                assertThat(
                        encoder.matches(
                                invocation.getArgument(2),
                                user.getPasswordHash()
                        )
                ).isTrue();

                if (smtpFails) {
                    throw new MailSendException(
                            "SMTP simulado no disponible"
                    );
                }

                return null;
            })
                    .when(emailService)
                    .sendCourierWelcome(
                            any(),
                            any(),
                            any()
                    );

            register(actorToken, BODY)
                    .andExpect(status().isCreated());

            verify(emailService).sendCourierWelcome(
                    "courier69@example.com",
                    "Mensajero de prueba",
                    "Courier69-password!"
            );

            assertThat(
                    users.existsByEmail("courier69@example.com")
            ).isTrue();

            register(actorToken, BODY)
                    .andExpect(status().isConflict());

            verifyNoMoreInteractions(emailService);
        } finally {
            // El alta deja un registro de auditoría que referencia a la cuenta: se borra antes que ella.
            auditLogs.deleteAll();
            users.findByEmail("courier69@example.com")
                    .ifPresent(user -> {
                        couriers.findByUserId(user.getId())
                                .ifPresent(couriers::delete);
                        users.delete(user);
                    });

            users.findByEmail("actor69@example.com")
                    .ifPresent(users::delete);
        }
    }
}