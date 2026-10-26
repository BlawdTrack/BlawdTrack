-- La unicidad de documento ahora la garantiza uq_usuarios_tipo_documento_numero_documento
-- (tipo_documento, numero_documento), creada en V9. La restricción única sobre la
-- columna legacy "cedula" (V1) quedó vigente en paralelo y bloqueaba combinaciones
-- válidas como CEDULA y DIMEX compartiendo el mismo número.
ALTER TABLE usuarios
    DROP INDEX uq_usuarios_cedula;
