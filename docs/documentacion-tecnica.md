# Documentación Técnica — SIGMALAB

**Sistema de Gestión de Mantenimiento de Laboratorios**
*ITIC — Universidad Mayor de San Andrés (UMSA)*

---

## Índice

1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Base de Datos](#4-base-de-datos)
5. [API REST](#5-api-rest)
6. [Frontend](#6-frontend)
7. [Seguridad](#7-seguridad)
8. [Despliegue](#8-despliegue)
9. [Requerimientos Técnicos](#9-requerimientos-técnicos)

---

## 1. Descripción General

SIGMALAB es una plataforma web fullstack diseñada para la gestión integral del mantenimiento preventivo y correctivo de los equipos de cómputo de los laboratorios de ITIC — UMSA. El sistema permite a los diferentes roles (encargado, pasantes, docentes, estudiantes) reportar incidencias, gestionar mantenimientos, controlar inventario, y dar seguimiento a las tareas técnicas.

### 1.1 Objetivos

- Centralizar el registro de mantenimientos preventivos y correctivos.
- Permitir que cualquier miembro de la comunidad universitaria reporte incidencias.
- Asignar tareas a pasantes según su rol (preventivo/correctivo).
- Mantener un inventario actualizado de equipos, periféricos e insumos.
- Generar reportes exportables (PDF, Excel).
- Auditar todas las operaciones mediante logs.

### 1.2 Principios de Diseño

- **Separación de responsabilidades**: Frontend y backend independientes.
- **Arquitectura MVC**: Routes → Controllers → Models en backend.
- **ORM**: Prisma abstrae la complejidad de PostgreSQL.
- **Componentes reutilizables**: shadcn/ui + componentes personalizados.
- **Soft-delete**: Nunca se eliminan datos físicamente, solo se desactivan.

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                   │
│  React SPA · TanStack Router · TailwindCSS · Axios      │
└──────────────────┬──────────────────────────────────────┘
                   │  HTTP/JSON
                   │  JWT en Header: Authorization: Bearer <token>
                   ▼
┌─────────────────────────────────────────────────────────┐
│              VITE DEV SERVER (puerto 5173)               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Proxy /api → http://localhost:4000              │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │  /api/*
                   ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND EXPRESS (puerto 4000)               │
│                                                          │
│  ┌─────────┐   ┌────────────┐   ┌──────────────────┐   │
│  │ Routes  │──▶│Controllers │──▶│     Models       │   │
│  └─────────┘   └────────────┘   └────────┬─────────┘   │
│        │              │                   │              │
│  ┌─────┴─────┐  ┌─────┴─────┐     ┌──────┴──────┐      │
│  │ JWT Auth  │  │ Zod       │     │  Prisma ORM  │      │
│  │ Middleware │  │ Validation│     └──────┬──────┘      │
│  └───────────┘  └───────────┘            │              │
└───────────────────────────────────────────┼──────────────┘
                                            │  SQL
                                            ▼
                               ┌─────────────────────────┐
                               │     PostgreSQL 15+       │
                               │  22 tablas · 3FN        │
                               │  Índices · Triggers     │
                               └─────────────────────────┘
```

### 2.2 Flujo de una Petición

```
Request → Route → [Middleware: authenticate] → [Middleware: authorize(roles)]
          → [Middleware: validate(schema)] → Controller → Model
          → Prisma Query → PostgreSQL → Response (JSON)
```

### 2.3 Flujo de Autenticación

```
Login form → POST /api/auth/login → Controller verifica credenciales
  → bcrypt.compare(password, hash) → JWT.sign({ userId, role })
  → Response: { token, user: { id, nombres, paterno, role, ... } }
  → Frontend almacena token en localStorage → Redirige a dashboard
```

---

## 3. Stack Tecnológico

### 3.1 Backend

| Tecnología | Versión | Función |
|---|---|---|
| **Node.js** | 20 LTS | Entorno de ejecución JavaScript del lado del servidor |
| **Express** | ^4.21.2 | Framework web minimalista para construcción de APIs REST |
| **TypeScript** | ^5.8.3 | Superset de JavaScript con tipado estático |
| **Prisma Client** | ^6.7.0 | ORM seguro por tipos para Node.js y TypeScript |
| **Prisma CLI** | ^6.7.0 | Herramienta de línea de comandos para gestionar esquemas y migraciones |
| **tsx** | ^4.19.4 | Ejecutor de TypeScript con hot-reload para desarrollo |
| **bcryptjs** | ^2.4.3 | Librería de hash de contraseñas con sal (12 rondas) |
| **jsonwebtoken** | ^9.0.2 | Implementación de JWT (JSON Web Tokens) para autenticación |
| **zod** | ^3.24.2 | Librería de validación de esquemas basada en TypeScript |
| **cors** | ^2.8.5 | Middleware para habilitar CORS (Cross-Origin Resource Sharing) |
| **dotenv** | ^16.4.7 | Carga de variables de entorno desde archivo `.env` |

**Dependencias de desarrollo:**

| Tecnología | Versión | Función |
|---|---|---|
| `@types/bcryptjs` | ^2.4.6 | Tipados TypeScript para bcryptjs |
| `@types/cors` | ^2.8.17 | Tipados TypeScript para cors |
| `@types/express` | ^4.17.25 | Tipados TypeScript para Express |
| `@types/jsonwebtoken` | ^9.0.9 | Tipados TypeScript para jsonwebtoken |
| `@types/node` | ^22.16.5 | Tipados TypeScript para Node.js |

### 3.2 Frontend

| Tecnología | Versión | Función |
|---|---|---|
| **React** | ^19.2.0 | Librería declarativa para construir interfaces de usuario basadas en componentes |
| **React DOM** | ^19.2.0 | Renderizador de React para el DOM del navegador |
| **TypeScript** | ^5.8.3 | Tipado estático para JavaScript |
| **Vite** | ^7.3.1 | Build tool ultrarrápida con HMR (Hot Module Replacement) |
| **TanStack React Router** | ^1.168.0 | Enrutador SPA con soporte para carga perezosa y guardias |
| **TanStack React Query** | ^5.83.0 | Librería para gestión de estado del servidor (caching, sincronización) |
| **Axios** | ^1.16.1 | Cliente HTTP basado en promesas con interceptores |
| **TailwindCSS** | ^4.2.1 | Framework CSS utility-first para diseño rápido |
| **shadcn/ui** | — | Colección de componentes accesibles construidos sobre Radix UI |
| **Recharts** | 2.15.0 | Librería de gráficos para React basada en D3 |
| **jsPDF** | ^4.2.1 | Generación de PDF en el navegador |
| **jspdf-autotable** | ^5.0.7 | Plugin de jsPDF para tablas con auto-ajuste |
| **xlsx** | ^0.18.5 | Lectura/escritura de archivos Excel |
| **lucide-react** | ^0.575.0 | Conjunto de iconos como componentes React |
| **sonner** | ^2.0.7 | Sistema de notificaciones toast |
| **date-fns** | ^4.1.0 | Utilidades de manipulación de fechas |
| **zod** | ^3.24.2 | Validación de formularios y schemas |
| **React Hook Form** | ^7.71.2 | Manejo de formularios con rendimiento optimizado |
| **@hookform/resolvers** | ^5.2.2 | Resolvedores de validación para React Hook Form |
| **class-variance-authority** | ^0.7.1 | Manejo de variantes de clases CSS |
| **clsx** | ^2.1.1 | Construcción condicional de strings de clases |
| **tailwind-merge** | ^3.5.0 | Fusión inteligente de clases Tailwind |
| **@radix-ui/*** | varios | Primitivas de UI accesibles (Diálogo, Select, Tabs, Dropdown, etc.) |
| **Cloudflare Vite Plugin** | ^1.25.5 | Adaptador para deploy en Cloudflare Pages |
| **tw-animate-css** | ^1.3.4 | Animaciones CSS para Tailwind |

### 3.3 Infraestructura

| Componente | Tecnología | Propósito |
|---|---|---|
| **Base de datos** | PostgreSQL 15+ | Almacenamiento relacional |
| **ORM** | Prisma 6.x | Abstracción de base de datos |
| **Autenticación** | JWT + bcrypt | Seguridad de acceso |
| **Proxy dev** | Vite server | Proxy de `/api` al backend en desarrollo |

---

## 4. Base de Datos

### 4.1 Diagrama Entidad-Relación (Resumen)

```
Edificio 1──N Laboratorio 1──N Equipo
                             1──N Periferico
                             1──N Mantenimiento
                             1──N Incidencia
                             1──N Asignacion
                             1──N InventarioItem

Persona 1──1 Usuario N──1 Rol

Usuario 1──N Mantenimiento (técnico)
        1──N Asignacion (técnico)
        1──N Incidencia (reportante)
        1──N Log (auditoría)
        1──N ReportePasante (pasante / atendido_por)

Mantenimiento 1──1 MantenimientoDetalle 1──N Checklist
                                         1──N InsumoUsado N──1 Insumo

Laboratorio 1──N ReportePasante
```

### 4.2 Modelo de Datos Completo

#### 4.2.1 Catálogos Base

**Edificio** (`edificios`)
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `VarChar(10)` | PK | Código del edificio |
| `nombre` | `VarChar(100)` | NOT NULL | Nombre del edificio |
| `ubicacion` | `VarChar(200)` | NULL | Dirección o referencia |
| `activo` | `Boolean` | DEFAULT true | Soft-delete |

**Rol** (`roles`)
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `VarChar(20)` | PK | Identificador del rol (encargado, preventivo, etc.) |
| `nombre` | `VarChar(50)` | UNIQUE, NOT NULL | Nombre para mostrar |
| `descripcion` | `VarChar(200)` | NULL | Descripción del rol |
| `nivelAcceso` | `SmallInt` | NOT NULL | Nivel numérico (10-100) |

**Estados:**
- `EstadoEquipo` (`estado_equipo`): funcionando, en_mantenimiento, pendiente, en_espera_repuesto, de_baja
- `EstadoMantenimiento` (`estado_mantenimiento`): programado, en_proceso, completado, resuelto, pendiente
- `EstadoIncidencia` (`estado_incidencia`): nuevo, en_proceso, resuelto, cerrado, rechazado
- `TipoMantenimiento` (`tipo_mantenimiento`): preventivo, correctivo
- `CategoriaInventario` (`categorias_inventario`): categorías de items de inventario

#### 4.2.2 Entidades Principales

**Persona** (`personas`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(20)` | PK |
| `nombres` | `VarChar(100)` | NOT NULL |
| `paterno` | `VarChar(50)` | NOT NULL |
| `materno` | `VarChar(50)` | NULL |
| `ci` | `VarChar(20)` | UNIQUE, NULL |
| `registroUniversitario` | `VarChar(20)` | UNIQUE, NULL |
| `email` | `VarChar(150)` | UNIQUE, NULL |
| `celular` | `VarChar(20)` | NULL |
| `fotoUrl` | `Text` | NULL |
| `activo` | `Boolean` | DEFAULT true |
| `createdAt` | `DateTime` | DEFAULT now() |
| `updatedAt` | `DateTime` | @updatedAt |

**Usuario** (`usuarios`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(20)` | PK |
| `personaId` | `VarChar(20)` | UNIQUE, FK → Persona |
| `roleId` | `VarChar(20)` | FK → Rol |
| `passwordHash` | `VarChar(255)` | NOT NULL |
| `ultimoAcceso` | `DateTime` | NULL |
| `activo` | `Boolean` | DEFAULT true |
| `createdAt` | `DateTime` | DEFAULT now() |
| `updatedAt` | `DateTime` | @updatedAt |

**Laboratorio** (`laboratorios`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(20)` | PK |
| `nombre` | `VarChar(100)` | NOT NULL |
| `edificioId` | `VarChar(10)` | FK → Edificio |
| `piso` | `SmallInt` | NOT NULL |
| `capacidadEquipos` | `Int` | NOT NULL |
| `capacidadPersonas` | `Int` | NOT NULL |
| `encargadoId` | `VarChar(20)` | NULL, FK → Persona |
| `activo` | `Boolean` | DEFAULT true |
| `createdAt` | `DateTime` | DEFAULT now() |
| `updatedAt` | `DateTime` | @updatedAt |

**Equipo** (`equipos`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `codigo` | `VarChar(30)` | PK |
| `nombre` | `VarChar(150)` | NOT NULL |
| `laboratorioId` | `VarChar(20)` | FK → Laboratorio |
| `fila` | `VarChar(5)` | NULL |
| `puesto` | `VarChar(5)` | NULL |
| `sistemaOperativo` | `VarChar(100)` | NULL |
| `marca` | `VarChar(50)` | NULL |
| `modelo` | `VarChar(100)` | NULL |
| `numeroSerie` | `VarChar(100)` | UNIQUE, NULL |
| `estadoId` | `VarChar(30)` | FK → EstadoEquipo |
| `fechaCompra` | `Date` | NULL |
| `activo` | `Boolean` | DEFAULT true |
| `createdAt` | `DateTime` | DEFAULT now() |
| `updatedAt` | `DateTime` | @updatedAt |

**UK:** `(laboratorioId, fila, puesto)` — único por ubicación

**Periferico** (`perifericos`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(30)` | PK |
| `tipo` | `VarChar(50)` | NOT NULL |
| `marca` | `VarChar(50)` | NULL |
| `modelo` | `VarChar(100)` | NULL |
| `numeroSerie` | `VarChar(100)` | NULL |
| `laboratorioId` | `VarChar(20)` | NULL, FK → Laboratorio |
| `equipoCodigo` | `VarChar(30)` | NULL, FK → Equipo |
| `estado` | `VarChar(30)` | DEFAULT 'Funcionando' |
| `activo` | `Boolean` | DEFAULT true |
| `createdAt` | `DateTime` | DEFAULT now() |

**Insumo** (`insumos`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `nombre` | `VarChar(100)` | PK |
| `unidadMedida` | `VarChar(30)` | NOT NULL |
| `stock` | `Int` | DEFAULT 0 |
| `stockMinimo` | `Int` | DEFAULT 0 |
| `activo` | `Boolean` | DEFAULT true |
| `updatedAt` | `DateTime` | @updatedAt |

**InventarioItem** (`inventario`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(30)` | PK |
| `categoriaId` | `VarChar(30)` | FK → CategoriaInventario |
| `codigoItic` | `VarChar(50)` | UNIQUE, NOT NULL |
| `codigoFacultativo` | `VarChar(50)` | NULL |
| `codigoUmsa` | `VarChar(50)` | NULL |
| `numeroSerie` | `VarChar(100)` | NULL |
| `marca` | `VarChar(50)` | NULL |
| `modelo` | `VarChar(100)` | NULL |
| `estado` | `VarChar(30)` | DEFAULT 'En almacen' |
| `fechaIngreso` | `Date` | NOT NULL |
| `fechaAsignacion` | `Date` | NULL |
| `laboratorioId` | `VarChar(20)` | NULL, FK → Laboratorio |
| `equipoCodigo` | `VarChar(30)` | NULL, FK → Equipo |
| `observaciones` | `Text` | NULL |
| `activo` | `Boolean` | DEFAULT true |

#### 4.2.3 Entidades Transaccionales

**Mantenimiento** (`mantenimientos`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(30)` | PK |
| `tipoId` | `VarChar(20)` | FK → TipoMantenimiento |
| `equipoCodigo` | `VarChar(30)` | FK → Equipo |
| `tecnicoId` | `VarChar(20)` | FK → Usuario |
| `laboratorioId` | `VarChar(20)` | NULL, FK → Laboratorio |
| `fecha` | `Date` | NOT NULL |
| `horaInicio` | `Time` | NULL |
| `horaFin` | `Time` | NULL |
| `estadoId` | `VarChar(20)` | FK → EstadoMantenimiento |
| `activo` | `Boolean` | DEFAULT true |
| `createdAt` | `DateTime` | DEFAULT now() |
| `updatedAt` | `DateTime` | @updatedAt |

**MantenimientoDetalle** (`mantenimientos_detalle`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(30)` | PK |
| `mantenimientoId` | `VarChar(30)` | UNIQUE, FK → Mantenimiento |
| `descripcion` | `Text` | NULL |
| `diagnostico` | `Text` | NULL |
| `accionRealizada` | `Text` | NULL |
| `resolucion` | `Text` | NULL |
| `tipoIncidencia` | `VarChar(50)` | NULL |
| `estadoFinal` | `VarChar(50)` | NULL |
| `observaciones` | `Text` | NULL |
| `recomendaciones` | `Text` | NULL |
| `activo` | `Boolean` | DEFAULT true |

**Checklist** (`checklists`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(30)` | PK |
| `detalleId` | `VarChar(30)` | FK → MantenimientoDetalle |
| `categoria` | `VarChar(30)` | NOT NULL (hardware/software/pruebas) |
| `item` | `VarChar(200)` | NOT NULL |
| `estado` | `VarChar(20)` | NOT NULL (OK/Regular/Mal) |
| `observacion` | `Text` | NULL |
| `activo` | `Boolean` | DEFAULT true |

**InsumoUsado** (`insumos_usados`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(30)` | PK |
| `detalleId` | `VarChar(30)` | FK → MantenimientoDetalle |
| `insumoNombre` | `VarChar(100)` | FK → Insumo |
| `cantidad` | `VarChar(50)` | NOT NULL |
| `activo` | `Boolean` | DEFAULT true |

**Incidencia** (`incidencias`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(30)` | PK |
| `equipoCodigo` | `VarChar(30)` | NULL, FK → Equipo |
| `laboratorioId` | `VarChar(20)` | NULL, FK → Laboratorio |
| `usuarioId` | `VarChar(20)` | NULL, FK → Usuario |
| `personaId` | `VarChar(20)` | NULL, FK → Persona |
| `problema` | `Text` | NOT NULL |
| `requiereSeguimiento` | `Boolean` | DEFAULT false |
| `estadoId` | `VarChar(20)` | FK → EstadoIncidencia |
| `fecha` | `DateTime` | DEFAULT now() |
| `resueltaEn` | `DateTime` | NULL |
| `activo` | `Boolean` | DEFAULT true |
| `createdAt` | `DateTime` | DEFAULT now() |
| `updatedAt` | `DateTime` | @updatedAt |

**Asignacion** (`asignaciones`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(30)` | PK |
| `equipoCodigo` | `VarChar(30)` | FK → Equipo |
| `laboratorioId` | `VarChar(20)` | NULL, FK → Laboratorio |
| `tecnicoId` | `VarChar(20)` | FK → Usuario |
| `problema` | `Text` | NOT NULL |
| `prioridad` | `VarChar(10)` | DEFAULT 'Media' |
| `fecha` | `Date` | DEFAULT CURRENT_DATE |
| `estado` | `VarChar(20)` | DEFAULT 'Pendiente' |
| `activo` | `Boolean` | DEFAULT true |

**ReportePasante** (`reportes_pasante`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(30)` | PK |
| `pasanteId` | `VarChar(20)` | FK → Usuario |
| `rolReporte` | `VarChar(20)` | NULL |
| `titulo` | `VarChar(200)` | NOT NULL |
| `descripcion` | `Text` | NOT NULL |
| `laboratorioId` | `VarChar(20)` | NULL, FK → Laboratorio |
| `ubicacion` | `VarChar(200)` | NULL |
| `categoria` | `VarChar(50)` | NULL |
| `prioridad` | `VarChar(10)` | DEFAULT 'Media' |
| `fecha` | `DateTime` | DEFAULT now() |
| `estado` | `VarChar(20)` | DEFAULT 'Nuevo' |
| `resolucionDetalle` | `Text` | NULL |
| `atendidoPor` | `VarChar(20)` | NULL, FK → Usuario |
| `activo` | `Boolean` | DEFAULT true |

**Log** (`logs`)
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `VarChar(30)` | PK |
| `timestamp` | `DateTime` | DEFAULT now() |
| `usuarioId` | `VarChar(20)` | NULL, FK → Usuario |
| `accion` | `VarChar(100)` | NOT NULL |
| `detalle` | `Text` | NULL |
| `modulo` | `VarChar(50)` | NULL |
| `entidad` | `VarChar(50)` | NULL |
| `equipoCodigo` | `VarChar(30)` | NULL |
| `tipoAccion` | `VarChar(20)` | NULL |
| `estado` | `VarChar(20)` | DEFAULT 'Exito' |
| `ipOrigen` | `VarChar(45)` | NULL |

### 4.3 Índices

```sql
-- Usuarios
CREATE INDEX idx_usuarios_role ON usuarios(roleId);

-- Laboratorios
CREATE INDEX idx_laboratorios_edificio ON laboratorios(edificioId);
CREATE INDEX idx_laboratorios_encargado ON laboratorios(encargadoId);

-- Equipos
CREATE INDEX idx_equipos_estado ON equipos(estadoId);
CREATE INDEX idx_equipos_lab ON equipos(laboratorioId);

-- Mantenimientos
CREATE INDEX idx_mantenimientos_equipo ON mantenimientos(equipoCodigo);
CREATE INDEX idx_mantenimientos_estado ON mantenimientos(estadoId);
CREATE INDEX idx_mantenimientos_fecha ON mantenimientos(fecha);
CREATE INDEX idx_mantenimientos_tecnico ON mantenimientos(tecnicoId);

-- Incidencias
CREATE INDEX idx_incidencias_equipo ON incidencias(equipoCodigo);
CREATE INDEX idx_incidencias_estado ON incidencias(estadoId);
CREATE INDEX idx_incidencias_fecha ON incidencias(fecha);

-- Asignaciones
CREATE INDEX idx_asignaciones_estado ON asignaciones(estado);
CREATE INDEX idx_asignaciones_tecnico ON asignaciones(tecnicoId);

-- Reportes
CREATE INDEX idx_reportes_estado ON reportes_pasante(estado);
CREATE INDEX idx_reportes_pasante ON reportes_pasante(pasanteId);

-- Logs
CREATE INDEX idx_logs_modulo ON logs(modulo);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_usuario ON logs(usuarioId);

-- Periféricos
CREATE INDEX idx_perifericos_equipo ON perifericos(equipoCodigo);
CREATE INDEX idx_perifericos_lab ON perifericos(laboratorioId);

-- Inventario
CREATE INDEX idx_inventario_categoria ON inventario(categoriaId);
CREATE INDEX idx_inventario_lab ON inventario(laboratorioId);

-- Checklists
CREATE INDEX idx_checklists_detalle ON checklists(detalleId);

-- Insumos usados
CREATE INDEX idx_insumos_usados_detalle ON insumos_usados(detalleId);
```

---

## 5. API REST

### 5.1 Estructura General

- **Base URL**: `http://localhost:4000/api` (desarrollo) o `https://dominio/api` (producción)
- **Formato**: JSON
- **Autenticación**: JWT via `Authorization: Bearer <token>`
- **Errores**: `{ error: "mensaje" }` con código HTTP apropiado

### 5.2 Endpoints

#### Health
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/health` | No | Estado del servidor + versión |

#### Autenticación (`/api/auth`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `POST` | `/auth/login` | No | Todos | Iniciar sesión |
| `POST` | `/auth/register` | JWT | encargado | Crear usuario |
| `GET` | `/auth/profile` | JWT | Todos | Perfil propio |
| `PATCH` | `/auth/profile` | JWT | Todos | Actualizar perfil propio |
| `GET` | `/auth/` | JWT | encargado | Listar usuarios |
| `PATCH` | `/auth/:id` | JWT | encargado | Actualizar usuario |
| `DELETE` | `/auth/:id` | JWT | encargado | Desactivar usuario |

#### Equipos (`/api/equipos`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `GET` | `/equipos` | JWT | Todos | Listar equipos |
| `GET` | `/equipos/estadisticas` | JWT | Todos | Estadísticas |
| `GET` | `/equipos/:codigo` | JWT | Todos | Detalle de equipo |
| `POST` | `/equipos` | JWT | encargado | Crear equipo |
| `PATCH` | `/equipos/:codigo` | JWT | encargado | Actualizar equipo |
| `DELETE` | `/equipos/:codigo` | JWT | encargado | Desactivar equipo |

#### Laboratorios (`/api/laboratorios`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `GET` | `/laboratorios` | JWT | Todos | Listar laboratorios |
| `GET` | `/laboratorios/:id` | JWT | Todos | Detalle con equipos |
| `POST` | `/laboratorios` | JWT | encargado | Crear laboratorio |
| `PATCH` | `/laboratorios/:id` | JWT | encargado | Actualizar |
| `DELETE` | `/laboratorios/:id` | JWT | encargado | Desactivar |

#### Incidencias (`/api/incidencias`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `GET` | `/incidencias` | JWT | Todos | Listar (filtrable) |
| `GET` | `/incidencias/stats` | JWT | Todos | Estadísticas |
| `GET` | `/incidencias/:id` | JWT | Todos | Detalle |
| `POST` | `/incidencias` | JWT | Todos | Crear |
| `PATCH` | `/incidencias/:id` | JWT | encargado/preventivo/correctivo | Actualizar |

#### Mantenimientos (`/api/mantenimientos`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `GET` | `/mantenimientos` | JWT | Todos | Listar (filtrable) |
| `GET` | `/mantenimientos/stats` | JWT | Todos | Estadísticas |
| `GET` | `/mantenimientos/:id` | JWT | Todos | Detalle |
| `POST` | `/mantenimientos` | JWT | encargado/preventivo/correctivo | Crear |
| `PATCH` | `/mantenimientos/:id` | JWT | encargado/preventivo/correctivo | Actualizar |
| `DELETE` | `/mantenimientos/:id` | JWT | encargado | Desactivar |
| `POST` | `/mantenimientos/detalle` | JWT | encargado/preventivo/correctivo | Guardar detalle + checklists + insumos |

#### Insumos (`/api/insumos`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `GET` | `/insumos` | JWT | Todos | Listar |
| `GET` | `/insumos/bajo-stock` | JWT | Todos | Stock bajo |
| `GET` | `/insumos/:nombre` | JWT | Todos | Detalle |
| `POST` | `/insumos` | JWT | encargado | Crear |
| `PATCH` | `/insumos/:nombre` | JWT | encargado | Actualizar |
| `DELETE` | `/insumos/:nombre` | JWT | encargado | Desactivar |

#### Inventario (`/api/inventario`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `GET` | `/inventario` | JWT | Todos | Listar (filtrable) |
| `GET` | `/inventario/stats` | JWT | Todos | Estadísticas |
| `GET` | `/inventario/:id` | JWT | Todos | Detalle |
| `POST` | `/inventario` | JWT | encargado | Crear |
| `PATCH` | `/inventario/:id` | JWT | encargado | Actualizar |
| `DELETE` | `/inventario/:id` | JWT | encargado | Desactivar |

#### Periféricos (`/api/perifericos`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `GET` | `/perifericos` | JWT | Todos | Listar (filtrable) |
| `GET` | `/perifericos/:id` | JWT | Todos | Detalle |
| `POST` | `/perifericos` | JWT | encargado | Crear |
| `PATCH` | `/perifericos/:id` | JWT | encargado | Actualizar |
| `DELETE` | `/perifericos/:id` | JWT | encargado | Desactivar |

#### Asignaciones (`/api/asignaciones`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `GET` | `/asignaciones` | JWT | Todos | Listar (filtrable) |
| `GET` | `/asignaciones/:id` | JWT | Todos | Detalle |
| `POST` | `/asignaciones` | JWT | encargado | Crear |
| `PATCH` | `/asignaciones/:id` | JWT | encargado/correctivo | Actualizar |
| `DELETE` | `/asignaciones/:id` | JWT | encargado | Desactivar |

#### Reportes (`/api/reportes`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `GET` | `/reportes` | JWT | Todos | Listar (filtrable) |
| `GET` | `/reportes/:id` | JWT | Todos | Detalle |
| `POST` | `/reportes` | JWT | preventivo/correctivo/docente/estudiante/encargado | Crear |
| `PATCH` | `/reportes/:id` | JWT | encargado | Actualizar |
| `DELETE` | `/reportes/:id` | JWT | encargado | Desactivar |

#### Logs (`/api/logs`)
| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| `GET` | `/logs` | JWT | encargado | Listar logs |
| `POST` | `/logs` | JWT | Todos | Crear log |

### 5.3 Formato de Respuestas

**Éxito:**
```json
// Lista
[
  { "id": "LAB1", "nombre": "Laboratorio 1", ... },
  { "id": "LAB2", "nombre": "Laboratorio 2", ... }
]

// Objeto individual
{ "id": "LAB1", "nombre": "Laboratorio 1", "piso": 2, ... }

// Mensaje
{ "message": "Equipo desactivado correctamente" }
```

**Error:**
```json
{ "error": "Credenciales inválidas" }

// Validación (Zod)
{
  "error": "Error de validación",
  "details": [
    { "field": "email", "message": "Email inválido" }
  ]
}
```

### 5.4 Códigos de Estado HTTP

| Código | Significado |
|---|---|
| 200 | OK |
| 201 | Creado |
| 400 | Bad Request (error de validación) |
| 401 | No autenticado |
| 403 | No autorizado (rol sin permiso) |
| 404 | No encontrado |
| 409 | Conflicto (duplicado) |
| 500 | Error interno del servidor |

---

## 6. Frontend

### 6.1 Estructura de Archivos

```
frontend/src/
├── components/
│   ├── sigmalab/           # Componentes de negocio
│   │   ├── Sidebar.tsx     # Barra de navegación lateral
│   │   ├── TopBar.tsx      # Barra superior
│   │   ├── Breadcrumb.tsx  # Migas de pan
│   │   ├── MetricCard.tsx  # Tarjeta de métrica
│   │   ├── StatusBadge.tsx # Badge de estado
│   │   ├── Modal.tsx       # Modal reutilizable
│   │   ├── Panel.tsx       # Panel contenedor
│   │   ├── ChecklistTable.tsx
│   │   ├── EquipmentDetailModal.tsx
│   │   ├── MantDetalleModal.tsx
│   │   └── sidebar-utils.ts
│   └── ui/                 # shadcn/ui components (68 archivos)
│       ├── button.tsx, dialog.tsx, select.tsx, table.tsx, ...
│       └── ...
├── lib/
│   ├── auth.ts             # Gestión de autenticación
│   ├── store.ts            # Store reactivo en memoria
│   ├── use-app.ts          # Estado global de la app
│   ├── utils.ts            # Utilidades (cn)
│   ├── exporters.ts        # Exportación PDF/Excel
│   └── sigmalab-data.ts    # Datos de semilla
├── services/
│   ├── apiClient.ts        # Cliente Axios con interceptores
│   ├── authService.ts      # Servicio de autenticación
│   ├── equipoService.ts    # Servicio de equipos
│   └── laboratorioService.ts
├── views/
│   ├── encargado/          # 12 vistas
│   ├── preventivo/         # 7 vistas
│   ├── correctivo/         # 6 vistas
│   ├── incidencias/        # 3 vistas
│   ├── invitado/           # 1 vista
│   └── shared/             # 1 vista (Profile)
├── styles.css              # Estilos globales
├── router.tsx              # Enrutador TanStack
└── routeTree.gen.ts        # Árbol de rutas generado
```

### 6.2 Gestión de Estado

El frontend utiliza un **store reactivo en memoria** (`lib/store.ts`) implementado con el patrón Observer:

```
store = { state, listeners, notify() }
  ├── state: contenedor de datos
  ├── listeners: Set<() => void>
  ├── notify(): llama a todos los listeners
  └── métodos CRUD: addXxx, updateXxx, deleteXxx

useStore(selector): hook que
  ├── subscribe al store (addListener)
  ├── ejecuta selector(state) → return valor
  └── unsubscribe al desmontar
```

**Inicialización desde API:**
```
initFromApi() → Promise.allSettled([
  GET /api/laboratorios,
  GET /api/equipos,
  GET /api/mantenimientos,
  GET /api/incidencias,
  GET /api/insumos,
  GET /api/auth (usuarios),
  GET /api/perifericos,
  GET /api/inventario,
  GET /api/asignaciones,
  GET /api/reportes,
  GET /api/logs
]) → state = { ...data }
```

### 6.3 Vistas por Rol

| Rol | Vistas Disponibles |
|---|---|
| **Encargado** (12) | Dashboard, Laboratorios, Equipos, Periféricos, Mant. Preventivos, Mant. Correctivos, Bandeja Incidencias, Insumos, Inventario, Usuarios, Reportes, Logs |
| **Preventivo** (7) | Dashboard, Nuevo Mantenimiento, Mis Mantenimientos, Bandeja Incidencias, Equipos (lectura), Insumos Disponibles, Reportes al Encargado |
| **Correctivo** (6) | Dashboard, Nuevo Correctivo, Asignados, Bandeja Incidencias, Mis Correctivos, Equipos (lectura) |
| **Docente** (2) | Dashboard, Crear Incidencia, Mis Incidencias |
| **Estudiante** (2) | Dashboard, Crear Incidencia, Mis Incidencias |
| **Invitado** (7) | Dashboard, Equipos, Laboratorios, Periféricos, Insumos, Reportes, Historial |
| **Todos** | Perfil |

---

## 7. Seguridad

### 7.1 Autenticación (JWT)

**Login:**
```
POST /api/auth/login
Body: { identifier: "email@umsa.bo" | "20250001", password: "123456" }
Response: { token: "eyJhbGci...", user: { id, nombres, role, ... } }
```

**Verificación:**
```
Authorization: Bearer eyJhbGci...
```
El middleware `authenticate`:
1. Extrae el token del header
2. Verifica firma con `JWT_SECRET`
3. Decodifica payload: `{ userId, role, iat, exp }`
4. Adjunta `req.user` al request o retorna 401

**Autorización:**
```
router.delete("/:id", authenticate, authorize("encargado"), controller.delete)
```
El middleware `authorize` verifica que `req.user.role` esté en la lista de roles permitidos.

### 7.2 Hash de Contraseñas

```typescript
// Registro
const salt = bcrypt.genSaltSync(12);
const passwordHash = bcrypt.hashSync(password, salt);

// Login
const valido = bcrypt.compareSync(password, user.passwordHash); // boolean
```

### 7.3 Validación con Zod

```typescript
// Definición del schema
const createEquipoSchema = z.object({
  codigo: z.string().min(1).max(30),
  nombre: z.string().min(1).max(150),
  laboratorioId: z.string().min(1).max(20),
  estado: z.string().min(1).max(30),
});

// Middleware de validación
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return res.status(400).json({
    error: "Error de validación",
    details: result.error.issues,
  });
  req[source] = result.data;
  next();
};
```

### 7.4 Soft-Delete

Ninguna entidad se elimina físicamente de la base de datos. En su lugar:

```typescript
// Modelo
async deleteEquipo(codigo: string) {
  return await prisma.equipo.update({
    where: { codigo },
    data: { activo: false },
  });
}

// Consultas (findAll) siempre filtran por activo
async findAllEquipos() {
  return await prisma.equipo.findMany({ where: { activo: true } });
}
```

### 7.5 CORS

```typescript
const allowedOrigins = env.CORS_ORIGIN.split(",").map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*"))
      return cb(null, true);
    return cb(null, true); // permitir todo en desarrollo
  },
  credentials: true,
}));
```

---

## 8. Despliegue

### 8.1 Desarrollo Local

```bash
# Requisitos: Node.js 20+, PostgreSQL 15+, npm

# 1. Configurar base de datos
psql -U postgres -c "CREATE DATABASE sigmalabv3;"
psql -U postgres -d sigmalabv3 < database/sigmalab-umsa.sql

# 2. Backend
cd backend
npm install
cp .env.example .env  # configurar DATABASE_URL y JWT_SECRET
npx prisma generate
npm run dev            # http://localhost:4000

# 3. Frontend
cd frontend
npm install
npm run dev            # http://localhost:5173
```

### 8.2 Red Local

```bash
# Backend ya escucha en 0.0.0.0:4000
cd backend && npm run dev

# Frontend con flag --host
cd frontend && npm run dev:network
# o
cd frontend && npx vite dev --host
```

### 8.3 Acceso Remoto (ngrok)

```bash
# Un solo túnel (Vite proxy maneja /api)
ngrok http 5173
# Compartir URL: https://xxxx.ngrok-free.app
```

### 8.4 Producción

**Opción gratuita recomendada:**

| Componente | Servicio | Detalle |
|---|---|---|
| Frontend SSR | Cloudflare Pages | Build: `npm run build`, output: `dist/` |
| Backend API | Railway o Render | Start: `npm run start`, puerto: 4000 |
| PostgreSQL | Neon o Supabase | Plan gratuito con 0.5GB |

**Variables de entorno en producción:**

Backend:
```
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/sigmalabv3
JWT_SECRET=<secret-fuerte>
NODE_ENV=production
CORS_ORIGIN=https://frontend.pages.dev
```

Frontend:
```
VITE_API_URL=https://backend.railway.app/api
```

---

## 9. Requerimientos Técnicos

### 9.1 Hardware

| Componente | Mínimo | Recomendado |
|---|---|---|
| Procesador | 2 cores, 2.0 GHz | 4 cores, 2.5 GHz |
| RAM | 4 GB | 8 GB |
| Disco | 1 GB libre | 5 GB SSD |
| Red | 10 Mbps | 50 Mbps |

### 9.2 Software

| Componente | Versión |
|---|---|
| Node.js | 20.x LTS |
| npm | 10.x |
| PostgreSQL | 15.x |
| Navegador | Chrome 120+, Firefox 120+, Edge 120+ |

### 9.3 Puertos

| Puerto | Servicio | Uso |
|---|---|---|
| 4000 | Backend API | Configurable via PORT |
| 5173 | Vite Dev Server | Frontend en desarrollo |
| 5432 | PostgreSQL | Base de datos |

### 9.4 Dependencias del Sistema

- Git (control de versiones)
- Node.js 20+ (entorno de ejecución)
- PostgreSQL 15+ (base de datos)
- ngrok (opcional, para túneles remotos)
