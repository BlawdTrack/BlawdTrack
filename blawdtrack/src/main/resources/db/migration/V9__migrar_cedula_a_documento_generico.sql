ALTER TABLE usuarios DROP INDEX uq_usuarios_cedula;

ALTER TABLE usuarios ADD COLUMN tipo_documento VARCHAR(20) NOT NULL DEFAULT 'CEDULA';

ALTER TABLE usuarios RENAME COLUMN cedula TO numero_documento;

ALTER TABLE usuarios ALTER COLUMN tipo_documento DROP DEFAULT;

ALTER TABLE usuarios ADD CONSTRAINT uq_usuarios_tipo_documento_numero_documento UNIQUE (tipo_documento, numero_documento);
