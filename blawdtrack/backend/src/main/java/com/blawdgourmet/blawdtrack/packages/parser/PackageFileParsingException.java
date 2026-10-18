package com.blawdgourmet.blawdtrack.packages.parser;

/**
 * Indica que un archivo de paquetes no posee un formato o contenido válido
 * para la importación de la HU010.
 */
public class PackageFileParsingException extends RuntimeException {

    public PackageFileParsingException(String message) {
        super(message);
    }

    public PackageFileParsingException(String message, Throwable cause) {
        super(message, cause);
    }
}
