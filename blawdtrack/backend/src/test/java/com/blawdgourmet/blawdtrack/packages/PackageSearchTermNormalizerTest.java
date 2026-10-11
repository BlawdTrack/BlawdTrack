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
    void trimsAndLowercasesTerms() {
        assertThat(normalizer.normalize("  ENV-0001 ").orElseThrow().likePattern())
                .isEqualTo("%env-0001%");
    }

    @Test
    void limitsTermLengthToOneHundredCharacters() {
        assertThat(normalizer.normalize("x".repeat(101)).orElseThrow().likePattern())
                .isEqualTo("%" + "x".repeat(PackageSearchTermNormalizer.MAX_TERM_LENGTH) + "%");
    }

    @Test
    void escapesLikeWildcardsAndEscapeCharacter() {
        assertThat(normalizer.normalize("A!%_B").orElseThrow().likePattern())
                .isEqualTo("%a!!!%!_b%");
    }

    @Test
    void createsDigitPatternOnlyForPhoneLikeTerms() {
        assertThat(normalizer.normalize("8888-9999").orElseThrow().digitsPattern())
                .isEqualTo("%88889999%");
        assertThat(normalizer.normalize("+506").orElseThrow().digitsPattern())
                .isEqualTo("%506%");
        assertThat(normalizer.normalize("ENV-0001").orElseThrow().digitsPattern()).isNull();
    }
}