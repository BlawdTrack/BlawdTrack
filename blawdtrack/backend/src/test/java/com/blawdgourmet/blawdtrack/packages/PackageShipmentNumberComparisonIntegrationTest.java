package com.blawdgourmet.blawdtrack.packages;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PackageShipmentNumberComparisonIntegrationTest {

    private static final String ENDPOINT = "/api/v1/packages/shipment-numbers/compare";
    private static final String JSON = MediaType.APPLICATION_JSON_VALUE;

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private DeliveryPackageRepository packages;

    private final AtomicInteger userSequence = new AtomicInteger(1);

    @Test
    void administradorDeVentasComparaMasivamenteContraLaBaseDeDatos() throws Exception {
        packages.saveAndFlush(DeliveryPackage.builder().shipmentNumber("env-00953").build());

        mvc.perform(post(ENDPOINT)
                        .header("Authorization", "Bearer " + token(RoleName.SALES_ADMIN))
                        .contentType(JSON)
                        .content("""
                                {"shipmentNumbers":[" ENV-00953 ","ENV-00956","env-00956","ENV-00958"]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.receivedCount").value(4))
                .andExpect(jsonPath("$.distinctCount").value(3))
                .andExpect(jsonPath("$.importableShipmentNumbers[0]").value("ENV-00958"))
                .andExpect(jsonPath("$.duplicates[0].shipmentNumber").value("ENV-00953"))
                .andExpect(jsonPath("$.duplicates[0].occurrences").value(1))
                .andExpect(jsonPath("$.duplicates[0].reasons[0]").value("ALREADY_REGISTERED"))
                .andExpect(jsonPath("$.duplicates[1].shipmentNumber").value("ENV-00956"))
                .andExpect(jsonPath("$.duplicates[1].occurrences").value(2))
                .andExpect(jsonPath("$.duplicates[1].reasons[0]").value("DUPLICATED_IN_FILE"));
    }

    @Test
    void soloAdministradorDeVentasPuedeEjecutarLaComparacion() throws Exception {
        for (String role : new String[] {RoleName.SUPER_USER, RoleName.COURIER}) {
            mvc.perform(post(ENDPOINT)
                            .header("Authorization", "Bearer " + token(role))
                            .contentType(JSON)
                            .content("no-es-json"))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void solicitudSinTokenDevuelveUnauthorizedAntesDeValidarElCuerpo() throws Exception {
        mvc.perform(post(ENDPOINT).contentType(JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void administradorDeVentasRecibeErrorDeValidacionParaListaVacia() throws Exception {
        mvc.perform(post(ENDPOINT)
                        .header("Authorization", "Bearer " + token(RoleName.SALES_ADMIN))
                        .contentType(JSON)
                        .content("{\"shipmentNumbers\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    private String token(String roleName) {
        int sequence = userSequence.getAndIncrement();
        User user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("9-5000-%04d", sequence))
                .fullName("Actor de paquetes")
                .email("actor-package-" + roleName + "-" + sequence + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(roleName).orElseThrow())
                .build());
        return jwt.generateToken(new UserPrincipal(user));
    }
}
