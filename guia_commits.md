🚀 GUÍA OFICIAL DE COMMITS Y RAMAS - SPRINT 1 (BlawdTrack) 🚀

Equipo, para mantener la trazabilidad perfecta con Azure DevOps, asegurar que las tareas se actualicen solas y evitar que el código se rompa ("hacer un macarrón"), a partir de ahora todos los commits deben seguir estrictamente este estándar:

📝 1. Estructura Obligatoria del Mensaje de Commit
Cada vez que suban cambios, el mensaje debe redactarse con la siguiente fórmula:

Plaintext
tipo(alcance): descripción corta del cambio #ID_de_AzureDevOps
Tipos permitidos:

feat: Para una nueva característica, pantalla, endpoint o módulo.

fix: Para corregir un error o bug crítico o menor.

refactor: Para reestructurar código limpio sin alterar su funcionalidad (aplicando POO/SOLID).

docs: Para actualización de documentación técnica o del proyecto.

Alcance (scope): El módulo que están tocando (ej. login, admin, mensajero, db, auth).

ID de Azure DevOps: El número de la tarea exacta que están resolviendo en el tablero (por ejemplo, #145 o el código de la tarjeta). Esto vincula automáticamente el código con la plataforma.

💡 Ejemplos Prácticos por Área:
Backend (Java/Spring Boot):
feat(auth): implementar validación de credenciales en el servicio #142

Frontend (React/Vite):
feat(login): crear estructura visual de la pantalla de inicio de sesión #138

Base de Datos / Core:
refactor(db): ajustar relaciones en la matriz de roles y permisos #105

🛑 2. Reglas de Oro del Flujo de Trabajo
Cero Pushes Directos: Nadie sube código directo a develop ni a main. Todo pasa obligatoriamente por un Pull Request (PR).

Revisión Cruzada: Todo PR exige al menos 1 aprobación de un compañero del equipo antes de hacer el merge.

Asociación de Tareas: Si olvidan colocar el número de la tarea (#ID) en el commit, Azure DevOps no podrá registrar el avance del Sprint de forma automática.

¡Cualquier consulta sobre cómo sacar el ID de la tarjeta en Azure me avisan! Vamos a mantener este orden impecable desde el Día 1. 🔥
