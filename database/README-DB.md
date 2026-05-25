# SIGMALAB — Análisis del Proyecto y Diseño de Base de Datos

## Índice
1. [Revisión del Proyecto (Errores, Redundancias, Mejoras)](#1-revisión-del-proyecto)
2. [Diseño de Base de Datos PostgreSQL](#2-diseño-de-base-de-datos)
3. [Modelo Entidad-Relación](#3-modelo-entidad-relación)
4. [Decisiones de Diseño](#4-decisiones-de-diseño)
5. [Integración con el Sistema](#5-integración-con-el-sistema)

---

## 1. Revisión del Proyecto

### 1.1 Errores Identificados

#### Críticos

| # | Error | Ubicación | Descripción |
|---|-------|-----------|-------------|
| E1 | **Frontend sin conexión al Backend** | `frontend/src/views/*`, `frontend/src/lib/store.ts` | El frontend usa datos locales (`sigmalab-data.ts` + `store.ts`) en lugar de consumir la API del backend. Los servicios (`apiClient.ts`, `authService.ts`) existen pero **ninguna vista los utiliza**. El sistema es una SPA sin persistencia real. |
| E2 | **Dos sistemas de autenticación paralelos** | `lib/auth.ts` vs `context/AuthContext.tsx` | `lib/auth.ts` maneja auth local (localStorage, contraseñas en texto plano). `AuthContext.tsx` intenta usar el backend pero las vistas usan `useApp()` que depende de `lib/auth.ts`. Hay dos fuentes de verdad. |
| E3 | **Contraseñas en texto plano en localStorage** | `frontend/src/lib/auth.ts:49-62` | Las cuentas demo se almacenan con `password: "123456"` en localStorage sin hash, accesible desde DevTools. |
| E4 | **Backend incompleto** | `backend/routes/index.ts` | Solo 3 rutas montadas (auth, equipos, laboratorios). Faltan: mantenimientos, incidencias, inventario, insumos, periféricos, logs, reportes, asignaciones, historial. |

#### Estructurales

| # | Problema | Ubicación |
|---|----------|-----------|
| E5 | **Scripts de depuración en raíz del frontend** | `frontend/debug*.cjs`, `frontend/fix-*.cjs` (12 archivos) — código no debería estar en producción |
| E6 | **IDs inconsistentes** | Prisma schema: algunos modelos usan `cuid()` (Mantenimiento, Incidencia), otros usan IDs custom string (Equipo, Laboratorio, Periferico). El frontend usa IDs de tipo `"MP-seed-1"` y `"MC-seed-1"` |
| E7 | **Tipos duplicados/inconsistentes** | `AppRole` definido en `Prisma schema` (enum), en `lib/auth.ts`, en `sigmalab-data.ts` con strings diferentes (`"Encargado ITIC"` vs `"encargado"`) |
| E8 | **Backend no refleja el modelo del frontend** | El Prisma schema tiene 11 modelos y el seed solo inserta usuarios y laboratorios. Faltan seeds para mantenimientos, incidencias, etc. |

#### Lógicos

| # | Problema | Descripción |
|---|----------|-------------|
| E9 | **Edificios hardcodeados** | `"Edificio Principal"` y `"Edificio LASIN"` como strings en lugar de tabla normalizada |
| E10 | **Sin auditoría real** | `Log` model existe en Prisma pero sin controladores ni rutas. El frontend tiene logs locales en `store.ts` que se pierden al recargar. |
| E11 | **Sin control de stock real** | `insumos_usados.descontar_insumo()` no existe en el backend. El frontend simula descuento localmente pero sin persistencia. |
| E12 | **Materias/grupos/horarios ausentes** | El sistema es para una carrera universitaria pero no modela materias, grupos ni horarios que son esenciales para la gestión de laboratorios. |

### 1.2 Redundancias

| # | Redundancia | Detalle |
|---|-------------|---------|
| R1 | **Datos duplicados frontend/backend** | `sigmalab-data.ts` replica (como strings) lo que debería servirse desde la BD a través de la API |
| R2 | **Auth duplicado** | `lib/auth.ts` (local) y `AuthContext.tsx` (API) hacen lo mismo — login/logout/gestión de sesión |
| R3 | **Definiciones de tipos repetidas** | `Equipo` definido en Prisma, en `sigmalab-data.ts`, en `store.ts`, en `equipoService.ts` — 4 definiciones para la misma entidad |
| R4 | **ROLES definidos en 3+ lugares** | Prisma enum `AppRole`, `lib/auth.ts` type `AppRole`, `sigmalab-data.ts` array de roles |

### 1.3 Mejoras Propuestas

| # | Mejora | Prioridad | Impacto |
|---|--------|-----------|---------|
| M1 | **Conectar frontend al backend real** — Reemplazar `store.ts` con TanStack Query + llamadas API | Alta | Crítico para funcionalidad |
| M2 | **Unificar auth** — Eliminar `lib/auth.ts`, usar solo `AuthContext.tsx` con JWT del backend | Alta | Seguridad |
| M3 | **Completar API REST faltante** — 8 endpoints faltantes | Alta | Completitud |
| M4 | **Mover scripts debug a `scripts/` o eliminarlos** | Media | Limpieza |
| M5 | **Agregar tests (unit + integración)** | Media | Calidad |
| M6 | **Normalizar tipos compartidos** — Mover tipos comunes a un paquete compartido | Media | Mantenibilidad |
| M7 | **Agregar Docker Compose para BD + backend** | Baja | Despliegue |
| M8 | **Implementar CI/CD básico** | Baja | DevOps |

---

## 2. Diseño de Base de Datos

### 2.1 Arquitectura General

Base de datos PostgreSQL diseñada para el **Sistema de Gestión de Mantenimiento de Laboratorios** de la **Carrera de Informática de la UMSA**.

**Ubicación del script:** `database/sigmalab-umsa.sql`

### 2.2 Tablas (25 tablas)

#### Catálogos (5 tablas)
| Tabla | Propósito |
|-------|-----------|
| `edificios` | Edificios de la UMSA (Principal, LASIN, Monoblock) |
| `roles` | Roles del sistema con nivel de acceso numérico |
| `categorias_inventario` | Tipos de componentes (monitor, teclado, RAM, etc.) |
| `tipo_mantenimiento` | Preventivo / Correctivo |
| `estado_mantenimiento` | Programado, En proceso, Completado, Resuelto |
| `estado_equipo` | Funcionando, En mantenimiento, Pendiente, etc. |
| `estado_incidencia` | Nuevo, En proceso, Resuelto, Cerrado |

#### Personas y Usuarios (2 tablas)
| Tabla | Propósito |
|-------|-----------|
| `personas` | Personas reales (docentes, estudiantes, pasantes, personal). Contiene CI y registro universitario |
| `usuarios` | Cuentas del sistema vinculadas a personas. Contiene password_hash |

#### Infraestructura (3 tablas)
| Tabla | Propósito |
|-------|-----------|
| `laboratorios` | Laboratorios de cómputo, vinculados a edificio y encargado |
| `equipos` | Equipos de cómputo, con ubicación física (fila/puesto) en laboratorio |
| `perifericos` | Periféricos (monitores, teclados, proyectores) asignables a equipo o laboratorio |

#### Inventario e Insumos (2 tablas)
| Tabla | Propósito |
|-------|-----------|
| `inventario` | Componentes de repuesto con códigos ITIC, facultativo y UMSA |
| `insumos` | Insumos de limpieza/mantenimiento con control de stock mínimo |

#### Mantenimiento (4 tablas)
| Tabla | Propósito |
|-------|-----------|
| `mantenimientos` | Registro principal de mantenimientos |
| `mantenimientos_detalle` | Diagnóstico, acciones, observaciones (1:1 con mantenimiento) |
| `checklists` | Items de verificación por mantenimiento (hardware/software/pruebas) |
| `insumos_usados` | Insumos consumidos en cada mantenimiento (dispara trigger de descuento) |

#### Incidencias y Asignaciones (2 tablas)
| Tabla | Propósito |
|-------|-----------|
| `incidencias` | Reportes de problemas por docentes/estudiantes |
| `asignaciones` | Tareas asignadas a técnicos para resolución |

#### Reportes y Logs (2 tablas)
| Tabla | Propósito |
|-------|-----------|
| `reportes_pasante` | Reportes que los pasantes envían al encargado |
| `logs` | Auditoría de todas las acciones del sistema |

#### Académicas (5 tablas)
| Tabla | Propósito |
|-------|-----------|
| `materias` | Materias de la Carrera de Informática con siglas, nivel, horas |
| `grupos` | Paralelos de cada materia por gestión y período |
| `horarios` | Horarios de uso de laboratorios (con restricción UNIQUE por lab + día + hora) |
| `inscripciones` | Estudiantes inscritos en grupos |
| `uso_laboratorio` | Registro de uso real de laboratorios (ingreso/salida) |

### 2.3 Forma Normal

| FN | Estado | Verificación |
|----|--------|--------------|
| **1FN** | ✅ | Todos los atributos atómicos. Sin grupos repetitivos (checklists e insumos_usados como tablas separadas) |
| **2FN** | ✅ | Todos los atributos no clave dependen completamente de la PK. Ej: `equipos.nombre` depende solo de `codigo`, no de `laboratorio_id` |
| **3FN** | ✅ | Sin dependencias transitivas. Ej: `laboratorios` tiene `edificio_id` FK en lugar de almacenar el nombre del edificio directamente |

### 2.4 Constraints

- **15 PRIMARY KEY** constraints
- **20+ FOREIGN KEY** constraints con CASCADE/SET NULL según corresponda
- **6 CHECK** constraints:
  - `roles.nivel_acceso BETWEEN 1 AND 100`
  - `laboratorios.piso >= 0`
  - `mantenimientos CHECK (hora_fin > hora_inicio)`
  - `checklists.categoria IN ('hardware', 'software', 'pruebas')`
  - `checklists.estado IN ('OK', 'Regular', 'Mal')`
  - Prioridades, estados, períodos académicos
- **7 UNIQUE** constraints: email, CI, registro, serie de equipo, ubicación equipo, grupos materia, horarios laboratorio

### 2.5 Índices

- **15 B-tree indexes** en columnas de uso frecuente en JOINs y WHERE:
  - FK columns: `usuarios.role_id`, `equipos.laboratorio_id`, `mantenimientos.equipo_codigo`, `incidencias.equipo_codigo`
  - Ordenamiento: `logs.timestamp DESC`, `mantenimientos.fecha DESC`, `incidencias.fecha DESC`
  - Filtros: `insumos.stock` (partial index WHERE stock <= stock_minimo)

### 2.6 Triggers

| Trigger | Evento | Acción |
|---------|--------|--------|
| `trg_*_updated` (9 triggers) | BEFORE UPDATE | Actualiza automáticamente `updated_at` |
| `trg_mantenimiento_estado_equipo` | AFTER INSERT/UPDATE on mantenimientos | Cambia estado del equipo según el mantenimiento |
| `trg_insumos_usados_descontar` | AFTER INSERT on insumos_usados | Descuenta automáticamente del stock |

---

## 3. Modelo Entidad-Relación

### 3.1 Diagrama Lógico (Texto)

```
edificios 1---* laboratorios 1---* equipos
                                      |
roles 1---* usuarios              equipos 1---* mantenimientos 1---1 mantenimientos_detalle
              |                                       |                       |
         personas 1---1 usuarios          mantenimientos_detalle 1---* checklists
              |                             mantenimientos_detalle 1---* insumos_usados ---1 insumos
              |                                                                              
              |---* inscripciones ---1 grupos 1---* horarios ---1 laboratorios
              |                        |
              |                   materias
              |
              |---* incidencias (equipo/lab)
              |
         docentes ---* grupos (docente_id)
```

### 3.2 Flujo de Datos

```
[Docente/Estudiante]
    → Reporta Incidencia
        → Asignación a Técnico (Preventivo/Correctivo)
            → Mantenimiento + Detalle + Checklists + Insumos
                → Log de auditoría
                → Reporte de Pasante (si aplica)
```

```
[Encargado ITIC]
    → Gestiona: Laboratorios, Equipos, Usuarios, Periféricos
    → Supervisa: Mantenimientos, Incidencias, Asignaciones
    → Controla: Inventario, Insumos, Reportes de Pasante
```

### 3.3 Flujo Académico

```
[Materia] → [Grupo (docente + gestión)] → [Horario (lab + día + hora)]
    → [Inscripciones (estudiantes)]
    → [Uso real de laboratorio (ingreso/salida)]
```

---

## 4. Decisiones de Diseño

### 4.1 Separación Persona / Usuario
- **Decisión**: `personas` contiene datos reales (CI, registro universitario, email); `usuarios` contiene solo credenciales y rol.
- **Motivo**: Una misma persona (docente) podría no tener cuenta en el sistema → no está en `usuarios`. Un pasante puede ser también estudiante → misma persona, cuenta diferente.
- **Ventaja**: Evita duplicación de datos personales, permite rastreo real de quién hizo qué.

### 4.2 Catálogos como tablas (no ENUMs de PostgreSQL)
- **Decisión**: `roles`, `estado_equipo`, `tipo_mantenimiento`, etc. son tablas, no tipos ENUM.
- **Motivo**: Los catálogos pueden crecer sin migraciones. Permite agregar descripciones y niveles de acceso (como en `roles`). Compatible con Prisma.
- **Excepción**: Los CHECK en `checklists.categoria` y `asignaciones.prioridad` usan strings con CHECK por ser dominios pequeños y estables.

### 4.3 Descuento de stock vía trigger
- **Decisión**: `trg_insumos_usados_descontar` descuenta automáticamente al insertar en `insumos_usados`.
- **Motivo**: Garantiza consistencia sin depender de la lógica de aplicación. El trigger intenta parsear la cantidad como entero.

### 4.4 Estado del equipo sincronizado con mantenimiento
- **Decisión**: Trigger `trg_mantenimiento_estado_equipo` actualiza `equipos.estado_id` cuando se crea/modifica un mantenimiento.
- **Motivo**: Un equipo en mantenimiento debe reflejar automáticamente ese estado, evitando actualizaciones manuales inconsistentes.

### 4.5 Códigos compuestos para equipos
- **Decisión**: `codigo = 'PC-LAB1-001'` como PK (no UUID).
- **Motivo**: Formato legible que identifica ubicación: `PC` (computadora) + `LAB1` (laboratorio) + `001` (número). Usado extensamente en el frontend.

### 4.6 Tablas académicas integradas
- **Decisión**: Agregar `materias`, `grupos`, `horarios`, `inscripciones`, `uso_laboratorio` aunque el frontend actual no las use.
- **Motivo**: El sistema es para la Carrera de Informática UMSA. Los laboratorios se usan para docencia. Sin estas tablas, no hay trazabilidad de quién usa los laboratorios ni para qué materia.

### 4.7 `uso_laboratorio` como tabla de registro
- **Decisión**: Tabla independiente que registra ingresos/salidas reales.
- **Motivo**: Diferencia entre el horario programado (teórico) y el uso real (práctico). Permite reportes de ocupación real.

### 4.8 Convención de nombres
- **snake_case** para tablas y columnas (PostgreSQL estándar).
- **Prefijo `P-`** para personas (P-ENC-001, P-PRE-001, P-DOC-001, P-EST-001).
- **Prefijo `u-`** para usuarios (u-admin, u-prev, u-corr).
- **Prefijo `PC-LABn-`** para equipos por laboratorio.
- **Prefijo `M-PREV-` / `M-CORR-`** para mantenimientos.
- **Prefijo `INC-`** para incidencias, **`AS-`** para asignaciones, **`RP-`** para reportes.

---

## 5. Integración con el Sistema

### 5.1 Correspondencia Frontend → Base de Datos

| Pantalla/Componente del Frontend | Tabla(s) en BD |
|----------------------------------|----------------|
| Dashboard (métricas) | `equipos`, `mantenimientos`, `incidencias`, `usuarios` |
| Laboratorios CRUD | `laboratorios`, `edificios` |
| Equipos CRUD | `equipos`, `laboratorios`, `estado_equipo` |
| Usuarios CRUD | `usuarios`, `personas`, `roles` |
| Mantenimiento Preventivo | `mantenimientos` (tipo=preventivo), `mantenimientos_detalle`, `checklists`, `insumos_usados` |
| Mantenimiento Correctivo | `mantenimientos` (tipo=correctivo), `mantenimientos_detalle`, `insumos_usados` |
| Incidencias | `incidencias`, `estado_incidencia` |
| Asignaciones | `asignaciones`, `usuarios`, `equipos` |
| Inventario | `inventario`, `categorias_inventario` |
| Insumos | `insumos` |
| Periféricos | `perifericos` |
| Logs | `logs` |
| Reportes de Pasante | `reportes_pasante`, `usuarios` |
| Perfil/Configuración | `usuarios`, `personas` |

### 5.2 Prisma Schema ↔ SQL

El archivo `backend/prisma/schema.prisma` existente puede actualizarse para reflejar este diseño. Los pasos serían:

1. Regenerar el schema de Prisma a partir de la BD (`prisma db pull`)
2. O crear manualmente los modelos que faltan:
   - `Edificio`, `Rol`, `CategoriaInventario`, `TipoMantenimiento`, `EstadoMantenimiento`, `EstadoEquipo`, `EstadoIncidencia`
   - `Persona` (separada de Usuario)
   - `Materia`, `Grupo`, `Horario`, `Inscripcion`, `UsoLaboratorio`
3. Agregar relaciones faltantes (ej: `perifericos → equipos`)
4. Agregar seed con datos reales de la UMSA

### 5.3 API REST Faltante (por implementar)

```
POST/GET    /api/mantenimientos
GET/PUT     /api/mantenimientos/:id
POST/GET    /api/incidencias
GET/PUT     /api/incidencias/:id
POST/GET    /api/asignaciones
GET/PUT     /api/asignaciones/:id
POST/GET    /api/inventario
GET/PUT     /api/inventario/:id
POST/GET    /api/insumos
GET/PUT     /api/insumos/:nombre
POST/GET    /api/perifericos
GET/PUT     /api/perifericos/:id
POST/GET    /api/logs
POST/GET    /api/reportes-pasante
GET/PUT     /api/reportes-pasante/:id
GET         /api/materias
GET         /api/horarios?laboratorio=:id
POST        /api/uso-laboratorio
```

### 5.4 Migración Recomendada

1. Ejecutar `database/sigmalab-umsa.sql` en PostgreSQL
2. Actualizar `backend/prisma/schema.prisma` para reflejar el nuevo schema
3. Ejecutar `prisma db pull` o escribir manualmente los modelos faltantes
4. Regenerar seed (`prisma/seed.ts`) usando los datos de `database/sigmalab-umsa.sql`
5. Implementar los endpoints REST faltantes (8+ recursos)
6. Eliminar `lib/auth.ts` y `sigmalab-data.ts` del frontend
7. Migrar vistas de `useStore()` a TanStack Query + API calls
8. Eliminar scripts de depuración en raíz

---

## Resumen de Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `database/sigmalab-umsa.sql` | Script SQL completo (25 tablas, 20+ FK, 15 índices, 3 triggers, 10 catálogos, 100+ inserts) |
| `database/README-DB.md` | Este documento — análisis completo + documentación del diseño |
