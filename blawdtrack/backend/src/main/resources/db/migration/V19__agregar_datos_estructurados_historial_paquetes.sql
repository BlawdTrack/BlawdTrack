ALTER TABLE auditorias
    ADD COLUMN paquete_id BIGINT NULL;

ALTER TABLE auditorias
    ADD COLUMN numero_envio VARCHAR(50) NULL;

ALTER TABLE auditorias
    ADD COLUMN estado_anterior VARCHAR(30) NULL;

ALTER TABLE auditorias
    ADD COLUMN estado_nuevo VARCHAR(30) NULL;

ALTER TABLE auditorias
    ADD CONSTRAINT fk_auditorias_paquete_id
        FOREIGN KEY (paquete_id) REFERENCES paquetes(id) ON DELETE SET NULL;

CREATE INDEX idx_auditorias_paquete_accion_fecha
    ON auditorias (paquete_id, accion, fecha_hora, id);

CREATE INDEX idx_auditorias_numero_envio_accion_fecha
    ON auditorias (numero_envio, accion, fecha_hora, id);