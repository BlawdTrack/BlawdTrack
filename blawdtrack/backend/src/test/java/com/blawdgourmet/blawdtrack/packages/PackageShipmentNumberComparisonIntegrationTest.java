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

import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
                .andExpect(jsonPath("$.totalRows").value(4))
                .andExpect(jsonPath("$.validCount").value(1))
                .andExpect(jsonPath("$.duplicateCount").value(3))
                .andExpect(jsonPath("$.alreadyRegisteredCount").value(1))
                .andExpect(jsonPath("$.duplicatedInFileCount").value(2))
                .andExpect(jsonPath("$.rows[0].row").value(1))
                .andExpect(jsonPath("$.rows[0].shipmentNumber").value("ENV-00953"))
                .andExpect(jsonPath("$.rows[0].reasons[0]").value("ALREADY_REGISTERED"))
                .andExpect(jsonPath("$.rows[1].shipmentNumber").value("ENV-00956"))
                .andExpect(jsonPath("$.rows[1].reasons[0]").value("DUPLICATED_IN_FILE"))
                .andExpect(jsonPath("$.rows[1].repeatedInRows[0]").value(3))
                .andExpect(jsonPath("$.rows[2].repeatedInRows[0]").value(2))
                .andExpect(jsonPath("$.rows[3].shipmentNumber").value("ENV-00958"))
                .andExpect(jsonPath("$.rows[3].reasons").isEmpty());
    }

    @Test
    void elSuperUsuarioTambienPuedeEjecutarLaComparacion() throws Exception {
        mvc.perform(post(ENDPOINT)
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(JSON)
                        .content("{\"shipmentNumbers\":[\"ENV-00960\"]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.validCount").value(1));
    }

    @Test
    void elMensajeroNoPuedeEjecutarLaComparacion() throws Exception {
        mvc.perform(post(ENDPOINT)
                        .header("Authorization", "Bearer " + token(RoleName.COURIER))
                        .contentType(JSON)
                        .content("no-es-json"))
                .andExpect(status().isForbidden());
    }

    @Test
    void laImportacionEstaAbiertaAlSuperUsuarioYCerradaAlMensajero() throws Exception {
        // La ruta de importacion aun no tiene controlador en esta rama: lo que se verifica es el filtro de seguridad.
        // Un rol autorizado la atraviesa (no recibe 403; al no existir el endpoint la respuesta es otra) y el mensajero se detiene en el filtro (403).
        mvc.perform(post("/api/v1/packages/import/preview")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().is(not(403)));
        mvc.perform(post("/api/v1/packages/import/preview")
                        .header("Authorization", "Bearer " + token(RoleName.SALES_ADMIN)))
                .andExpect(status().is(not(403)));
        mvc.perform(post("/api/v1/packages/import/preview")
                        .header("Authorization", "Bearer " + token(RoleName.COURIER)))
                .andExpect(status().isForbidden());
    }

    @Test
    void elRestoDePaquetesSigueSiendoSoloDelAdministradorDeVentas() throws Exception {
        // Ruta general de paquetes (la ocupan eliminar, detalle, historial y busqueda): solo ADMIN_VENTAS.
        String route = "/api/v1/packages/ENV-1";
        mvc.perform(get(route).header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isForbidden());
        mvc.perform(get(route).header("Authorization", "Bearer " + token(RoleName.COURIER)))
                .andExpect(status().isForbidden());
        mvc.perform(get(route).header("Authorization", "Bearer " + token(RoleName.SALES_ADMIN)))
                .andExpect(status().is(not(403)));
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
