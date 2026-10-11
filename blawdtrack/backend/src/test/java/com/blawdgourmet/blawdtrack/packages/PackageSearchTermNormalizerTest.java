package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

import com.blawdgourmet.blawdtrack.packages.search.PackageSearchTermNormalizer;

class PackageSearchTermNormalizerTest {

    private final PackageSearchTermNormalizer normalizer = new PackageSearchTermNormalizer();

    @Test
    void nullAndBlankTermsAreAbsent() {
        assertThat(normalizer.normalize(null)).isEmpty();
        assertThat(normalizer.normalize("  \t ")).isEmpty();
    }

    @Test
    void trimsAndUppercasesTermsForCaseInsensitiveCollations() {
        assertThat(normalizer.normalize("  ENV-0001 ").orElseThrow().likePattern())
                .isEqualTo("ENV-0001%");
    }

    @Test
    void limitsTermLengthToOneHundredCharacters() {
        assertThat(normalizer.normalize("x".repeat(101)).orElseThrow().likePattern())
            .isEqualTo("X".repeat(PackageSearchTermNormalizer.MAX_TERM_LENGTH) + "%");
    }

    @Test
    void escapesLikeWildcardsAndEscapeCharacter() {
        assertThat(normalizer.normalize("A!%_B").orElseThrow().likePattern())
            .isEqualTo("A!!!%!_B%");
    }

    @Test
    void prefixPatternHasNoLeadingWildcard() {
        assertThat(normalizer.normalize("+506").orElseThrow().likePattern()).isEqualTo("+506%");
    }
}