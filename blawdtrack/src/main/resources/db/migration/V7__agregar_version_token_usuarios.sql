-- Versión de las sesiones del usuario. Se incrementa al cambiar el estado de la cuenta
-- para invalidar los tokens emitidos con una versión anterior.
ALTER TABLE usuarios ADD COLUMN version_token INT NOT NULL DEFAULT 0;
