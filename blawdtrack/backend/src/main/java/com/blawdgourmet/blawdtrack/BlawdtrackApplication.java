package com.blawdgourmet.blawdtrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de BlawdTrack, el backend de seguimiento de paquetes y mensajeros.
 * Requiere la variable de entorno {@code JWT_SECRET} y una base MySQL (ver el README del backend).
 */
@SpringBootApplication
public class BlawdtrackApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlawdtrackApplication.class, args);
	}

}
