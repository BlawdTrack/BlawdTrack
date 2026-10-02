package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.DuplicateExclusionResult;
import java.util.List;
import java.util.function.Function;

public interface DuplicateExclusionService {

    /**
     * Separa de {@code rows} las filas cuyo número de envío ya está registrado o se repite en el
     * archivo (se excluyen todas las copias de un repetido) y devuelve las importables con el reporte.
     * Debe volver a ejecutarse al confirmar la importación: entre la previsualización y la
     * confirmación pueden registrarse otros paquetes.
     *
     * @param shipmentNumberOf obtiene el número de envío de una fila; no puede devolver {@code null}
     */
    <T> DuplicateExclusionResult<T> excludeDuplicates(List<T> rows, Function<T, String> shipmentNumberOf);
}
