package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/**
 * Contenido de un archivo de paquetes ya agrupado por número de envío (HU-010 / HU-011).
 *
 * @param packages        un paquete por número de envío: el primero que aparece en el archivo.
 * @param conflictingCopies paquetes posteriores con el mismo número de envío pero datos distintos (otro cliente,
 *                        dirección, teléfono u orden). No se importan: se informan como duplicados en el archivo.
 */
public record ParsedPackageFile(List<ImportedPackage> packages, List<ImportedPackage> conflictingCopies) {

    public ParsedPackageFile {
        packages = List.copyOf(packages);
        conflictingCopies = List.copyOf(conflictingCopies);
    }
}
