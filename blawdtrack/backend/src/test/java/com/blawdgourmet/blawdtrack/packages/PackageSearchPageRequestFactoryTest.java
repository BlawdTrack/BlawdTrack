package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.blawdgourmet.blawdtrack.packages.search.PackageSearchPageRequestFactory;

class PackageSearchPageRequestFactoryTest {

    private final PackageSearchPageRequestFactory factory = new PackageSearchPageRequestFactory();

    @Test
    void invalidPageAndSizeValuesFallBackToValidDefaults() {
        for (String rawValue : new String[] {null, "", "abc", "-1", "0", "99999999999"}) {
            Pageable pageable = factory.create(rawValue, rawValue);
            assertThat(pageable.getPageNumber()).isZero();
            assertThat(pageable.getPageSize()).isEqualTo(PackageSearchPageRequestFactory.DEFAULT_PAGE_SIZE);
        }
    }

    @Test
    void negativePageAndOutOfRangeSizeAreNormalized() {
        assertThat(factory.create("-1", "1000").getPageNumber()).isZero();
        assertThat(factory.create("4", "1000").getPageSize()).isEqualTo(100);
    }

    @Test
    void ordersByIdDescending() {
        Sort.Order order = factory.create("0", "20").getSort().getOrderFor("id");
        assertThat(order).isNotNull();
        assertThat(order.getDirection()).isEqualTo(Sort.Direction.DESC);
    }
}