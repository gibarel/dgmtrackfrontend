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

# ANEXO – Decisiones Técnicas No Negociables (DGMTrack)

Este anexo documenta decisiones estructurales del sistema DGMTrack que **no deben modificarse sin una evaluación técnica profunda**, ya que su alteración impacta directamente en la estabilidad, mantenibilidad y coherencia del sistema.

---

## 1. Arquitectura General

### 1.1 Backend
- El backend está desarrollado en **NestJS** con arquitectura modular por dominio.
- Cada módulo (procesos, requisitos, plantillas, dependencias) es **autónomo** y no debe mezclarse lógica entre módulos.
- El acceso a datos se realiza exclusivamente vía **TypeORM**.

❌ No introducir lógica de negocio en controllers.  
❌ No acceder a repositorios desde otros módulos sin servicios intermedios.

---

### 1.2 Frontend
- El frontend está desarrollado en **Angular con standalone components**.
- No se utilizan NgModules clásicos.
- Los servicios HTTP están desacoplados de los componentes.

❌ No volver a NgModules.  
❌ No mezclar lógica de negocio en templates.

---

## 2. Versionado de dependencias (CRÍTICO)

### 2.1 Angular
- Angular y Angular CDK **deben mantener el mismo major**.
- No actualizar Angular, CDK o RxJS de forma aislada.

Ejemplo válido:
- Angular 20.x
- Angular CDK 20.x

Ejemplo inválido:
- Angular 20.x + CDK 21.x

❌ No ejecutar `npm update` sin control.  
❌ No eliminar `package-lock.json` sin intención explícita.

---

### 2.2 Node / npm
- Usar Node.js **LTS**.
- Ejecutar siempre `npm install` luego de clonar o hacer `git pull`.

---

## 3. Base de Datos

### 3.1 SQLite
- SQLite se utiliza **solo para desarrollo**.
- El archivo `data/sistema_tracking.db` no debe considerarse productivo.

### 3.2 synchronize
- `synchronize: true` está habilitado únicamente para desarrollo.
- En producción debe deshabilitarse y utilizar migraciones.

❌ No usar `synchronize` en producción.

---

## 4. Modelo de Datos

### 4.1 Proceso
- Proceso es la **entidad raíz** del sistema.
- Todo requisito pertenece a un proceso.
- No deben existir requisitos huérfanos.

### 4.2 RequisitoProceso
- El campo `orden` define el orden lógico y visual.
- El orden es **incremental y continuo**.
- El sistema asume que el orden representa prioridad/flujo.

❌ No eliminar `orden`.  
❌ No permitir órdenes duplicados dentro de un mismo proceso.

---

### 4.3 Estados
- Los estados están definidos como **valores controlados**.
- No deben convertirse en texto libre.

Ejemplo:
- pendiente
- en_gestion
- completo
- no_aplica

---

## 5. Plantillas

- Las plantillas representan **estándares operativos** (ej. CASCOS, UNIMOG).
- Aplicar una plantilla **clona requisitos**, no los referencia.
- Una vez aplicada, el proceso es independiente de la plantilla.

❌ No usar referencias vivas a plantillas desde procesos.
❌ No modificar requisitos del proceso esperando que impacten en la plantilla.

---

## 6. UX y Persistencia

- El sistema prioriza **persistencia inmediata** (tipo Excel).
- Los cambios se guardan por fila, no por formulario completo.
- El frontend asume que cada cambio puede fallar individualmente.

❌ No introducir “Guardar todo” global sin rediseñar el flujo.
❌ No bloquear la UI completa por un error puntual.

---

## 7. Seguridad y Roles (futuro)

- Actualmente no hay control de roles.
- Cuando se implemente:
  - no debe romper el modelo actual
  - debe ser transversal (guards / interceptors)

❌ No hardcodear permisos en componentes.

---

## 8. Filosofía del sistema (clave)

DGMTrack está diseñado para:
- reflejar la realidad administrativa
- aceptar estados intermedios
- convivir con información incompleta
- evolucionar sin reescritura

Cualquier cambio que:
- rigidice el flujo,
- requiera “datos perfectos”,
- o fuerce un camino único,

**va en contra del diseño original**.

---

## 9. Regla final
Si una modificación:
- parece “rápida”,
- pero rompe alguna decisión de este anexo,

👉 **no es una buena modificación**.

Antes de cambiar, evaluar impacto en:
- datos históricos
- UX operativa
- continuidad del sistema

---



