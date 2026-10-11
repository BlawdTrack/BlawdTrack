package com.blawdgourmet.blawdtrack.packages;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageSearchRepository;
import com.blawdgourmet.blawdtrack.packages.search.AddressSearchCriterion;
import com.blawdgourmet.blawdtrack.packages.search.CustomerNameSearchCriterion;
import com.blawdgourmet.blawdtrack.packages.search.OrderNumberSearchCriterion;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchCriterion;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchTerm;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchTermNormalizer;
import com.blawdgourmet.blawdtrack.packages.search.PhoneSearchCriterion;
import com.blawdgourmet.blawdtrack.packages.search.ScheduleSearchCriterion;
import com.blawdgourmet.blawdtrack.packages.search.ShipmentNumberSearchCriterion;

@DataJpaTest
class PackageSearchCriteriaTest {

    @Autowired private DeliveryPackageSearchRepository repository;

    private final PackageSearchTermNormalizer normalizer = new PackageSearchTermNormalizer();
    private final ShipmentNumberSearchCriterion shipmentCriterion = new ShipmentNumberSearchCriterion();
    private final OrderNumberSearchCriterion orderCriterion = new OrderNumberSearchCriterion();
    private final CustomerNameSearchCriterion customerCriterion = new CustomerNameSearchCriterion();
    private final AddressSearchCriterion addressCriterion = new AddressSearchCriterion();
    private final PhoneSearchCriterion phoneCriterion = new PhoneSearchCriterion();
    private final ScheduleSearchCriterion scheduleCriterion = new ScheduleSearchCriterion();

    @BeforeEach
    void setUp() {
        repository.deleteAll();
        repository.saveAllAndFlush(List.of(
                DeliveryPackage.builder().shipmentNumber("ENV-00001").orderNumber("SO-001")
                        .customerName("Cliente Uno")
                        .address("Del parque 100m norte, Escazu, San Jose, Costa Rica")
                        .phone("+506-8888-9999").schedule("De 8 a 5").build(),
                DeliveryPackage.builder().shipmentNumber("ENV-00002").phone("7110-0914").build(),
                DeliveryPackage.builder().shipmentNumber("ENV-WILDCARD")
                        .customerName("Cliente 50%_ literal").build()));
    }

    @Test
    void eachCriterionFindsItsFieldCaseInsensitivelyAndPartially() {
        assertShipment(shipmentCriterion, "env-00001");
        assertShipment(orderCriterion, "so-001");
        assertShipment(customerCriterion, "CLIENTE UNO");
        assertShipment(addressCriterion, "escazu");
        assertShipment(scheduleCriterion, "DE 8");
    }

    @Test
    void phoneCriterionMatchesFormattedAndNormalizedNumbers() {
        assertShipment(phoneCriterion, "88889999");
        assertShipment(phoneCriterion, "8888-9999");
        assertShipment(phoneCriterion, "+506");
        assertShipment(phoneCriterion, "71100914", "ENV-00002");
    }

    @Test
    void percentAndUnderscoreAreMatchedLiterally() {
        assertShipment(customerCriterion, "%", "ENV-WILDCARD");
        assertShipment(customerCriterion, "_", "ENV-WILDCARD");
    }

    @Test
    void nullableFieldsDoNotBreakQueriesAndMissingValuesDoNotMatch() {
        assertThat(search(customerCriterion, "missing")).isEmpty();
    }

    @Test
    void everyCriterionHonorsTheNonNullExceptionFreeContract() {
        List<PackageSearchCriterion> criteria = List.of(shipmentCriterion, orderCriterion,
                customerCriterion, addressCriterion, phoneCriterion, scheduleCriterion);
        PackageSearchTerm specialTerm = normalizer.normalize("%_!").orElseThrow();

        for (PackageSearchCriterion criterion : criteria) {
            assertThat(criterion.toSpecification(null)).isNotNull();
            assertThatNoException().isThrownBy(() -> repository.findAll(criterion.toSpecification(null)));
            assertThat(criterion.toSpecification(specialTerm)).isNotNull();
            assertThatNoException()
                    .isThrownBy(() -> repository.findAll(criterion.toSpecification(specialTerm)));
        }
    }

    private void assertShipment(PackageSearchCriterion criterion, String rawTerm) {
        assertShipment(criterion, rawTerm, "ENV-00001");
    }

    private void assertShipment(PackageSearchCriterion criterion, String rawTerm, String shipmentNumber) {
        assertThat(search(criterion, rawTerm))
                .extracting(DeliveryPackage::getShipmentNumber)
                .contains(shipmentNumber);
    }

    private List<DeliveryPackage> search(PackageSearchCriterion criterion, String rawTerm) {
        PackageSearchTerm term = normalizer.normalize(rawTerm).orElseThrow();
        return repository.findAll(criterion.toSpecification(term));
    }
}