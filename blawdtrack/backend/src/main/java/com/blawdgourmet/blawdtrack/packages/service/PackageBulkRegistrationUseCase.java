package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageBulkRegistrationResult;
import java.util.List;

/** Puerto de entrada para persistir un lote que ya superó las validaciones. */
public interface PackageBulkRegistrationUseCase {

    /**
     * @param validPackages paquetes validados y libres de duplicados
     * @param actor         usuario autenticado que importa; queda como responsable del alta de cada paquete
     */
    PackageBulkRegistrationResult registerValidPackages(List<ImportedPackage> validPackages, AuthenticatedUser actor);
}
