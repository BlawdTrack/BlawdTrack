package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import java.io.InputStream;
import java.util.List;

public interface PackageFileParser {

    List<ImportedPackage> parse(InputStream input, String fileName);
}
