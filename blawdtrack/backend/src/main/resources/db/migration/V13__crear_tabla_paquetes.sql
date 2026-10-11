CREATE TABLE paquetes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_envio VARCHAR(50) NOT NULL,
    CONSTRAINT uq_paquetes_numero_envio UNIQUE (numero_envio),
    CONSTRAINT chk_paquetes_numero_envio CHECK (CHAR_LENGTH(TRIM(numero_envio)) > 0)
);
