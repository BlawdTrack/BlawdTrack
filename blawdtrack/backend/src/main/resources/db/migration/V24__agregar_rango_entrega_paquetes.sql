-- HU-010: rango de entrega de cada paquete. Por defecto 9:00 a 16:00 (se recalcula con la política de horario
-- de Zoho al registrar el paquete). Los datos del cliente, el estado y los índices ya los crean V14, V19 y V23.
ALTER TABLE paquetes ADD COLUMN hora_inicio_entrega TIME NOT NULL DEFAULT '09:00:00';
ALTER TABLE paquetes ADD COLUMN hora_fin_entrega TIME NOT NULL DEFAULT '16:00:00';
