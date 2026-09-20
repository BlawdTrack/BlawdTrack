CREATE TABLE auditorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    usuario_afectado_id BIGINT NULL,
    accion VARCHAR(100) NOT NULL,
    detalle VARCHAR(500) NULL,
    fecha_hora DATETIME NOT NULL,
    CONSTRAINT fk_auditorias_usuario_id FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_auditorias_usuario_afectado_id FOREIGN KEY (usuario_afectado_id) REFERENCES usuarios(id)
);
