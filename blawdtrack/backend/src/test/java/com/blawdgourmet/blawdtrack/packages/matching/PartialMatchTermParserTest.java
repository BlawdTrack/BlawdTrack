package com.blawdgourmet.blawdtrack.packages.matching;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class PartialMatchTermParserTest {

    private final PartialMatchTermParser parser = new PartialMatchTermParser();

    @Test
    void nullAndBlankTermsReturnNoTokens() {
        assertThat(parser.parse(null)).isEmpty();
        assertThat(parser.parse(" \t\n ")).isEmpty();
    }

    @Test
    void collapsesWhitespaceAndLowercasesWithRootLocale() {
        assertThat(parser.parse("  ENV-0001  DOS\nI "))
                .extracting(token -> token.likePatterns().getFirst())
                .containsExactly("%env-0001%", "%dos%", "%i%");
    }

    @Test
    void limitsTheNormalizedTermToOneHundredCharacters() {
        assertThat(parser.parse("A".repeat(105)).getFirst().likePatterns())
                .containsExactly("%" + "a".repeat(100) + "%");
    }

    @Test
    void keepsAtMostFiveWords() {
        assertThat(parser.parse("uno dos tres cuatro cinco seis"))
                .hasSize(5);
    }

    @Test
    void escapesLikeWildcardsAndEscapeCharacter() {
        assertThat(parser.parse("!%_").getFirst().likePatterns())
                .containsExactly("%!!!%!_%");
    }

    @Test
    void includesTheAccentlessVariantWithoutDuplicates() {
        assertThat(parser.parse("escazú").getFirst().likePatterns())
                .containsExactly("%escazú%", "%escazu%");
        assertThat(parser.parse("ñ").getFirst().likePatterns())
                .containsExactly("%ñ%", "%n%");
        assertThat(parser.parse("cliente").getFirst().likePatterns())
                .containsExactly("%cliente%");
    }

    @Test
    void buildsDigitsPatternOnlyForSupportedPhoneTerms() {
        assertThat(parser.parse("8888-9999").getFirst().digitsPattern()).isEqualTo("%88889999%");
        assertThat(parser.parse("+506").getFirst().digitsPattern()).isEqualTo("%506%");
        assertThat(parser.parse("ENV-0001").getFirst().digitsPattern()).isNull();
    }
}