-- El estado nació como texto en español (V19, 'PENDIENTE'). HU-012 lo modela como el enum PackageStatus, que guarda el
-- nombre de la constante: se convierten los valores existentes, el valor por defecto pasa a 'PENDING' y se limita a los
-- seis estados del ciclo de vida.
UPDATE paquetes SET estado = CASE estado
    WHEN 'PENDIENTE' THEN 'PENDING'
    WHEN 'ASIGNADO' THEN 'ASSIGNED'
    WHEN 'ENVIADO' THEN 'SHIPPED'
    WHEN 'EN_TRANSITO' THEN 'IN_TRANSIT'
    WHEN 'ENTREGADO' THEN 'DELIVERED'
    WHEN 'NO_ENTREGADO' THEN 'NOT_DELIVERED'
    ELSE estado
END;

ALTER TABLE paquetes ALTER COLUMN estado SET DEFAULT 'PENDING';

ALTER TABLE paquetes ADD CONSTRAINT ck_paquetes_estado CHECK (
    estado IN ('PENDING', 'ASSIGNED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'NOT_DELIVERED')
);

CREATE INDEX idx_paquetes_estado ON paquetes (estado);
