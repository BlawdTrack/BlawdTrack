package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.PackageImportExecutionResponse;
import java.io.InputStream;

/** Ejecuta de extremo a extremo una importación confirmada. */
public interface PackageImportExecutionUseCase {

    PackageImportExecutionResponse execute(InputStream input, String fileName);
}
