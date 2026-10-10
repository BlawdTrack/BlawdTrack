ALTER TABLE auditorias
    ADD COLUMN paquete_id BIGINT NULL,
    ADD COLUMN numero_envio VARCHAR(50) NULL,
    ADD COLUMN estado_anterior VARCHAR(30) NULL,
    ADD COLUMN estado_nuevo VARCHAR(30) NULL,
    ADD CONSTRAINT fk_auditorias_paquete_id
        FOREIGN KEY (paquete_id) REFERENCES paquetes(id) ON DELETE SET NULL;

CREATE INDEX idx_auditorias_paquete_accion_fecha
    ON auditorias (paquete_id, accion, fecha_hora, id);
