ALTER TABLE usuarios
    ADD tipo_documento VARCHAR(20) NULL;

ALTER TABLE usuarios
    ADD numero_documento VARCHAR(50) NULL;

UPDATE usuarios
SET tipo_documento = 'CEDULA',
    numero_documento = cedula
WHERE tipo_documento IS NULL AND cedula IS NOT NULL;

CREATE UNIQUE INDEX uq_usuarios_tipo_documento_numero_documento
    ON usuarios (tipo_documento, numero_documento);
