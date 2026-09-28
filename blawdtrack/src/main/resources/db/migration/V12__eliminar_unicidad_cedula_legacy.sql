-- La identidad única se valida por la combinación tipo_documento + numero_documento.
-- La columna cedula se conserva temporalmente por compatibilidad con datos antiguos,
-- pero ya no debe impedir que dos tipos de documento compartan el mismo número.
ALTER TABLE usuarios DROP INDEX uq_usuarios_cedula;
