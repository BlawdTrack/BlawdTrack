-- Datos de paquetes SOLO para el entorno de pruebas de extremo a extremo (docker-compose.e2e.yml).
-- Los aplica scripts/prepare-data.ps1 despues de crear las cuentas, y nunca los carga la aplicacion.
--
-- Por que existen: en develop ningun flujo asigna paquetes, los despacha ni los entrega, asi que la linea de
-- tiempo completa (HU-013), la evidencia de entrega (HU-013) y la eliminacion segun el estado (HU-012) no se pueden
-- alcanzar desde la interfaz. Estos registros dejan cada situacion lista para probarla.
--
-- Es idempotente: borra todo lo que empieza con E2E- y lo vuelve a crear. Antes de ejecutarlo, prepare-data.ps1
-- define @admin_email y @courier_email con las cuentas de test-accounts.json.
-- Solo ASCII: el script lo envia por una tuberia de PowerShell que no conserva tildes.

SET @admin_id = (SELECT id FROM usuarios WHERE correo = @admin_email);
SET @courier_user_id = (SELECT id FROM usuarios WHERE correo = @courier_email);
SET @courier_id = (SELECT id FROM mensajeros WHERE usuario_id = @courier_user_id);

DELETE FROM auditorias WHERE numero_envio LIKE 'E2E-%';
DELETE FROM paquetes_articulos WHERE paquete_id IN (SELECT id FROM paquetes WHERE numero_envio LIKE 'E2E-%');
DELETE FROM paquetes WHERE numero_envio LIKE 'E2E-%';

-- Un paquete por estado (HU-012 elimina solo Pendiente y Asignado; HU-013 consulta cualquiera).
INSERT INTO paquetes
    (numero_envio, numero_orden, nombre_cliente, telefono, direccion_entrega, horario_preferencia, estado,
     mensajero_id, hora_inicio_entrega, hora_fin_entrega)
VALUES
    ('E2E-PEND-01',  'SO-E2E-001', 'Cliente Pendiente',  '70000001', 'San Jose, Escazu',      NULL,                 'PENDING',       NULL,        '09:00:00', '16:00:00'),
    ('E2E-ASIG-01',  'SO-E2E-002', 'Cliente Asignado',   '70000002', 'Heredia, Barva',        'Antes de las 3 p.m.', 'ASSIGNED',      @courier_id, '09:00:00', '14:00:00'),
    ('E2E-ENV-01',   'SO-E2E-003', 'Cliente Enviado',    '70000003', 'Alajuela, Atenas',      NULL,                 'SHIPPED',       @courier_id, '09:00:00', '16:00:00'),
    ('E2E-TRANS-01', 'SO-E2E-004', 'Cliente En Transito','70000004', 'Cartago, Paraiso',      NULL,                 'IN_TRANSIT',    @courier_id, '09:00:00', '16:00:00'),
    ('E2E-NOENT-01', 'SO-E2E-006', 'Cliente No Entregado','70000006','Limon, Guapiles',       NULL,                 'NOT_DELIVERED', @courier_id, '09:00:00', '16:00:00');

-- El paquete entregado lleva la evidencia (foto y firma). Son imagenes PNG diminutas en un data URI para no depender
-- de ningun servidor de archivos.
INSERT INTO paquetes
    (numero_envio, numero_orden, nombre_cliente, telefono, direccion_entrega, horario_preferencia, estado,
     mensajero_id, hora_inicio_entrega, hora_fin_entrega, foto_entrega_url, firma_entrega_url)
VALUES
    ('E2E-ENTR-01', 'SO-E2E-005', 'Cliente Entregado', '70000005', 'Puntarenas, Esparza', 'Despues de las dos de la tarde',
     'DELIVERED', @courier_id, '14:00:00', '16:00:00',
     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAMCAIAAADkharWAAAAFUlEQVR42mPQawglCTGMahjVgB0BAAedwkHq3ncLAAAAAElFTkSuQmCC',
     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAGCAIAAABFHomwAAAAEUlEQVR42mOQsjEhCTGMRA0AsFkzwYFSilAAAAAASUVORK5CYII=');

-- Paquetes para que los casos de HU-012 puedan eliminar sin perder los de arriba.
INSERT INTO paquetes
    (numero_envio, numero_orden, nombre_cliente, telefono, direccion_entrega, estado, mensajero_id,
     hora_inicio_entrega, hora_fin_entrega)
VALUES
    ('E2E-DEL-P1', 'SO-E2E-101', 'Cliente Borrar 1', '71000001', 'San Jose, Moravia',      'PENDING',  NULL,        '09:00:00', '16:00:00'),
    ('E2E-DEL-P2', 'SO-E2E-102', 'Cliente Borrar 2', '71000002', 'San Jose, Tibas',        'PENDING',  NULL,        '09:00:00', '16:00:00'),
    ('E2E-DEL-P3', 'SO-E2E-103', 'Cliente Borrar 3', '71000003', 'San Jose, Curridabat',   'PENDING',  NULL,        '09:00:00', '16:00:00'),
    ('E2E-DEL-A1', 'SO-E2E-104', 'Cliente Borrar 4', '71000004', 'Heredia, Santo Domingo', 'ASSIGNED', @courier_id, '09:00:00', '16:00:00'),
    ('E2E-DEL-A2', 'SO-E2E-105', 'Cliente Borrar 5', '71000005', 'Heredia, San Rafael',    'ASSIGNED', @courier_id, '09:00:00', '16:00:00');

-- Articulos de dos paquetes (la ficha los muestra).
INSERT INTO paquetes_articulos (paquete_id, articulo_id, nombre, cantidad, sku, precio_unitario)
SELECT id, 'ITEM-1', 'Alfajor de cafe', 3.000, 'ALF-CAF', 1200.00 FROM paquetes WHERE numero_envio = 'E2E-PEND-01';
INSERT INTO paquetes_articulos (paquete_id, articulo_id, nombre, cantidad, sku, precio_unitario)
SELECT id, 'ITEM-2', 'Caja Blawd', 1.000, 'BOX-BLA', 9600.00 FROM paquetes WHERE numero_envio = 'E2E-ENTR-01';

-- Mas de 100 paquetes para probar "Cargar mas" de la busqueda (HU-014): E2E-BULK-001 a E2E-BULK-120. La
-- secuencia se arma con tres tablas de digitos (unidades, decenas y centenas) para no depender de CTE recursivas.
INSERT INTO paquetes
    (numero_envio, numero_orden, nombre_cliente, telefono, direccion_entrega, estado, mensajero_id,
     hora_inicio_entrega, hora_fin_entrega)
SELECT CONCAT('E2E-BULK-', LPAD(seq.n, 3, '0')), CONCAT('SO-E2E-BULK-', LPAD(seq.n, 3, '0')),
       CONCAT('Cliente Masivo ', LPAD(seq.n, 3, '0')), CONCAT('72', LPAD(seq.n, 6, '0')),
       'San Jose, Centro', 'PENDING', NULL, '09:00:00', '16:00:00'
FROM (
    SELECT u.d + 10 * t.d + 100 * h.d + 1 AS n
    FROM (SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
          UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) u
    CROSS JOIN (SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
          UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t
    CROSS JOIN (SELECT 0 AS d UNION ALL SELECT 1) h
) seq
WHERE seq.n <= 120;

-- Linea de tiempo (HU-013). Todos tienen el alta; los demas, los cambios hasta su estado actual.
-- Acciones: REGISTRAR_PAQUETE, ASIGNAR_PAQUETE y CAMBIAR_ESTADO_PAQUETE (ver AuditAction).
INSERT INTO auditorias (usuario_id, accion, detalle, fecha_hora, paquete_id, numero_envio, estado_anterior, estado_nuevo)
SELECT @admin_id, 'REGISTRAR_PAQUETE', 'Alta del paquete al importarlo.', '2026-10-01 08:00:00', id, numero_envio, NULL, 'PENDING'
FROM paquetes WHERE numero_envio IN ('E2E-PEND-01', 'E2E-ASIG-01', 'E2E-ENV-01', 'E2E-TRANS-01', 'E2E-ENTR-01', 'E2E-NOENT-01');

INSERT INTO auditorias (usuario_id, accion, detalle, fecha_hora, paquete_id, numero_envio, estado_anterior, estado_nuevo)
SELECT @admin_id, 'ASIGNAR_PAQUETE', 'Asignado al mensajero E2E.', '2026-10-01 09:00:00', id, numero_envio, 'PENDING', 'ASSIGNED'
FROM paquetes WHERE numero_envio IN ('E2E-ASIG-01', 'E2E-ENV-01', 'E2E-TRANS-01', 'E2E-ENTR-01', 'E2E-NOENT-01');

INSERT INTO auditorias (usuario_id, accion, detalle, fecha_hora, paquete_id, numero_envio, estado_anterior, estado_nuevo)
SELECT @admin_id, 'CAMBIAR_ESTADO_PAQUETE', 'Enviado a reparto.', '2026-10-01 10:00:00', id, numero_envio, 'ASSIGNED', 'SHIPPED'
FROM paquetes WHERE numero_envio IN ('E2E-ENV-01', 'E2E-TRANS-01', 'E2E-ENTR-01', 'E2E-NOENT-01');

INSERT INTO auditorias (usuario_id, accion, detalle, fecha_hora, paquete_id, numero_envio, estado_anterior, estado_nuevo)
SELECT @courier_user_id, 'CAMBIAR_ESTADO_PAQUETE', 'En camino al cliente.', '2026-10-01 11:00:00', id, numero_envio, 'SHIPPED', 'IN_TRANSIT'
FROM paquetes WHERE numero_envio IN ('E2E-TRANS-01', 'E2E-ENTR-01', 'E2E-NOENT-01');

INSERT INTO auditorias (usuario_id, accion, detalle, fecha_hora, paquete_id, numero_envio, estado_anterior, estado_nuevo)
SELECT @courier_user_id, 'CAMBIAR_ESTADO_PAQUETE', 'Entrega confirmada con foto y firma.', '2026-10-01 12:30:00', id, numero_envio, 'IN_TRANSIT', 'DELIVERED'
FROM paquetes WHERE numero_envio = 'E2E-ENTR-01';

INSERT INTO auditorias (usuario_id, accion, detalle, fecha_hora, paquete_id, numero_envio, estado_anterior, estado_nuevo)
SELECT @courier_user_id, 'CAMBIAR_ESTADO_PAQUETE', 'No se pudo entregar: nadie recibio.', '2026-10-01 12:45:00', id, numero_envio, 'IN_TRANSIT', 'NOT_DELIVERED'
FROM paquetes WHERE numero_envio = 'E2E-NOENT-01';
