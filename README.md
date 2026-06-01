# SIGMALAB — Sistema de Gestión de Mantenimiento de Laboratorios

**SIGMALAB** es una plataforma web fullstack para la gestión integral del mantenimiento preventivo y correctivo de los equipos de los laboratorios de **ITIC — Universidad Mayor de San Andrés (UMSA)**.

---

## Arquitectura

El sistema sigue una **arquitectura de 3 capas** con **patrón MVC** en el backend:

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│              Capa de Presentación                   │
│  Components → Pages → Services → API (Axios)        │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP / JSON
                       ▼
┌─────────────────────────────────────────────────────┐
│                     BACKEND (Express)                 │
│              Capa de Lógica de Negocio               │
│  Routes → Controllers → Models → Prisma ORM         │
└──────────────────────┬──────────────────────────────┘
                       │  SQL
                       ▼
┌─────────────────────────────────────────────────────┐
│                  BASE DE DATOS                       │
│              Capa de Datos                          │
│                    PostgreSQL                        │
└─────────────────────────────────────────────────────┘
```

### Flujo de una petición

```
Request → Route → Controller → Model → Prisma → DB → Response (JSON)
```

---

## Tecnologías

### Frontend
| Tecnología       | Versión | Propósito                     |
|------------------|---------|-------------------------------|
| React            | 19      | UI declarativa                |
| TanStack Router  | 1.x     | Enrutamiento SPA              |
| TanStack Query   | 5.x     | Estado servidor               |
| Axios            | -       | Cliente HTTP                  |
| TailwindCSS      | 4       | Estilos utilitarios           |
| Recharts         | 2.x     | Gráficos                      |
| jsPDF / xlsx     | -       | Exportación PDF / Excel       |
| Zod              | 3.x     | Validación                    |
| shadcn/ui        | -       | Componentes base              |

### Backend
| Tecnología       | Versión | Propósito                     |
|------------------|---------|-------------------------------|
| Node.js          | 20 LTS  | Entorno de ejecución          |
| Express          | 4.x     | Framework HTTP                |
| Prisma           | 6.x     | ORM                           |
| PostgreSQL       | -       | Base de datos relacional      |
| JWT              | -       | Autenticación                 |
| bcryptjs         | -       | Hash de contraseñas           |
| Zod              | 3.x     | Validación de esquemas        |
| TypeScript       | 5.x     | Tipado estático               |

---

## Estructura del Proyecto

```
/
├── backend/                     # API REST (Express + Prisma)
│   ├── config/
│   │   ├── env.ts              # Variables de entorno
│   │   └── database.ts         # Instancia Prisma Client
│   ├── controllers/
│   │   ├── authController.ts   # Login, registro, perfil
│   │   ├── equipoController.ts # CRUD equipos
│   │   └── ...
│   ├── middlewares/
│   │   ├── auth.ts             # JWT + roles
│   │   ├── validate.ts         # Validación con Zod
│   │   └── errorHandler.ts     # Manejo centralizado de errores
│   ├── models/
│   ├── routes/
│   │   └── index.ts            # Agrupador de rutas
│   ├── schemas/                # Esquemas Zod
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos de datos
│   │   └── seed.ts             # Datos de prueba
│   ├── app.ts                  # Configuración Express
│   ├── server.ts               # Punto de entrada
│   └── package.json
│
├── frontend/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   └── sigmalab/       # Componentes de negocio
│   │   ├── lib/
│   │   ├── routes/             # TanStack Router
│   │   ├── services/           # Capa de API (Axios)
│   │   └── views/              # Páginas por rol
│   └── package.json
│
├── database/                    # Scripts SQL de la BD
│   ├── sigmalab-umsa.sql       # Script completo (estructura + datos)
│   ├── sigmalab-mas-datos.sql  # Datos adicionales
│   ├── setup.bat               # Script de instalación Windows
│   └── setup.sh                # Script de instalación Linux/Mac
│
├── .gitignore
└── README.md
```

---

## Instalación

### Prerrequisitos
- Node.js 20 LTS
- PostgreSQL 15+
- npm

### 1. Clonar el repositorio

```bash
git clone https://github.com/JhonnnyTzy/sigmalab2.git
cd sigmalab2
```

### 2. Base de datos

Opción A — Script SQL (recomendado):
```bash
# Windows
.\database\setup.bat

# Linux/Mac
chmod +x database/setup.sh
./database/setup.sh
```

Opción B — Manual:
```bash
psql -U postgres -c "CREATE DATABASE sigmalabv3;"
psql -U postgres -d sigmalabv3 < database/sigmalab-umsa.sql
psql -U postgres -d sigmalabv3 < database/sigmalab-mas-datos.sql
```

### 3. Backend

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

> El backend inicia en `http://localhost:4000`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

> El frontend inicia en `http://localhost:5173`.

---

## Variables de Entorno

### Backend (`backend/.env`)

| Variable         | Descripción                     | Default                                                      |
|------------------|---------------------------------|--------------------------------------------------------------|
| `PORT`           | Puerto del servidor             | `4000`                                                       |
| `DATABASE_URL`   | Conexión PostgreSQL             | `postgresql://postgres:1234@localhost:5432/sigmalabv3`       |
| `JWT_SECRET`     | Secreto para firmar JWT         | `sigm4l4b-jwt-s3cr3t-k3y-2026`                               |
| `JWT_EXPIRES_IN` | Expiración del token            | `8h`                                                         |
| `NODE_ENV`       | Entorno                         | `development`                                                |
| `CORS_ORIGIN`    | Orígenes permitidos para CORS   | `http://localhost:5173`                                      |

### Frontend (`frontend/.env`)

| Variable         | Descripción                     | Default                          |
|------------------|---------------------------------|----------------------------------|
| `VITE_API_URL`   | URL base de la API              | (auto-detección)                 |
| `VITE_API_PORT`  | Puerto del backend              | `4000`                           |

> `VITE_API_URL` vacío = auto-detección: si accedes via `.vscode.dev` o `.github.dev` construye la URL dinámicamente; si no, usa `http://localhost:4000/api`.

---

## API — Endpoints

### Autenticación
| Método | Ruta                | Auth     | Rol              | Descripción                     |
|--------|---------------------|----------|------------------|---------------------------------|
| POST   | `/api/auth/login`   | No       | —                | Iniciar sesión                  |
| GET    | `/api/auth/profile` | JWT      | *cualquiera*     | Obtener perfil propio           |
| PATCH  | `/api/auth/profile` | JWT      | *cualquiera*     | Actualizar perfil propio        |

### CRUD principales (Encargado)
| Método | Ruta                          | Rol              | Descripción                     |
|--------|-------------------------------|------------------|---------------------------------|
| GET    | `/api/laboratorios`           | *todos*          | Listar laboratorios             |
| POST   | `/api/laboratorios`           | encargado        | Crear laboratorio               |
| PATCH  | `/api/laboratorios/:id`       | encargado        | Actualizar laboratorio          |
| DELETE | `/api/laboratorios/:id`       | encargado        | Eliminar (soft) laboratorio     |
| GET    | `/api/equipos`                | *todos*          | Listar equipos                  |
| GET    | `/api/equipos/:codigo`        | *todos*          | Detalle de equipo               |
| POST   | `/api/equipos`                | encargado        | Crear equipo                    |
| PATCH  | `/api/equipos/:codigo`        | encargado        | Actualizar equipo               |
| DELETE | `/api/equipos/:codigo`        | encargado        | Eliminar (soft) equipo          |
| GET    | `/api/insumos`                | *todos*          | Listar insumos                  |
| POST   | `/api/insumos`                | encargado        | Crear insumo                    |
| PATCH  | `/api/insumos/:nombre`        | encargado        | Actualizar insumo               |
| DELETE | `/api/insumos/:nombre`        | encargado        | Eliminar (soft) insumo          |
| GET    | `/api/perifericos`            | *todos*          | Listar periféricos              |
| POST   | `/api/perifericos`            | encargado        | Crear periférico                |
| PATCH  | `/api/perifericos/:id`        | encargado        | Actualizar periférico           |
| DELETE | `/api/perifericos/:id`        | encargado        | Eliminar (soft) periférico      |
| GET    | `/api/inventario`             | *todos*          | Listar inventario               |
| POST   | `/api/inventario`             | encargado        | Crear ítem inventario           |
| PATCH  | `/api/inventario/:id`         | encargado        | Actualizar ítem inventario      |
| DELETE | `/api/inventario/:id`         | encargado        | Eliminar (soft) inventario      |
| GET    | `/api/inventario/stats`       | *todos*          | Estadísticas de inventario      |

### Usuarios (Encargado)
| Método | Ruta                          | Rol              | Descripción                     |
|--------|-------------------------------|------------------|---------------------------------|
| GET    | `/api/auth`                   | encargado        | Listar usuarios                 |
| POST   | `/api/auth/register`          | encargado        | Crear usuario                   |
| PATCH  | `/api/auth/:id`               | encargado        | Actualizar usuario              |
| DELETE | `/api/auth/:id`               | encargado        | Eliminar (soft) usuario         |

### Incidencias
| Método | Ruta                          | Rol              | Descripción                     |
|--------|-------------------------------|------------------|---------------------------------|
| GET    | `/api/incidencias`            | *todos*          | Listar incidencias              |
| POST   | `/api/incidencias`            | docente/estudiante| Crear incidencia               |
| PATCH  | `/api/incidencias/:id`        | encargado        | Actualizar incidencia           |
| DELETE | `/api/incidencias/:id`        | encargado        | Eliminar incidencia             |

### Asignaciones (Correctivo)
| Método | Ruta                          | Rol              | Descripción                     |
|--------|-------------------------------|------------------|---------------------------------|
| GET    | `/api/asignaciones`           | *todos*          | Listar asignaciones             |
| POST   | `/api/asignaciones`           | encargado        | Crear asignación                |
| PATCH  | `/api/asignaciones/:id`       | correctivo       | Resolver/actualizar asignación  |

### Mantenimientos (Preventivo)
| Método | Ruta                          | Rol              | Descripción                     |
|--------|-------------------------------|------------------|---------------------------------|
| GET    | `/api/mantenimientos`         | *todos*          | Listar mantenimientos           |
| POST   | `/api/mantenimientos`         | preventivo       | Crear mantenimiento             |
| PATCH  | `/api/mantenimientos/:id`     | preventivo       | Actualizar mantenimiento        |
| GET    | `/api/mantenimientos/activos` | preventivo       | Mantenimientos activos          |

### Reportes de Pasante
| Método | Ruta                          | Rol              | Descripción                     |
|--------|-------------------------------|------------------|---------------------------------|
| GET    | `/api/reportes`               | *todos*          | Listar reportes                 |
| POST   | `/api/reportes`               | preventivo/correctivo| Crear reporte              |
| PATCH  | `/api/reportes/:id`           | encargado        | Atender/resolver reporte        |

### Logs (auditoría)
| Método | Ruta                          | Rol              | Descripción                     |
|--------|-------------------------------|------------------|---------------------------------|
| GET    | `/api/logs`                   | encargado        | Listar logs de auditoría        |

> **Nota**: Todas las eliminaciones son **lógicas** (`activo = false`). Cada modificación queda registrada en la tabla `logs`.

---

## Roles y Permisos

| Rol                | Nivel | Acceso                                           |
|--------------------|-------|--------------------------------------------------|
| **Encargado ITIC** | 5     | CRUD todo + usuarios + logs + reportes           |
| **Pasante Preventivo** | 3 | Mantenimientos preventivos + reportes diarios     |
| **Pasante Correctivo** | 3 | Asignaciones correctivas + reportes diarios       |
| **Docente**        | 2     | Crear incidencias, ver equipos/labs               |
| **Estudiante**     | 2     | Crear incidencias, ver equipos/labs               |
| **Invitado**       | 1     | Solo lectura (equipos, laboratorios, inventario)  |

---

## Red Local y Acceso Remoto

### Red local
El backend escucha en `0.0.0.0:4000`, accesible desde cualquier dispositivo en la misma red:
```
http://<IP_LOCAL>:4000/api/health
```

### Acceso remoto (ngrok)
```bash
# 1. Iniciar backend + frontend
cd backend && npm run dev
cd frontend && npm run dev

# 2. En otra terminal, exponer el frontend
ngrok http http://localhost:5173
# Compartir la URL https://xxxx.ngrok-free.app
```

> El proxy de Vite (`vite.config.ts`) redirige `/api` → `localhost:4000`, por lo que **un solo túnel** es suficiente.

### Script rápido
```bash
.\iniciar-red.bat      # Inicia backend y frontend con una sola pila
```

---

## Documentación

La documentación completa se encuentra en la carpeta `docs/`:

| Archivo | Contenido |
|---------|-----------|
| `docs/documentacion-tecnica.md` | Documentación técnica: 22 modelos DB, 55+ endpoints, stack, seguridad, despliegue |
| `docs/manual-desarrollador.md` | Guía de desarrollo: setup, estructura, convenciones, cómo agregar módulos, troubleshooting |
| `docs/manual-usuario.md` | Manual de usuario por rol: pantallas, funciones paso a paso |

---

## Cuentas de Prueba

| Rol               | Identificador        | Contraseña | Persona                    |
|-------------------|----------------------|------------|----------------------------|
| Encargado ITIC    | `rescobar@umsa.bo`   | `123456`   | Reynaldo Escobar Quispe    |
| Pasante Preventivo| `20250001`           | `123456`   | Yennifer Sarzuri Mamani    |
| Pasante Correctivo| `20250003`           | `123456`   | Jhonny Arias Choque        |
| Docente           | `projas@umsa.bo`     | `123456`   | Patricia Rojas Vargas      |
| Estudiante        | `20250005`           | `123456`   | Luis Mendoza Flores        |
| Invitado          | `invitado@test.com`  | `123456`   | Visitante Demo             |

> **Nota**: El identificador para login puede ser **email** (encargado, docente, invitado) o **registro universitario** (preventivo, correctivo, estudiante).

---

## Seguridad

- **Contraseñas**: hasheadas con bcryptjs (salt rounds: 12)
- **Autenticación**: JWT con expiración de 8 horas
- **Autorización**: middleware por roles (encargado, preventivo, correctivo, etc.)
- **Validación**: Zod en todas las entradas de la API
- **CORS**: orígenes configurados por entorno

---

## Base de Datos

| Propiedad         | Detalle                          |
|-------------------|----------------------------------|
| Motor             | PostgreSQL 15+                   |
| Nombre            | `sigmalabv3`                     |
| Host              | `localhost:5432`                  |
| Usuario           | `postgres`                       |
| Contraseña        | `1234`                           |
| Modelos           | 22 tablas en esquema `public`    |
| Convención        | `snake_case` en columnas y tablas |

### Modelos principales
```
Edificio → Laboratorio → Equipo → Periferico
                                        ↓
Insumo ← InsumoUsado ← MantenimientoDetalle ← Checklist
                                        ↓
Rol → Usuario → Asignacion
             → Incidencia → EstadoIncidencia
             → Mantenimiento → EstadoMantenimiento, TipoMantenimiento
             → ReportePasante
             → Log
CategoriaInventario → InventarioItem → Equipo, Laboratorio
```

---

## Sistema de Auditoría

Toda operación de escritura (crear, actualizar, eliminar) registra un log en la tabla `logs`:

```json
{
  "usuarioId": "USR-001",
  "accion": "Actualizar equipo",
  "detalle": "Se actualizó el equipo LAB-001-PC-01",
  "modulo": "Equipos",
  "entidad": "LAB-001-PC-01",
  "tipoAccion": "Actualizar"
}
```

- Los logs se consultan desde el panel del **Encargado**
- Incluyen: usuario, acción, detalle, módulo, entidad afectada, timestamp, IP de origen
- No se eliminan físicamente

---

## Troubleshooting

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `ECONNREFUSED` al conectar BD | PostgreSQL no iniciado | `net start postgresql-x64-15` |
| `PrismaClientInitializationError` | Schema desactualizado | `cd backend && npx prisma generate` |
| `token no proporcionado` en peticiones | JWT vencido o no enviado | Re‑iniciar sesión |
| `403 Forbidden` | Rol sin permiso para la ruta | Verificar tabla roles |
| Frontend dice `Network Error` | Backend no corriendo | `cd backend && npm run dev` |
| ngrok no conecta | ngrok no instalado | `winget install ngrok` o descargar de ngrok.com |
| Login no funciona | BD no tiene seed data | Ejecutar `database/setup.bat` |
| Error `fetch` en vistas | API en puerto incorrecto | Verificar `VITE_API_PORT` en `frontend/.env` |
| Soft‑delete no funciona | `activo` no filtrado en query | Agregar `where: { activo: true }` en el model |

---

## Bug Fixes Aplicados

| Bug | Síntoma | Solución |
|-----|---------|----------|
| Bandeja crash | ReferenceError: `ver is not defined` | Cambiar `ver.xxx` → `modal.ver.xxx` en `Bandeja.tsx` |
| Preventivo report filter | Filtraba por username, no por ID | `r.pasante === getSessionUsername(user)` → `r.pasanteId === user?.id` |
| Historial button inoperante | Botón reloj sin efecto | Añadir acción `OPEN_WITH_TAB` + prop `initialTab` en `EquipmentDetailModal` |
| Usuarios delete sin API | `confirmDelete()` fire‑and‑forget | Agregar `await apiClient.delete()` + `try/catch` |
| Usuarios edit sin API | Solo actualizaba store local | Agregar `await apiClient.patch()` antes de `auth.updateAccount()` |
| Modales sin await | Operaciones asíncronas sin `try/catch` | Agregar `async/await` + `try/catch` en Bandeja, BandejaIncidencias, ReportesPasantes, Crear incidencia, Reportes preventivo |

---

## Buenas Prácticas Aplicadas

1. **Separación de responsabilidades**: frontend/backend completamente independientes
2. **Arquitectura MVC**: routes → controllers → models
3. **Principio DRY**: lógica de negocio encapsulada en models
4. **Validación en capas**: Zod en backend + validación en frontend
5. **Manejo de errores centralizado**: errorHandler middleware
6. **Interceptor Axios**: redirección automática en 401
7. **Variables de entorno**: configuración externalizada
8. **Tipado estricto**: TypeScript en todo el código
9. **Auto-detección de entorno**: funciona en localhost y VSCode port forwarding
10. **BD relacional normalizada**: 25 tablas en 3FN con triggers e índices
