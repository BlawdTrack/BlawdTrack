ALTER TABLE paquetes
    ADD COLUMN evidencia_entrega_url VARCHAR(500) NULL,
    ADD COLUMN firma_entrega_url VARCHAR(500) NULL,
    ADD COLUMN foto_entrega_url VARCHAR(500) NULL;