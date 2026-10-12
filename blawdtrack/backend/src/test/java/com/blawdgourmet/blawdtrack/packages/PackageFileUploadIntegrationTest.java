package com.blawdgourmet.blawdtrack.packages;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import java.nio.charset.StandardCharsets;
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
class PackageFileUploadIntegrationTest {

    private static final String ENDPOINT = "/api/v1/packages/import/preview";
    private static final String VALID_CSV = """
            Packing Number,SO Number,Customer Name,Shipping Address,Shipping Phone,Notes
            ENV-100,SO-100,Cliente Valido,San Jose,8888-8888,
            """;

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private DeliveryPackageRepository packageRepository;

    private final AtomicInteger sequence = new AtomicInteger();

    @Test
    void cargaCsvYDevuelvePrevisualizacionSinPersistirLosRegistros() throws Exception {
        packageRepository.saveAndFlush(
                DeliveryPackage.builder().shipmentNumber("ENV-300").build());
        String csv = """
                Packing Number,SO Number,Customer Name,Shipping Address,Shipping Phone,Notes
                ENV-100,SO-100,Cliente Valido,San Jose,8888-8888,
                ENV-200,,Cliente Invalido,,,
                ENV-300,SO-300,Cliente Duplicado,Heredia,8777-7777,De 10 a 2
                """;

        mvc.perform(multipart(ENDPOINT)
                        .file(file("paquetes.csv", "text/csv", csv))
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("paquetes.csv"))
                .andExpect(jsonPath("$.totalRecords").value(3))
                .andExpect(jsonPath("$.validRecordsCount").value(1))
                .andExpect(jsonPath("$.invalidRecordsCount").value(1))
                .andExpect(jsonPath("$.duplicateRecordsCount").value(1))
                .andExpect(jsonPath("$.validRecords[0].shipmentNumber").value("ENV-100"))
                .andExpect(jsonPath("$.validRecords[0].schedule")
                        .value("9:00 a.m. a 4:00 p.m."))
                .andExpect(jsonPath("$.invalidRecords[0].packageData.shipmentNumber")
                        .value("ENV-200"))
                .andExpect(jsonPath("$.duplicates[0].shipmentNumber").value("ENV-300"))
                .andExpect(jsonPath("$.duplicates[0].reasons[0]")
                        .value("ALREADY_REGISTERED"));
    }

    @Test
    void superUsuarioActualPuedePrevisualizarPorSuPermiso() throws Exception {
        mvc.perform(multipart(ENDPOINT)
                        .file(file("paquetes.csv", "text/csv", VALID_CSV))
                        .header("Authorization", bearer(RoleName.SUPER_USER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.validRecordsCount").value(1));
    }

    @Test
    void rechazaExtensionNoSoportadaConRespuestaControlada() throws Exception {
        mvc.perform(multipart(ENDPOINT)
                        .file(file("paquetes.pdf", "application/pdf", VALID_CSV))
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_PACKAGE_FILE"));
    }

    @Test
    void rechazaMultipartSinArchivoConRespuestaControlada() throws Exception {
        mvc.perform(multipart(ENDPOINT)
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_PACKAGE_FILE"));
    }

    @Test
    void mensajeroNoPuedeCargarArchivosAunqueElMultipartSeaValido() throws Exception {
        mvc.perform(multipart(ENDPOINT)
                        .file(file("paquetes.csv", "text/csv", VALID_CSV))
                        .header("Authorization", bearer(RoleName.COURIER)))
                .andExpect(status().isForbidden());
    }

    @Test
    void cargaSinTokenDevuelveUnauthorized() throws Exception {
        mvc.perform(multipart(ENDPOINT)
                        .file(file("paquetes.csv", "text/csv", VALID_CSV)))
                .andExpect(status().isUnauthorized());
    }

    private MockMultipartFile file(String fileName, String contentType, String content) {
        return new MockMultipartFile(
                "file", fileName, contentType,
                content.getBytes(StandardCharsets.UTF_8));
    }

    private String bearer(String roleName) {
        int id = sequence.incrementAndGet();
        User user = userRepository.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("9-7000-%04d", id))
                .fullName("Actor carga paquetes")
                .email("package-upload-" + roleName + "-" + id + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roleRepository.findByName(roleName).orElseThrow())
                .build());
        return "Bearer " + jwtService.generateToken(new UserPrincipal(user));
    }
}
