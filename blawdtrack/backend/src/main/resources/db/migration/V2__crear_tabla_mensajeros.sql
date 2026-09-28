-- Alinear el estado por defecto con UserStatus sin modificar la migración V1.
UPDATE usuarios SET estado = 'ACTIVE' WHERE estado = 'ACTIVO';
ALTER TABLE usuarios ALTER COLUMN estado SET DEFAULT 'ACTIVE';

-- La cuenta conserva nombre, cédula, teléfono, correo, hash, estado y rol.
-- El catálogo MENSAJERO ya es inicializado por DataSeeder.
CREATE TABLE mensajeros (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    horario VARCHAR(255) NOT NULL,
    capacidad_maxima_carga_kg DECIMAL(10, 2) NOT NULL,
    CONSTRAINT uq_mensajeros_usuario UNIQUE (usuario_id),
    CONSTRAINT fk_mensajeros_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT chk_mensajeros_horario CHECK (CHAR_LENGTH(TRIM(horario)) > 0),
    CONSTRAINT chk_mensajeros_capacidad CHECK (capacidad_maxima_carga_kg > 0)
);
