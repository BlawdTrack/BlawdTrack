CREATE TABLE historial_contrasenas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    CONSTRAINT fk_historial_contrasenas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
CREATE INDEX idx_historial_contrasenas_usuario_id ON historial_contrasenas(usuario_id);