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
| Zod              | 3.x     | Validación                   |
| shadcn/ui        | -       | Componentes base              |

### Backend
| Tecnología       | Versión | Propósito                     |
|------------------|---------|-------------------------------|
| Node.js          | 20 LTS  | Entorno de ejecución          |
| Express          | 4.x     | Framework HTTP                 |
| Prisma           | 6.x     | ORM                           |
| PostgreSQL       | -       | Base de datos relacional      |
| JWT              | -       | Autenticación                  |
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
│   │   └── laboratorioController.ts
│   ├── middlewares/
│   │   ├── auth.ts             # JWT + roles
│   │   ├── validate.ts         # Validación con Zod
│   │   └── errorHandler.ts     # Manejo centralizado de errores
│   ├── models/
│   │   ├── authModel.ts        # Lógica de autenticación
│   │   ├── equipoModel.ts      # Lógica de equipos
│   │   └── laboratorioModel.ts
│   ├── routes/
│   │   ├── index.ts            # Agrupador de rutas
│   │   ├── authRoutes.ts
│   │   ├── equipoRoutes.ts
│   │   └── laboratorioRoutes.ts
│   ├── schemas/                # Esquemas Zod
│   │   ├── authSchemas.ts
│   │   ├── equipoSchemas.ts
│   │   └── laboratorioSchemas.ts
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos de datos
│   │   └── seed.ts             # Datos de prueba
│   ├── app.ts                  # Configuración Express
│   ├── server.ts               # Punto de entrada
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   └── sigmalab/       # Componentes de negocio
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Contexto de autenticación
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilidades y store local
│   │   ├── routes/             # TanStack Router
│   │   ├── services/           # Capa de API (Axios)
│   │   │   ├── apiClient.ts    # Cliente Axios + interceptores
│   │   │   ├── authService.ts  # Auth API
│   │   │   ├── equipoService.ts
│   │   │   └── laboratorioService.ts
│   │   ├── views/              # Páginas por rol
│   │   ├── router.tsx          # Configuración del router
│   │   └── styles.css
│   ├── .env                    # Variables frontend
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## Instalación

### Prerrequisitos
- Node.js 20 LTS
- PostgreSQL 15+
- npm o bun

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd sigmalab
```

### 2. Backend

```bash
cd backend
npm install

# Configurar variables de entorno (opcional)
# Editar backend/.env con tu conexión PostgreSQL

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones (cuando la BD esté lista)
npx prisma migrate dev --name init

# Poblar datos demo
npx tsx prisma/seed.ts

# Iniciar servidor de desarrollo
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se iniciará en `http://localhost:5173` y el backend en `http://localhost:4000`.

---

## Variables de Entorno

### Backend (`backend/.env`)

| Variable         | Descripción                     | Default                                      |
|------------------|---------------------------------|----------------------------------------------|
| `PORT`           | Puerto del servidor             | `4000`                                       |
| `DATABASE_URL`   | Conexión PostgreSQL             | `postgresql://postgres:postgres@localhost:...`|
| `JWT_SECRET`     | Secreto para firmar JWT         | `sigm4l4b-jwt-s3cr3t-k3y-2026`               |
| `JWT_EXPIRES_IN` | Expiración del token            | `8h`                                         |
| `NODE_ENV`       | Entorno (`development`/`production`) | `development`                           |
| `CORS_ORIGIN`    | Origen permitido para CORS      | `http://localhost:5173`                      |

### Frontend (`frontend/.env`)

| Variable        | Descripción              | Default                          |
|-----------------|--------------------------|----------------------------------|
| `VITE_API_URL`  | URL base de la API       | `http://localhost:4000/api`      |

---

## Cuentas de Prueba

| Rol               | Identificador       | Contraseña |
|-------------------|---------------------|------------|
| Encargado ITIC    | admin@test.com      | 123456     |
| Pasante Preventivo| 20250001            | 123456     |
| Pasante Correctivo| 20250002            | 123456     |
| Docente           | docente@test.com    | 123456     |
| Estudiante        | 20250003            | 123456     |
| Invitado          | invitado@test.com   | 123456     |

---

## Seguridad

- **Contraseñas**: hasheadas con bcryptjs (salt rounds: 12)
- **Autenticación**: JWT con expiración de 8 horas
- **Autorización**: middleware por roles (encargado, preventivo, correctivo, etc.)
- **Validación**: Zod en todas las entradas de la API
- **CORS**: restringido al origen del frontend
- **Helmet** (recomendado para producción): protección contra vulnerabilidades web

---

## Buenas Prácticas Aplicadas

1. **Separación de responsabilidades**: frontend/backend completamente independientes
2. **Arquitectura MVC**: routes → controllers → models
3. **Principio DRY**: lógica de negocio encapsulada en models
4. **Validación en capas**: Zod en backend + validación en frontend
5. **Manejo de errores centralizado**: errorHandler middleware
6. **Interceptor Axios**: renovación/redirección automática en 401
7. **Variables de entorno**: configuración externalizada
8. **Tipado estricto**: TypeScript en todo el código
9. **Convenciones RESTful**: endpoints semánticos y métodos HTTP estándar
10. **Preparado para producción**: estructura escalable y configuración por entorno
