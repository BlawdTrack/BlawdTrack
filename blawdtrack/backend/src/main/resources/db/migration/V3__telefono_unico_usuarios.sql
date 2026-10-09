-- El teléfono puede ser nulo; los valores presentes deben ser únicos entre usuarios.
UPDATE usuarios SET telefono = NULL WHERE TRIM(telefono) = '';
ALTER TABLE usuarios ADD CONSTRAINT uq_usuarios_telefono UNIQUE (telefono);
