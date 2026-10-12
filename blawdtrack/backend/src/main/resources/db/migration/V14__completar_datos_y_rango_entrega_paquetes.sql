ALTER TABLE paquetes ADD COLUMN numero_orden VARCHAR(50);
ALTER TABLE paquetes ADD COLUMN nombre_cliente VARCHAR(120);
ALTER TABLE paquetes ADD COLUMN direccion_entrega VARCHAR(500);
ALTER TABLE paquetes ADD COLUMN telefono VARCHAR(30);
ALTER TABLE paquetes ADD COLUMN horario_preferencia VARCHAR(255);
ALTER TABLE paquetes ADD COLUMN estado VARCHAR(30) NOT NULL DEFAULT 'PENDING';
ALTER TABLE paquetes ADD COLUMN hora_inicio_entrega TIME NOT NULL DEFAULT '09:00:00';
ALTER TABLE paquetes ADD COLUMN hora_fin_entrega TIME NOT NULL DEFAULT '16:00:00';

ALTER TABLE paquetes ADD CONSTRAINT ck_paquetes_estado CHECK (
    estado IN ('PENDING', 'ASSIGNED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'NOT_DELIVERED')
);

CREATE INDEX idx_paquetes_numero_orden ON paquetes (numero_orden);
CREATE INDEX idx_paquetes_estado ON paquetes (estado);
