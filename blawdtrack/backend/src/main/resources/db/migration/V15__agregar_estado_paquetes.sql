ALTER TABLE paquetes ADD COLUMN estado VARCHAR(30) NOT NULL DEFAULT 'PENDING';

ALTER TABLE paquetes ADD CONSTRAINT ck_paquetes_estado CHECK (
    estado IN ('PENDING', 'ASSIGNED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'NOT_DELIVERED')
);

CREATE INDEX idx_paquetes_estado ON paquetes (estado);
