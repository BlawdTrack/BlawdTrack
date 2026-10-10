package com.blawdgourmet.blawdtrack.packages.parser;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import java.io.InputStream;
import java.util.List;

/**
 * Contrato para transformar un archivo de paquetes en datos listos para validar
 * (HU010, task 263).
 */
public interface PackageFileParser {

    List<ImportedPackage> parse(InputStream input, String fileName);
}
