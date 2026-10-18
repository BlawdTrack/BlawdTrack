package com.blawdgourmet.blawdtrack.packages.parser;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.apache.poi.ooxml.POIXMLException;
import org.springframework.stereotype.Component;

/**
 * Coordina la lectura y agrupación de archivos exportados por Zoho Inventory
 * (HU010, task 263).
 */
@Component
public class ZohoPackageFileParser implements PackageFileParser {

    private final List<TableReader> readers;
    private final ZohoPackageGrouper grouper;

    ZohoPackageFileParser(List<TableReader> readers, ZohoPackageGrouper grouper) {
        this.readers = List.copyOf(readers);
        this.grouper = grouper;
    }

    @Override
    public List<ImportedPackage> parse(InputStream input, String fileName) {
        if (input == null) {
            throw new PackageFileParsingException("El archivo es obligatorio");
        }
        String extension = extensionOf(fileName);
        TableReader reader = readers.stream()
                .filter(candidate -> candidate.extension().equals(extension))
                .findFirst()
                .orElseThrow(() -> new PackageFileParsingException(
                        "Formato no compatible. Solo se permiten archivos " + supportedFormats()));
        try {
            return grouper.group(reader.read(input));
        } catch (PackageFileParsingException exception) {
            throw exception;
        } catch (IOException | POIXMLException exception) {
            throw new PackageFileParsingException("No se pudo leer el archivo de paquetes", exception);
        }
    }

    private String supportedFormats() {
        return readers.stream()
                .map(TableReader::extension)
                .sorted()
                .map(extension -> "." + extension)
                .collect(Collectors.joining(" y "));
    }

    private static String extensionOf(String fileName) {
        if (fileName == null || fileName.isBlank() || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
