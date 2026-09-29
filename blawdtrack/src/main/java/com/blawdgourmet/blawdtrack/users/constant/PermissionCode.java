package com.blawdgourmet.blawdtrack.users.constant;

public final class PermissionCode {
    private PermissionCode() {}

    public static final String USER_CREATE = "USUARIO_CREAR";
    public static final String USER_UPDATE = "USUARIO_ACTUALIZAR";
    public static final String USER_DEACTIVATE = "USUARIO_DESACTIVAR";
    public static final String USER_DELETE = "USUARIO_ELIMINAR";
    public static final String ROLE_ASSIGN = "ROL_ASIGNAR";

    public static final String PACKAGE_IMPORT = "PAQUETE_IMPORTAR";
    public static final String PACKAGE_DELETE = "PAQUETE_ELIMINAR";
    public static final String PACKAGE_VIEW = "PAQUETE_CONSULTAR";
    public static final String PACKAGE_SEARCH = "PAQUETE_BUSCAR";
    public static final String PACKAGE_EXPORT = "PAQUETE_EXPORTAR";
    public static final String PACKAGE_GENERATE_QR = "PAQUETE_GENERAR_QR";
    public static final String PACKAGE_ASSIGN = "PAQUETE_ASIGNAR";

    public static final String PACKAGE_VIEW_ASSIGNED = "PAQUETE_CONSULTAR_ASIGNADOS";
    public static final String PACKAGE_UPDATE_STATUS = "PAQUETE_ACTUALIZAR_ESTADO";
    public static final String TRIP_COST_REGISTER = "COSTO_VIAJE_REGISTRAR";

    public static final String REPORT_VIEW = "REPORTE_CONSULTAR";
    public static final String REPORT_PRINT = "REPORTE_IMPRIMIR";
    public static final String PROOF_OF_DELIVERY_VIEW = "COMPROBANTE_CONSULTAR";
    public static final String COST_VIEW = "COSTO_CONSULTAR";
}