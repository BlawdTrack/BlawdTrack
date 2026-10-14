package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.PackageImportPreviewResponse;
import java.io.InputStream;

/** Procesa una carga de paquetes para previsualizarla sin persistir registros. */
public interface PackageImportPreviewService {

    PackageImportPreviewResponse preview(InputStream input, String fileName);
}
