package com.blawdgourmet.blawdtrack.packages.parser;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.ParsedPackageFile;
import java.io.InputStream;
import java.util.List;

/**
 * Contrato para transformar un archivo de paquetes en datos listos para validar
 * (HU010, task 263).
 */
public interface PackageFileParser {

    /** Lee el archivo y separa los paquetes que se conservan de las copias con datos contradictorios. */
    ParsedPackageFile parseFile(InputStream input, String fileName);

    /** Solo los paquetes que se conservan, sin las copias contradictorias. */
    default List<ImportedPackage> parse(InputStream input, String fileName) {
        return parseFile(input, fileName).packages();
    }
}
