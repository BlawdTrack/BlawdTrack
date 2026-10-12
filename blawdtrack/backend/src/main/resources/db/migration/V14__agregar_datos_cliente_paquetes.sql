ALTER TABLE paquetes
    ADD COLUMN numero_orden VARCHAR(50) NULL;

ALTER TABLE paquetes
    ADD COLUMN nombre_cliente VARCHAR(120) NULL;

ALTER TABLE paquetes
    ADD COLUMN telefono VARCHAR(30) NULL;

ALTER TABLE paquetes
    ADD COLUMN direccion_entrega VARCHAR(500) NULL;

ALTER TABLE paquetes
    ADD COLUMN horario_preferencia VARCHAR(255) NULL;