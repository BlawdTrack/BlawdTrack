package com.blawdgourmet.blawdtrack.couriers.service;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

/**
 * Genera la contraseña temporal de un mensajero recién registrado (HU-003).
 * Usa {@link SecureRandom}, tiene 20 caracteres y garantiza al menos una mayúscula, una minúscula,
 * un dígito y un símbolo, mezclados al azar.
 */
@Component
public class TemporaryPasswordGenerator {
    private static final String[] GROUPS = {
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz", "0123456789", "!@#$%&*+-_"
    };
    private static final String ALPHABET = String.join("", GROUPS);
    private final SecureRandom random = new SecureRandom();

    /** Devuelve una contraseña nueva de 20 caracteres; nunca se guarda en texto plano. */
    public String generate() {
        char[] password = new char[20];
        for (int i = 0; i < GROUPS.length; i++) {
            password[i] = GROUPS[i].charAt(random.nextInt(GROUPS[i].length()));
        }
        for (int i = GROUPS.length; i < password.length; i++) {
            password[i] = ALPHABET.charAt(random.nextInt(ALPHABET.length()));
        }
        for (int i = password.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char swap = password[i];
            password[i] = password[j];
            password[j] = swap;
        }
        return new String(password);
    }
}
