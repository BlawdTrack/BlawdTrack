-- Hasta ahora la conexión usaba serverTimezone=UTC y el driver convertía la hora local de la aplicación
-- (Costa Rica, UTC-6, sin horario de verano) a UTC al guardar las fechas. La conexión pasa a
-- connectionTimeZone=LOCAL y las fechas nuevas se guardan en hora local, por lo que las filas
-- existentes se corrigen restándoles las 6 horas de diferencia.
UPDATE auditorias
SET fecha_hora = TIMESTAMPADD(HOUR, -6, fecha_hora);

UPDATE historial_contrasenas
SET fecha_creacion = TIMESTAMPADD(HOUR, -6, fecha_creacion);

UPDATE tokens_recuperacion_contrasena
SET fecha_creacion = TIMESTAMPADD(HOUR, -6, fecha_creacion),
    fecha_expiracion = TIMESTAMPADD(HOUR, -6, fecha_expiracion);

UPDATE usuarios
SET fecha_ultimo_inicio_sesion = TIMESTAMPADD(HOUR, -6, fecha_ultimo_inicio_sesion)
WHERE fecha_ultimo_inicio_sesion IS NOT NULL;
