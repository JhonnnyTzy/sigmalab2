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

## API — Endpoints disponibles

### Autenticación
| Método | Ruta               | Auth     | Descripción                |
|--------|--------------------|----------|----------------------------|
| POST   | `/api/auth/login`  | No       | Iniciar sesión             |
| GET    | `/api/auth/profile`| JWT      | Obtener perfil             |
| PATCH  | `/api/auth/profile`| JWT      | Actualizar perfil          |

### Catálogos
| Método | Ruta                          | Auth | Descripción                     |
|--------|-------------------------------|------|----------------------------------|
| GET    | `/api/equipos`                | JWT  | Listar equipos                  |
| GET    | `/api/equipos/:codigo`        | JWT  | Detalle de equipo               |
| GET    | `/api/laboratorios`           | JWT  | Listar laboratorios             |

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
