# 🏗️ Estrategia Git Flow - BlawdTrack

## 📋 Descripción General

Este documento define la estrategia Git Flow completa para el proyecto BlawdTrack, diseñada para un equipo de 6 desarrolladores trabajando en paralelo sin bloquearse mutuamente.

---

## 🌳 Estructura de Ramas

```
                                                    
┌─────────────────────────────────────────────────────────────┐
│                          MAIN (main)                         │
│                   [Producción - Releases]                    │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 │ (merge con tags vX.X.X)
                 │
┌────────────────▼──────────────────────────────────────────────┐
│                        DEVELOP (develop)                       │
│                  [Rama Principal de Desarrollo]               │
└─┬──┬──────────────────────┬─────────────────────┬──────────────┘
  │  │                      │                     │
  │  ▼                      ▼                     ▼
  │  ┌────────────────┐  ┌──────────────────┐  ┌──────────────┐
  │  │ feature/base-  │  │ feature/base-    │  │ feature/HU-* │
  │  │ backend        │  │ frontend         │  │ (Historias)  │
  │  └────────────────┘  └──────────────────┘  └──────────────┘
  │
  └─> [Después de integrar base-backend y base-frontend]
      ↓
  Crear todas las ramas HU-001 a HU-028
```

---

## 📌 Ramas Principales

### 1. **main** (Rama de Producción)
- **Propósito**: Código estable en producción
- **Protecciones**:
  - ✅ Requerir Pull Request Reviews (2 aprobaciones)
  - ✅ Requerir checks CI/CD exitosos
  - ✅ Descartar ramas obsoletas automáticamente
  - ✅ Tagging automático de versiones
- **Acceso**: Solo líder técnico y DevOps

### 2. **develop** (Rama Principal de Desarrollo)
- **Propósito**: Integración de features completadas
- **Protecciones**:
  - ✅ Requerir Pull Request Reviews (1 aprobación)
  - ✅ Requerir checks CI/CD exitosos
  - ✅ Descartar ramas obsoletas automáticamente
- **Acceso**: Todos los desarrolladores

### 3. **feature/base-backend**
- **Creada desde**: develop
- **Responsables**: 2-3 desarrolladores
- **Contenido**:
  ```
  backend/
  ├── src/
  │   ├── config/
  │   │   ├── database.ts          # Configuración BD
  │   │   ├── environment.ts       # Variables de entorno
  │   │   └── logger.ts            # Sistema de logging
  │   ├── middleware/
  │   │   ├── auth.ts              # Autenticación
  │   │   ├── authorize.ts         # Autorización/Permisos
  │   │   ├── errorHandler.ts      # Manejo global de errores
  │   │   └── validation.ts        # Validación de datos
  │   ├── utils/
  │   │   ├── helpers.ts           # Funciones auxiliares
  │   │   ├── validators.ts        # Validadores
  │   │   └── constants.ts         # Constantes globales
  │   ├── models/
  │   │   └── index.ts             # Esquemas base
  │   ├── routes/
  │   │   └── index.ts             # Router base
  │   ├── services/
  │   │   └── auth.service.ts      # Servicio autenticación
  │   └── app.ts                   # Configuración Express
  ├── .env.example                 # Variables de ejemplo
  ├── package.json
  └── README.md
  ```

### 4. **feature/base-frontend**
- **Creada desde**: develop
- **Responsables**: 2-3 desarrolladores
- **Contenido**:
  ```
  frontend/
  ├── src/
  │   ├── components/
  │   │   ├── Layout/
  │   │   │   ├── Header.tsx
  │   │   │   ├── Sidebar.tsx
  │   │   │   └── Footer.tsx
  │   │   ├── Common/
  │   │   │   ├── Button.tsx
  │   │   │   ├── Input.tsx
  │   │   │   ├── Modal.tsx
  │   │   │   └── Loading.tsx
  │   │   └── Auth/
  │   │       └── LoginForm.tsx
  │   ├── pages/
  │   │   ├── Login.tsx
  │   │   └── Dashboard.tsx
  │   ├── services/
  │   │   ├── api.ts               # Consumo de API
  │   │   ├── auth.ts              # Lógica autenticación
  │   │   └── storage.ts           # LocalStorage/SessionStorage
  │   ├── hooks/
  │   │   ├── useAuth.ts
  │   │   └── useApi.ts
  │   ├── context/
  │   │   └── AuthContext.tsx
  │   ├── routes/
  │   │   └── Routes.tsx           # Sistema de rutas
  │   ├── types/
  │   │   └── index.ts             # Tipos globales
  │   ├── App.tsx
  │   └── main.tsx
  ├── .env.example
  ├── package.json
  └── README.md
  ```

---

## 🎯 Ramas de Historias de Usuario (HU)

Se crearán 28 ramas feature para cada Historia de Usuario:

```
feature/HU-001-login                    # Autenticación
feature/HU-002-restablecer-password     # Recuperación de contraseña
feature/HU-003-crear-mensajero          # Gestión de Mensajeros
feature/HU-004-actualizar-mensajero
feature/HU-005-desactivar-mensajero
feature/HU-006-crear-administrador      # Gestión de Administradores
feature/HU-007-actualizar-administrador
feature/HU-008-eliminar-administrador
feature/HU-009-roles-permisos           # Sistema de Roles
feature/HU-010-importar-paquetes        # Gestión de Paquetes
feature/HU-011-detectar-duplicados
feature/HU-012-eliminar-paquete
feature/HU-013-consultar-paquete
feature/HU-014-buscar-paquete
feature/HU-015-paquetes-pendientes
feature/HU-016-paquetes-por-estado
feature/HU-017-exportar-excel           # Reportes
feature/HU-018-generar-qr
feature/HU-019-asignar-paquetes         # Asignación
feature/HU-020-paquetes-por-mensajero
feature/HU-021-costos-mensajero         # Análisis
feature/HU-022-consultar-paquetes-asignados
feature/HU-023-actualizar-estado-paquete
feature/HU-024-consultar-comprobantes   # Comprobantes
feature/HU-025-imprimir-reportes        # Impresión
feature/HU-026-notificaciones-push      # Notificaciones
feature/HU-027-registrar-costos         # Costos
feature/HU-028-reporte-cambios          # Auditoría
```

---

## 👥 Estrategia de Trabajo - 6 Desarrolladores

### **Fase 1: Configuración Base (Semana 1)**

| Grupo | Integrantes | Tarea | Rama |
|-------|-----------|-------|------|
| **Grupo A** | Dev 1, Dev 2 | Backend base | `feature/base-backend` |
| **Grupo B** | Dev 3, Dev 4 | Frontend base | `feature/base-frontend` |
| **Grupo C** | Dev 5, Dev 6 | Documentación y QA | `develop` |

**Tareas Grupo C (mientras otros trabajan)**:
- [ ] Setup CI/CD pipeline
- [ ] Configurar branch protection rules
- [ ] Crear templates de PR
- [ ] Configurar linters y formatters
- [ ] Setup de ambiente de pruebas

### **Fase 2: Integración de Features (Semana 2 en adelante)**

Después de mergear `base-backend` y `base-frontend` a `develop`:

#### **Sprint 1 (HU-001 a HU-009)**

```
┌─────────────────────────────────────────────────────┐
│ DEV 1 - AUTENTICACIÓN Y USUARIOS                    │
├─────────────────────────────────────────────────────┤
│ ✓ HU-001: Login (frontend + backend)                │
│ ✓ HU-002: Restablecer password                      │
│ ✓ HU-003: Crear mensajero                           │
│ ✓ HU-004: Actualizar mensajero                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEV 2 - ADMINISTRACIÓN Y ROLES                      │
├─────────────────────────────────────────────────────┤
│ ✓ HU-005: Desactivar mensajero                      │
│ ✓ HU-006: Crear administrador                       │
│ ✓ HU-007: Actualizar administrador                  │
│ ✓ HU-008: Eliminar administrador                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEV 3 - SISTEMA DE PERMISOS                         │
├─────────────────────────────────────────────────────┤
│ ✓ HU-009: Roles y Permisos                          │
│ Colaboración: Apoya HU-001, HU-006                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEV 4 - PAQUETES: IMPORTACIÓN                       │
├─────────────────────────────────────────────────────┤
│ ✓ HU-010: Importar paquetes                         │
│ ✓ HU-011: Detectar duplicados                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEV 5 - PAQUETES: GESTIÓN                           │
├─────────────────────────────────────────────────────┤
│ ✓ HU-012: Eliminar paquete                          │
│ ✓ HU-013: Consultar paquete                         │
│ ✓ HU-014: Buscar paquete                            │
│ ✓ HU-015: Paquetes pendientes                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEV 6 - PAQUETES: CONSULTAS AVANZADAS               │
├─────────────────────────────────────────────────────┤
│ ✓ HU-016: Paquetes por estado                       │
│ ✓ HU-017: Exportar Excel                            │
│ ✓ HU-018: Generar QR                                │
└─────────────────────────────────────────────────────┘
```

#### **Sprint 2 (HU-019 a HU-028)**

```
┌─────────────────────────────────────────────────────┐
│ DEV 1 - ASIGNACIÓN                                  │
├─────────────────────────────────────────────────────┤
│ ✓ HU-019: Asignar paquetes                          │
│ ✓ HU-020: Paquetes por mensajero                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEV 2 - ANÁLISIS Y COSTOS                           │
├─────────────────────────────────────────────────────┤
│ ✓ HU-021: Costos mensajero                          │
│ ✓ HU-027: Registrar costos                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEV 3 - ESTADO Y CONSULTAS                          │
├─────────────────────────────────────────────────────┤
│ ✓ HU-022: Consultar paquetes asignados              │
│ ✓ HU-023: Actualizar estado paquete                 │
│ ✓ HU-024: Consultar comprobantes                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEV 4 - REPORTES E IMPRESIÓN                        │
├─────────────────────────────────────────────────────┤
│ ✓ HU-025: Imprimir reportes                         │
│ ✓ HU-028: Reporte cambios (auditoría)               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEV 5 - NOTIFICACIONES                              │
├─────────────────────────────────────────────────────┤
│ ✓ HU-026: Notificaciones push                       │
│ Refactor y optimización general                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEV 6 - TESTING Y INTEGRACIÓN                       │
├─────────────────────────────────────────────────────┤
│ ✓ E2E Testing                                       │
│ ✓ Integración de features                           │
│ ✓ Performance tuning                                │
└─────────────────────────────────────────────────────┘
```

---

## 🚫 Evitar Conflictos - Entidades Compartidas

### **Problema**: Múltiples HUs modifican las mismas entidades

### **Entidades Compartidas**:

1. **Usuario** (Autenticación, Permisos, Roles)
2. **Mensajero** (CRUD, Costos, Asignación)
3. **Paquete** (CRUD, Búsqueda, Estados, QR)
4. **Roles y Permisos** (Sistema central)
5. **Reportes** (Múltiples vistas)

### **Solución 1: Separación por Capas**

```typescript
// ✅ RECOMENDADO: Cada rama modifica DIFERENTES capas

// HU-001 (Login) → Modifica: middleware/auth.ts
// HU-003 (Crear Mensajero) → Modifica: services/mensajero.service.ts
// HU-009 (Roles) → Modifica: middleware/authorize.ts

// NO CONFLICTO porque tocan archivos diferentes
```

### **Solución 2: Interfaz de Contrato**

```typescript
// models/index.ts - Contrato central (NO SE MODIFICA)

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface IMensajero extends IUser {
  document: string;
  phone: string;
  costPerPackage: number;
}

export interface IPaquete {
  id: string;
  tracking: string;
  status: PackageStatus;
  assignedTo?: string;
  cost?: number;
}

// Cada rama agrega MÉTODOS, no modifica la interfaz
// HU-001 → Implementa: AuthService.login()
// HU-003 → Implementa: MensajeroService.create()
// Sin conflictos ✓
```

### **Solución 3: Gestión de Ramas Dependientes**

```
Dependencias recomendadas:

develop
  ├─ base-backend (DEBE completarse primero)
  ├─ base-frontend (DEBE completarse primero)
  │
  └─ feature/HU-009 (Roles - BLOCKER)
      ├─ feature/HU-001 (depende de HU-009)
      ├─ feature/HU-006 (depende de HU-009)
      ├─ feature/HU-019 (depende de HU-003)
      └─ feature/HU-023 (depende de HU-013)
```

### **Solución 4: Code Review Checklist**

```markdown
## ✅ Pre-Merge Checklist para Conflictos

- [ ] ¿Modifica archivos en common/models/?
  → Requiere aprobación de Tech Lead
  
- [ ] ¿Agrega nuevas entidades?
  → Crear PR a develop DESPUÉS de base-backend/frontend
  
- [ ] ¿Modifica middleware de autenticación?
  → Debe ser compatible con HU-001 y HU-009
  
- [ ] ¿Cambia estructura de BD?
  → Documentar en migration logs
  
- [ ] ¿Afecta a múltiples servicios?
  → E2E tests requeridos
```

### **Solución 5: Merge Strategy - Squash vs Merge Commit**

```bash
# Para evitar conflictos complejos:

# ✅ Usar SQUASH MERGE para features pequeñas (HU individuales)
git checkout develop
git pull origin develop
git merge --squash feature/HU-001-login
git commit -m "Merge HU-001: Login"

# ✅ Usar MERGE COMMIT para base (requiere resolución clara)
git checkout develop
git pull origin develop
git merge feature/base-backend -m "Merge: Base Backend Setup"
```

---

## 🔄 Flujo de Pull Request

### **1. Crear rama feature**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/HU-XXX-descripcion
```

### **2. Hacer commits atómicos**
```bash
git commit -m "feat(HU-XXX): descripción clara"
git commit -m "test(HU-XXX): agregar tests"
git commit -m "docs(HU-XXX): documentación"
```

### **3. Publicar rama**
```bash
git push origin feature/HU-XXX-descripcion
```

### **4. Crear PR con template**
```markdown
## Descripción
Implementa la Historia de Usuario: [HU-XXX-descripcion]

## Cambios
- [ ] Backend: cambios en servicios
- [ ] Frontend: cambios en componentes
- [ ] Base de datos: migraciones
- [ ] Tests: cobertura > 80%

## Entidades afectadas
- Usuario: sí/no
- Mensajero: sí/no
- Paquete: sí/no

## Conflictos potenciales
Verifica que NO entra en conflicto con:
- [ ] feature/HU-XXX (relacionada)
- [ ] feature/HU-YYY (usa mismas entidades)

## Checklist
- [ ] Tests passing
- [ ] No warnings/errors en lint
- [ ] Documentación actualizada
- [ ] Changelog actualizado
```

### **5. Revisión y aprobación**
- **Mínimo 1 aprobación** en develop
- **Todos los checks deben pasar** (CI/CD)
- **Revisor ≠ Autor**

### **6. Merge a develop**
```bash
# Opción A: Squash merge (recomendado para features)
git checkout develop
git pull origin develop
git merge --squash feature/HU-XXX-descripcion
git commit -m "feat: HU-XXX - descripcion completa"
git push origin develop

# Opción B: Merge commit (para cambios complejos)
git merge --no-ff feature/HU-XXX-descripcion
git push origin develop
```

### **7. Eliminar rama**
```bash
git branch -d feature/HU-XXX-descripcion
git push origin --delete feature/HU-XXX-descripcion
```

---

## 📊 Ciclo de Releases

### **Release en Staging (Rama temporal)**

```bash
# Crear rama de release
git checkout develop
git checkout -b release/v1.0.0

# Actualizaciones menores solo
# - Bump de versión
# - Changelog
# - Fix de bugs críticos

# Push a staging
git push origin release/v1.0.0
```

### **Release a Producción**

```bash
# Merge a main
git checkout main
git pull origin main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0: [descripción]"
git push origin main
git push origin v1.0.0

# Volver a develop
git checkout develop
git merge main
git push origin develop

# Eliminar rama de release
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

---

## 🛠️ Configuración de Branch Protection Rules

### **En GitHub Settings → Branch Protection Rules**

#### **Para main**
```yaml
Branch name pattern: main

✅ Require pull request reviews before merging
   - Required number of approvals: 2
   
✅ Require status checks to pass before merging
   - Checks requeridos:
     - build
     - test
     - lint
     
✅ Require branches to be up to date before merging

✅ Require code review from code owners

✅ Require signed commits

✅ Automatically delete head branches
```

#### **Para develop**
```yaml
Branch name pattern: develop

✅ Require pull request reviews before merging
   - Required number of approvals: 1
   
✅ Require status checks to pass before merging
   - Checks requeridos:
     - build
     - test
     - lint
     
✅ Require branches to be up to date before merging

✅ Automatically delete head branches

✅ Restrict who can push to matching branches
   - Allow: maintainers only
```

#### **Para feature/*
```yaml
Branch name pattern: feature/*

✅ Require pull request reviews before merging
   - Required number of approvals: 1
   - Dismiss stale pull request approvals
   
✅ Require status checks to pass before merging

✅ Automatically delete head branches
```

---

## 📝 Convención de Commits

```
<type>(<scope>): <subject>

<body>

<footer>

---

TYPES:
- feat: Nueva característica
- fix: Corrección de bug
- docs: Cambios en documentación
- style: Cambios de formato (sin lógica)
- refactor: Refactorización de código
- test: Agregar/modificar tests
- chore: Cambios de configuración

SCOPES:
- auth: Autenticación
- user: Usuarios
- mensajero: Módulo mensajero
- paquete: Módulo paquete
- report: Reportes
- admin: Administración

EJEMPLOS:
✓ feat(paquete): agregar detección de duplicados
✓ fix(auth): resolver token expirado
✓ test(user): cobertura de crear usuario
✓ docs(setup): actualizar guía instalación
```

---

## 🚀 Equipo y Responsabilidades

### **Roles en el Equipo de 6 Personas**

| Rol | Persona | Responsabilidades |
|-----|---------|-------------------|
| **Tech Lead** | Dev 1 | Arquitectura, reviews, PRs a main |
| **Backend Lead** | Dev 2 | Backend architecture, HU backend |
| **Frontend Lead** | Dev 3 | Frontend architecture, HU frontend |
| **DevOps** | Dev 4 | CI/CD, infrastructure, monitoring |
| **QA/Tester** | Dev 5 | Testing, E2E, performance |
| **Full-stack** | Dev 6 | Features completas, integración |

### **Reuniones**

```
┌─────────────────────────────────────────┐
│ LUNES: Planificación Sprint              │
│ Duración: 1 hora                         │
│ Temas:                                  │
│ - Asignación de HUs                      │
│ - Dependencias identificadas             │
│ - Bloqueadores potenciales               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ MIÉRCOLES: Sincronización de Avance      │
│ Duración: 30 minutos                     │
│ Temas:                                  │
│ - Status de cada feature                 │
│ - Conflictos encontrados                 │
│ - Support necesario                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ VIERNES: Demo + Retrospectiva            │
│ Duración: 1.5 horas                      │
│ Temas:                                  │
│ - Demo de features completadas           │
│ - Lecciones aprendidas                   │
│ - Mejoras para siguiente sprint           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ DIARIO: Standup (async)                  │
│ En: Slack/Teams                          │
│ Preguntas:                               │
│ - ¿Qué hice ayer?                        │
│ - ¿Qué hago hoy?                         │
│ - ¿Tengo bloqueadores?                   │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

### **Antes de empezar**

- [ ] Crear rama `develop` desde `main`
- [ ] Configurar branch protection rules
- [ ] Crear todas las ramas
- [ ] Compartir guía con equipo
- [ ] Configurar CI/CD pipeline
- [ ] Crear templates de PR
- [ ] Configurar pre-commit hooks

### **Fase 1: Base**

- [ ] Base backend completada en develop
- [ ] Base frontend completada en develop
- [ ] Ambiente de staging funcional
- [ ] Tests unitarios en ~80% cobertura

### **Fase 2: Features**

- [ ] Sprint 1 completado (HU-001 a HU-009)
- [ ] Sprint 2 completado (HU-010 a HU-028)
- [ ] Integración E2E validada
- [ ] Documentación actualizada

### **Fase 3: Release**

- [ ] QA completo en staging
- [ ] Versión tag creada
- [ ] Main actualizado
- [ ] Documentación de release publicada

---

## 📚 Referencias

- [Git Flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Última actualización**: 2026-07-23  
**Versión**: 1.0.0  
**Mantenedor**: Arquitecto de Software - BlawdTrack
