ALTER TABLE paquetes
    ADD COLUMN numero_orden VARCHAR(50) NULL,
    ADD COLUMN cliente_nombre VARCHAR(120) NULL,
    ADD COLUMN cliente_telefono VARCHAR(20) NULL,
    ADD COLUMN entrega_direccion VARCHAR(300) NULL,
    ADD COLUMN entrega_horario VARCHAR(500) NULL,
    ADD COLUMN estado VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN mensajero_id BIGINT NULL,
    ADD CONSTRAINT fk_paquetes_mensajero_id
        FOREIGN KEY (mensajero_id) REFERENCES mensajeros(id);

CREATE TABLE paquetes_articulos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    paquete_id BIGINT NOT NULL,
    articulo_id VARCHAR(100),
    nombre VARCHAR(255),
    cantidad DECIMAL(12, 3) NOT NULL,
    sku VARCHAR(100),
    precio_unitario DECIMAL(12, 2),
    CONSTRAINT fk_paquetes_articulos_paquete_id
        FOREIGN KEY (paquete_id) REFERENCES paquetes(id) ON DELETE CASCADE
);
