# 📘 DGMTrack – Sistema de Seguimiento de Actos Contractuales

## 1. Objetivo del sistema
DGMTrack es un sistema interno para la **gestión y seguimiento de actos contractuales y procesos administrativos**, orientado a reemplazar planillas Excel dispersas por una solución centralizada, trazable y escalable.

Permite:
- Registrar procesos (expedientes / actos).
- Realizar seguimiento detallado por requisitos.
- Aplicar plantillas estándar (ej. CASCOS, UNIMOG).
- Visualizar el estado real de cada proceso.
- Preparar el camino para control presupuestario y reportes.

---

## 2. Estado actual del proyecto

### Funcionalidades implementadas
- Backend en **NestJS + TypeORM**.
- Base de datos **SQLite** (modo desarrollo).
- Frontend en **Angular (standalone components)**.
- CRUD completo de:
  - Dependencias
  - Procesos
  - Requisitos por proceso
- Aplicación de **plantillas de requisitos** a procesos.
- Vista de detalle tipo Excel para seguimiento operativo.
- Persistencia inmediata de cambios.

### Funcionalidades planificadas (no implementadas)
- Migraciones formales de base de datos.
- Control presupuestario por proceso.
- Reportes (PDF / Excel).
- Roles y permisos.
- Auditoría de cambios.

---

## 3. Arquitectura general

### Backend
- **Framework:** NestJS
- **ORM:** TypeORM
- **Base de datos:** SQLite (`data/sistema_tracking.db`)
- **Patrón:** Modular por dominio

Estructura principal:

src/
├─ dependencias/
├─ procesos/
├─ requisitos/
├─ plantillas/
└─ app.module.ts


### Frontend
- **Framework:** Angular
- **Arquitectura:** Standalone Components
- **Routing:** Angular Router
- **Comunicación:** HttpClient (servicios por dominio)

Estructura principal:
src/app/
├─ procesos/
│ ├─ procesos/
│ └─ proceso-detalle/
├─ servicios/
└─ app.routes.ts


---

## 4. Modelo de datos (visión conceptual)

### Proceso
Representa un acto contractual o expediente.

Campos relevantes:
- numeroExpediente
- tipoActo
- caso
- situacionActual
- puntosPrincipales
- estado
- dependencias
- requisitos (relación 1:N)

---

### RequisitoProceso
Unidad mínima de seguimiento dentro de un proceso.

Campos:
- orden (incremental)
- descripcion
- estado (`pendiente | en_gestion | completo | no_aplica`)
- aplica (boolean)
- responsableTexto
- observaciones
- diasEstimados
- fechaInicio / fechaFin

---

### Plantilla / PlantillaItem
Define conjuntos reutilizables de requisitos que pueden aplicarse a procesos reales.

---

## 5. Flujo de trabajo operativo

1. Crear un **Proceso**.
2. Completar datos generales del acto.
3. Aplicar una **Plantilla** de requisitos.
4. Ajustar requisitos según el caso real.
5. Actualizar estados y observaciones.
6. Utilizar la vista de detalle como tablero de control.

---

## 6. Puesta en marcha del sistema

### Requisitos previos
- Node.js (LTS)
- npm
- Git

---

### Backend
```bash
cd dgmtrackbackend
npm install
npm run start:dev

### Frontend
cd dgmtrackfrontend
npm install
npm start


