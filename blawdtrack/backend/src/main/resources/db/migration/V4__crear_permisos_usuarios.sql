-- Excepciones a los permisos predeterminados del rol de cada usuario.
-- Sin fila, se aplica el valor definido en roles_permisos.
-- permitido = TRUE concede el permiso; FALSE lo revoca.
CREATE TABLE usuarios_permisos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    permitido BOOLEAN NOT NULL,
    CONSTRAINT uq_usuarios_permisos_usuario_permiso UNIQUE (usuario_id, permiso_id),
    CONSTRAINT fk_usuarios_permisos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_usuarios_permisos_permiso FOREIGN KEY (permiso_id) REFERENCES permisos(id)
);

CREATE INDEX idx_usuarios_permisos_permiso_id ON usuarios_permisos(permiso_id);
