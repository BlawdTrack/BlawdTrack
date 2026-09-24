package com.blawdgourmet.blawdtrack.users;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

import com.blawdgourmet.blawdtrack.users.model.User;

class UserIdentityModelTest {

    @Test
    void modelDoesNotExposeLegacyIdentityAliases() {
        Field[] fields = User.class.getDeclaredFields();
        assertThat(java.util.Arrays.stream(fields)
                .map(Field::getName))
                .doesNotContain("nationalId")
                .doesNotContain("cedula");

        Method[] methods = User.class.getDeclaredMethods();
        assertThat(java.util.Arrays.stream(methods)
                .map(Method::getName))
                .doesNotContain("getNationalId")
                .doesNotContain("setNationalId")
                .doesNotContain("getCedula")
                .doesNotContain("setCedula")
                .doesNotContain("synchronizeLegacyDocumentAlias");
    }
}
