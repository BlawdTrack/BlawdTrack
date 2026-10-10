package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.PackageImportPreviewResponse;
import java.io.InputStream;

/** Puerto de entrada para procesar una carga sin persistir sus paquetes. */
public interface PackageImportPreviewUseCase {

    PackageImportPreviewResponse preview(InputStream input, String fileName);
}
