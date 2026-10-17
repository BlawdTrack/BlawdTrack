ALTER TABLE paquetes
    ADD COLUMN evidencia_entrega_url VARCHAR(500) NULL;

ALTER TABLE paquetes
    ADD COLUMN firma_entrega_url VARCHAR(500) NULL;

ALTER TABLE paquetes
    ADD COLUMN foto_entrega_url VARCHAR(500) NULL;