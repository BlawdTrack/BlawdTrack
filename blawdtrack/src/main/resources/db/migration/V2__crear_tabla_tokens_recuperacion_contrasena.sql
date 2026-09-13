CREATE TABLE tokens_recuperacion_contrasena (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL,
    CONSTRAINT fk_tokens_recuperacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_tokens_recuperacion_usuario_id ON tokens_recuperacion_contrasena(usuario_id);
