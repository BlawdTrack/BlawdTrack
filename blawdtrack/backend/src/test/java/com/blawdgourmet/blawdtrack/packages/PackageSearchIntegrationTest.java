package com.blawdgourmet.blawdtrack.packages;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageSearchRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PackageSearchIntegrationTest {

    private static final String SEARCH_URL = "/api/v1/packages/search";

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private DeliveryPackageSearchRepository packages;

    private final AtomicInteger actorSequence = new AtomicInteger(1);

    @BeforeEach
    void setUp() {
        packages.deleteAll();
        packages.saveAllAndFlush(List.of(
                DeliveryPackage.builder().shipmentNumber("ENV-00001").orderNumber("SO-001")
                    .customerName("CLIENTE UNO ROJAS")
                    .address("DEL PARQUE 100M NORTE, ESCAZU, SAN JOSE, COSTA RICA")
                    .phone("+506-8888-9999").schedule("DE 8 A 5").build(),
                DeliveryPackage.builder().shipmentNumber("ENV-00002").orderNumber("SO-002")
                    .customerName("CLIENTE DOS").address("HEREDIA, BARVA")
                    .phone("7110-0914").schedule("Por la tarde").build()));
    }

    @Test
    void requestWithoutTokenReturnsUnauthorized() throws Exception {
        mvc.perform(get(SEARCH_URL)).andExpect(status().isUnauthorized());
    }

    @Test
    void courierIsForbiddenEvenWhenPaginationParametersAreInvalid() throws Exception {
        mvc.perform(get(SEARCH_URL).param("page", "abc").param("size", "xyz")
                        .header("Authorization", bearer(RoleName.COURIER)))
                .andExpect(status().isForbidden());
    }

    @Test
    void salesAdminCanSearch() throws Exception {
        mvc.perform(get(SEARCH_URL).header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void superUserIsForbidden() throws Exception {
        mvc.perform(get(SEARCH_URL).header("Authorization", bearer(RoleName.SUPER_USER)))
                .andExpect(status().isForbidden());
    }

    @Test
    void searchesAcrossAllSixFields() throws Exception {
        for (String term : new String[] {"env-00001", "so-001", "cliente uno", "del parque", "+506", "de 8"}) {
            mvc.perform(get(SEARCH_URL).param("term", term)
                            .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].shipmentNumber").value("ENV-00001"));
        }
    }

    @Test
    void matchesPartialTermsAcrossFieldsAndPhoneDigits() throws Exception {
        String[][] searches = {
                {"rojas", "ENV-00001"},
                {"barv", "ENV-00002"},
                {"9999", "ENV-00001"},
                {"rojas parque", "ENV-00001"}
        };

        for (String[] search : searches) {
            mvc.perform(get(SEARCH_URL).param("term", search[0])
                            .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1))
                    .andExpect(jsonPath("$.content[0].shipmentNumber").value(search[1]));
        }
    }

    @Test
    void blankTermReturnsAllPackagesAndResponseIsPaged() throws Exception {
        mvc.perform(get(SEARCH_URL).param("term", "")
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void paginationValuesAreTolerantAndBounded() throws Exception {
        mvc.perform(get(SEARCH_URL).param("size", "1000")
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(100));

        mvc.perform(get(SEARCH_URL).param("page", "-1").param("size", "xyz")
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(2));

        mvc.perform(get(SEARCH_URL).param("page", "abc")
                        .header("Authorization", bearer(RoleName.SALES_ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0));
    }

    private String bearer(String role) {
        int sequence = actorSequence.getAndIncrement();
        User user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("800000%04d", sequence))
                .fullName("Actor de búsqueda")
                .email("package-search-" + role.toLowerCase() + "-" + sequence + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow())
                .build());
        return "Bearer " + jwt.generateToken(new UserPrincipal(user));
    }
}