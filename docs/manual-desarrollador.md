# Manual del Desarrollador — SIGMALAB

**Sistema de Gestión de Mantenimiento de Laboratorios**
*ITIC — Universidad Mayor de San Andrés (UMSA)*

---

## Índice

1. [Introducción](#1-introducción)
2. [Configuración del Entorno de Desarrollo](#2-configuración-del-entorno-de-desarrollo)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Guía de Estilo y Convenciones](#4-guía-de-estilo-y-convenciones)
5. [Flujo de Trabajo Git](#5-flujo-de-trabajo-git)
6. [Backend: Guía de Desarrollo](#6-backend-guía-de-desarrollo)
7. [Frontend: Guía de Desarrollo](#7-frontend-guía-de-desarrollo)
8. [Pruebas y Depuración](#8-pruebas-y-depuración)
9. [Solución de Problemas Comunes](#9-solución-de-problemas-comunes)

---

## 1. Introducción

Este manual está dirigido a desarrolladores que necesiten continuar el desarrollo de SIGMALAB. Describe la configuración del entorno, la estructura del código, las convenciones de estilo, y los flujos de trabajo para contribuir al proyecto.

### Conocimientos Previos Requeridos

- **Node.js** (20+): Event loop, módulos CommonJS vs ESM, npm
- **TypeScript**: Tipos, interfaces, genéricos, `tsconfig.json`
- **React 19**: Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`), componentes funcionales
- **Express**: Middleware, rutas, request/response cycle
- **PostgreSQL**: Consultas SQL básicas, relaciones, índices
- **Prisma ORM**: Schemas, migrations, queries
- **Git**: Clone, add, commit, push, pull, merge, branches

---

## 2. Configuración del Entorno de Desarrollo

### 2.1 Requisitos Previos

```bash
node --version  # >= 20.0.0
npm --version   # >= 10.0.0
psql --version  # >= 15.0
git --version   # >= 2.30.0
```

### 2.2 Instalación Paso a Paso

```bash
# 1. Clonar repositorio
git clone https://github.com/JhonnnyTzy/sigmalab2.git
cd sigmalab2

# 2. Configurar base de datos
# Opción A: Scripts SQL
.\database\setup.bat                    # Windows
# bash database/setup.sh                # Linux/Mac

# Opción B: Manual
psql -U postgres -c "CREATE DATABASE sigmalabv3;"
psql -U postgres -d sigmalabv3 < database\sigmalab-umsa.sql
psql -U postgres -d sigmalabv3 < database\sigmalab-mas-datos.sql

# 3. Instalar dependencias del backend
cd backend
npm install

# 4. Configurar variables de entorno
# Editar backend/.env (copiar de .env.example si existe)
# PORT=4000
# DATABASE_URL=postgresql://postgres:1234@localhost:5432/sigmalabv3?schema=public
# JWT_SECRET=sigm4l4b-jwt-s3cr3t-k3y-2026
# JWT_EXPIRES_IN=8h
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:5173

# 5. Generar Prisma Client
npx prisma generate

# 6. Iniciar backend
npm run dev
# → http://localhost:4000
# → Health: http://localhost:4000/api/health

# 7. En otra terminal, instalar e iniciar frontend
cd ../frontend
npm install
npm run dev
# → http://localhost:5173
```

### 2.3 Cuentas de Prueba

| Rol | Usuario | Contraseña |
|---|---|---|
| Encargado | rescobar@umsa.bo | 123456 |
| Pasante Preventivo | 20250001 | 123456 |
| Pasante Correctivo | 20250003 | 123456 |
| Docente | projas@umsa.bo | 123456 |
| Estudiante | 20250005 | 123456 |
| Invitado | invitado@test.com | 123456 |

### 2.4 Variables de Entorno

**Backend** (`backend/.env`):
| Variable | Obligatorio | Default | Descripción |
|---|---|---|---|
| `PORT` | No | 4000 | Puerto del servidor |
| `DATABASE_URL` | Sí | — | URL de conexión PostgreSQL |
| `JWT_SECRET` | Sí | — | Secreto para firmar tokens |
| `JWT_EXPIRES_IN` | No | 8h | Tiempo de expiración del token |
| `NODE_ENV` | No | development | Modo de ejecución |
| `CORS_ORIGIN` | No | http://localhost:5173 | Orígenes CORS permitidos |

**Frontend** (`frontend/.env`):
| Variable | Obligatorio | Default | Descripción |
|---|---|---|---|
| `VITE_API_URL` | No | auto-detect | URL base de la API |
| `VITE_API_PORT` | No | 4000 | Puerto de la API |

---

## 3. Estructura del Proyecto

```
sigmalab2/
├── backend/                          # API REST (Express + Prisma)
│   ├── app.ts                        # Configuración de Express
│   ├── server.ts                     # Punto de entrada del servidor
│   ├── tsconfig.json                 # Configuración de TypeScript
│   ├── package.json                  # Dependencias y scripts
│   ├── .env                          # Variables de entorno
│   │
│   ├── config/
│   │   ├── env.ts                    # Validación de variables de entorno
│   │   └── database.ts              # Singleton de Prisma Client
│   │
│   ├── routes/
│   │   ├── index.ts                  # Agregador de rutas
│   │   ├── authRoutes.ts
│   │   ├── equipoRoutes.ts
│   │   ├── laboratorioRoutes.ts
│   │   ├── incidenciaRoutes.ts
│   │   ├── mantenimientoRoutes.ts
│   │   ├── insumoRoutes.ts
│   │   ├── inventarioRoutes.ts
│   │   ├── perifericoRoutes.ts
│   │   ├── asignacionRoutes.ts
│   │   ├── reporteRoutes.ts
│   │   └── logRoutes.ts
│   │
│   ├── controllers/                  # Manejadores de peticiones HTTP
│   │   ├── authController.ts
│   │   ├── equipoController.ts
│   │   ├── laboratorioController.ts
│   │   ├── incidenciaController.ts
│   │   ├── mantenimientoController.ts
│   │   ├── insumoController.ts
│   │   ├── inventarioController.ts
│   │   ├── perifericoController.ts
│   │   ├── asignacionController.ts
│   │   ├── reporteController.ts
│   │   └── logController.ts
│   │
│   ├── models/                       # Lógica de negocio + consultas Prisma
│   │   ├── authModel.ts
│   │   ├── equipoModel.ts
│   │   ├── laboratorioModel.ts
│   │   ├── incidenciaModel.ts
│   │   ├── mantenimientoModel.ts
│   │   ├── insumoModel.ts
│   │   ├── inventarioModel.ts
│   │   ├── perifericoModel.ts
│   │   ├── asignacionModel.ts
│   │   ├── reporteModel.ts
│   │   └── logModel.ts
│   │
│   ├── schemas/                      # Validación Zod
│   │   ├── authSchemas.ts
│   │   ├── equipoSchemas.ts
│   │   └── ... (por cada módulo)
│   │
│   ├── middlewares/
│   │   ├── auth.ts                   # authenticate + authorize
│   │   ├── validate.ts               # Validación Zod
│   │   └── errorHandler.ts           # Manejador centralizado de errores
│   │
│   └── prisma/
│       ├── schema.prisma             # Definición completa de la BD
│       └── seed.ts                   # Datos de prueba
│
├── frontend/                         # Aplicación React (TanStack Start)
│   ├── src/
│   │   ├── components/
│   │   │   ├── sigmalab/             # Componentes de negocio
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── lib/                      # Lógica compartida
│   │   │   ├── auth.ts               # Autenticación y roles
│   │   │   ├── store.ts              # Store reactivo en memoria
│   │   │   ├── use-app.ts            # Estado global
│   │   │   ├── utils.ts              # Utilidades (cn)
│   │   │   ├── exporters.ts          # PDF/Excel
│   │   │   └── sigmalab-data.ts      # Datos semilla
│   │   ├── services/                 # Clientes API
│   │   │   ├── apiClient.ts          # Axios configurado
│   │   │   ├── authService.ts
│   │   │   ├── equipoService.ts
│   │   │   └── laboratorioService.ts
│   │   ├── views/                    # Vistas por rol
│   │   │   ├── encargado/
│   │   │   ├── preventivo/
│   │   │   ├── correctivo/
│   │   │   ├── incidencias/
│   │   │   ├── invitado/
│   │   │   └── shared/
│   │   ├── styles.css
│   │   ├── router.tsx
│   │   └── routeTree.gen.ts
│   ├── vite.config.ts
│   ├── wrangler.jsonc               # Config Cloudflare
│   ├── tsconfig.json
│   └── package.json
│
├── database/                         # Scripts SQL
│   ├── sigmalab-umsa.sql
│   ├── sigmalab-mas-datos.sql
│   ├── sigmalab-inventario-completo.sql
│   ├── setup.bat / setup.sh
│   └── README-DB.md
│
├── docs/                             # Documentación
│   ├── documentacion-tecnica.md
│   ├── manual-desarrollador.md
│   └── manual-usuario.md
│
├── iniciar-red.bat                   # Script inicio rápido
└── README.md
```

---

## 4. Guía de Estilo y Convenciones

### 4.1 TypeScript

- **Tipado explícito**: Siempre declarar tipos en funciones y componentes
- **NO usar `any`**: Preferir `unknown` si el tipo es desconocido
- **Interfaces sobre Types**: Usar `interface` para objetos, `type` para uniones/alias
- **Nombrado**: `camelCase` para variables/funciones, `PascalCase` para componentes/tipos

```typescript
// ✅ Correcto
interface Equipo {
  codigo: string;
  nombre: string;
  activo: boolean;
}

type EquipoEstado = "funcionando" | "en_mantenimiento";

const getEquipo = async (codigo: string): Promise<Equipo | null> => {
  // ...
};

// ❌ Incorrecto
const getEquipo = async (codigo: string): Promise<any> => {
  // ...
};
```

### 4.2 React

- **Componentes funcionales**: Siempre usar funciones, no clases
- **Hooks**: Declarar al inicio del componente, antes de cualquier early return
- **Props**: Tipar explícitamente con `interface`
- **Event handlers**: Prefijo `handle` (ej: `handleSubmit`, `handleChange`)

```typescript
// ✅ Correcto
interface Props {
  equipo: Equipo;
  readOnly?: boolean;
}

export function EquipoCard({ equipo, readOnly = false }: Props) {
  const [editing, setEditing] = useState(false);

  const handleSubmit = useCallback(async () => {
    // ...
  }, []);

  if (!equipo) return null;

  return <div>...</div>;
}
```

### 4.3 Backend (MVC)

- **Routes**: Solo definen método, ruta, middlewares y controlador
- **Controllers**: Extraen datos del request, llaman al model, envían response
- **Models**: Lógica de negocio, consultas Prisma, manejo de errores
- **Schemas**: Validación Zod pura (sin lógica de negocio)

```typescript
// Route
router.get("/:codigo", authenticate, controller.getByCodigo);

// Controller
const getByCodigo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const equipo = await equipoModel.findByCodigo(req.params.codigo);
    if (!equipo) return res.status(404).json({ error: "Equipo no encontrado" });
    res.json(equipo);
  } catch (error) {
    next(error);
  }
};

// Model
const findByCodigo = async (codigo: string) => {
  return await prisma.equipo.findUnique({
    where: { codigo, activo: true },
    include: { laboratorio: true, estado: true },
  });
};
```

### 4.4 Estilos (TailwindCSS)

- **Clases utility-first**: Preferir clases Tailwind sobre CSS personalizado
- **Variantes**: Usar `cn()` de `@/lib/utils` para combinar clases condicionalmente
- **Colores**: Usar variables CSS o colores del theme (`teal`, `navy`, `danger`, etc.)

```typescript
import { cn } from "@/lib/utils";

<button className={cn(
  "px-4 py-2 rounded-lg font-semibold text-sm",
  variant === "primary" ? "bg-teal text-white hover:bg-teal/90" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
)}>
  {children}
</button>
```

### 4.5 Nombrado de Archivos

- **Componentes React**: `NombreComponente.tsx` (PascalCase)
- **Servicios/Servicios**: `nombreServicio.ts` (camelCase)
- **Backend**: `nombreModel.ts`, `nombreController.ts`, `nombreRoutes.ts`
- **Vistas**: `NombreVista.tsx` (PascalCase, coincide con el componente)

---

## 5. Flujo de Trabajo Git

### 5.1 Ramas

```
main                    # Producción (estable)
  └── desarrollo-papo   # Desarrollo principal
       ├── feature/*    # Nuevas funcionalidades
       ├── fix/*        # Correcciones de bugs
       └── refactor/*   # Refactorización
```

### 5.2 Commits

Usar prefijos semánticos:

| Prefijo | Significado |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Refactorización sin cambios funcionales |
| `docs:` | Documentación |
| `style:` | Cambios de formato (espacios, comas, etc.) |
| `chore:` | Tareas de mantenimiento (deps, build) |

Ejemplos:
```
feat: add equipment CRUD endpoints
fix: preventivo report filter comparison
refactor: extract Modal component to shared
docs: add API documentation
```

### 5.3 Commits y Push

```bash
git add <archivos>
git commit -m "tipo: descripción breve"
git push
```

### 5.4 Resolución de Conflictos

```bash
git pull origin main
# Resolver conflictos en archivos
git add <archivos-resueltos>
git commit -m "merge: resolver conflictos en schema y store"
git push
```

---

## 6. Backend: Guía de Desarrollo

### 6.1 Cómo Agregar un Nuevo Módulo (ej: Proveedores)

#### Paso 1: Schema Prisma

```prisma
// backend/prisma/schema.prisma
model Proveedor {
  id        String   @id @default(cuid())
  nombre    String   @unique @db.VarChar(100)
  contacto  String?  @db.VarChar(100)
  telefono  String?  @db.VarChar(20)
  activo    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("proveedores")
}
```

```bash
cd backend
npx prisma db push      # Sincronizar BD
npx prisma generate     # Regenerar cliente
```

#### Paso 2: Schema Zod

```typescript
// backend/schemas/proveedorSchemas.ts
import { z } from "zod";

export const createProveedorSchema = z.object({
  nombre: z.string().min(1).max(100),
  contacto: z.string().max(100).optional(),
  telefono: z.string().max(20).optional(),
});

export const updateProveedorSchema = createProveedorSchema.partial();
```

#### Paso 3: Modelo

```typescript
// backend/models/proveedorModel.ts
import { prisma } from "../config/database";

export const proveedorModel = {
  async findAll() {
    return await prisma.proveedor.findMany({ where: { activo: true } });
  },

  async findById(id: string) {
    return await prisma.proveedor.findUnique({ where: { id } });
  },

  async create(data: { nombre: string; contacto?: string; telefono?: string }) {
    return await prisma.proveedor.create({ data });
  },

  async update(id: string, data: Partial<{ nombre: string; contacto?: string; telefono?: string }>) {
    return await prisma.proveedor.update({ where: { id }, data });
  },

  async remove(id: string) {
    return await prisma.proveedor.update({
      where: { id },
      data: { activo: false },
    });
  },
};
```

#### Paso 4: Controlador

```typescript
// backend/controllers/proveedorController.ts
import { Request, Response, NextFunction } from "express";
import { proveedorModel } from "../models/proveedorModel";

export const proveedorController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const proveedores = await proveedorModel.findAll();
      res.json(proveedores);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const proveedor = await proveedorModel.findById(req.params.id);
      if (!proveedor) return res.status(404).json({ error: "Proveedor no encontrado" });
      res.json(proveedor);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const proveedor = await proveedorModel.create(req.body);
      res.status(201).json(proveedor);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const proveedor = await proveedorModel.update(req.params.id, req.body);
      res.json(proveedor);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await proveedorModel.remove(req.params.id);
      res.json({ message: "Proveedor desactivado correctamente" });
    } catch (error) {
      next(error);
    }
  },
};
```

#### Paso 5: Rutas

```typescript
// backend/routes/proveedorRoutes.ts
import { Router } from "express";
import { proveedorController } from "../controllers/proveedorController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createProveedorSchema, updateProveedorSchema } from "../schemas/proveedorSchemas";

const router = Router();

router.get("/", authenticate, proveedorController.getAll);
router.get("/:id", authenticate, proveedorController.getById);
router.post("/", authenticate, authorize("encargado"), validate(createProveedorSchema), proveedorController.create);
router.patch("/:id", authenticate, authorize("encargado"), validate(updateProveedorSchema), proveedorController.update);
router.delete("/:id", authenticate, authorize("encargado"), proveedorController.remove);

export default router;
```

#### Paso 6: Registrar rutas

```typescript
// backend/routes/index.ts (agregar línea)
import proveedorRoutes from "./proveedorRoutes";
router.use("/proveedores", proveedorRoutes);
```

### 6.2 Soft-Delete (Patrón)

Todas las entidades principales deben implementar soft-delete:

```prisma
model Entidad {
  activo  Boolean @default(true)
  // ... otros campos
}
```

```typescript
// Model: findAll filtra activos, remove desactiva
async findAll() {
  return await prisma.entidad.findMany({ where: { activo: true } });
}

async remove(id: string) {
  return await prisma.entidad.update({ where: { id }, data: { activo: false } });
}
```

```typescript
// Controller: log de auditoría
async remove(req: Request, res: Response, next: NextFunction) {
  try {
    await entidadModel.remove(req.params.id);
    createLog(req, "Eliminación", "Entidad", `Entidad ${req.params.id} desactivada`);
    res.json({ message: "Entidad desactivada correctamente" });
  } catch (error) {
    next(error);
  }
}
```

### 6.3 Logs de Auditoría

```typescript
// Función fire-and-forget (no bloquea la respuesta)
const createLog = async (
  req: Request,
  accion: string,
  modulo: string,
  detalle?: string,
  entidad?: string,
) => {
  try {
    await prisma.log.create({
      data: {
        id: `LOG-${Date.now()}`,
        usuarioId: (req as any).user?.userId,
        accion,
        modulo,
        detalle,
        entidad,
        timestamp: new Date(),
        estado: "Exito",
        ipOrigen: req.ip,
      },
    });
  } catch (e) {
    console.error("Error al crear log:", e);
  }
};
```

### 6.4 Manejo de Errores

```typescript
// Error personalizado
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// En el controlador
if (!entidad) throw new AppError("No encontrado", 404);

// Error handler global (errorHandler.ts)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json({
    error: err.message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
```

### 6.5 Scripts Disponibles

```bash
npm run dev           # Desarrollo con hot-reload (tsx watch)
npm run build         # Compilar a JS (tsc)
npm run start         # Ejecutar compilado (node dist/server.js)
npx prisma generate   # Regenerar Prisma Client
npx prisma db push    # Sincronizar schema con BD
npx prisma migrate dev # Crear migración
npm run db:seed       # Poblar base de datos
```

---

## 7. Frontend: Guía de Desarrollo

### 7.1 Cómo Agregar una Nueva Vista

#### Paso 1: Crear el componente

```typescript
// frontend/src/view/encargado/Proveedores.tsx
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { store, useStore } from "@/lib/store";

interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
}

export function ProveedoresView() {
  const proveedores = useStore((s) => s.proveedores || []);
  const [form, setForm] = useState({ nombre: "", contacto: "", telefono: "" });
  const [modal, setModal] = useState<{ type: "create" | "edit"; data?: any } | null>(null);

  const handleSubmit = async () => {
    try {
      if (modal?.type === "create") {
        await store.addProveedor(form);
        toast.success("Proveedor registrado");
      }
      setModal(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Error al guardar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Proveedores</h1>
          <p className="text-sm text-muted-foreground">Gestión de proveedores</p>
        </div>
        <button onClick={() => setModal({ type: "create" })} className="...">
          <Plus className="size-4" /> Nuevo Proveedor
        </button>
      </div>

      <Panel title={`${proveedores.length} proveedores`}>
        <table className="w-full text-sm">
          <thead>...</thead>
          <tbody>{proveedores.map(p => <tr key={p.id}>...</tr>)}</tbody>
        </table>
      </Panel>

      <Modal open={!!modal} onOpenChange={(v) => !v && setModal(null)} title="Nuevo Proveedor"
        footer={<><Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                 <Button onClick={handleSubmit} className="bg-navy">Guardar</Button></>}>
        <FormField label="Nombre" required>
          <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className={inputCls} />
        </FormField>
        ...
      </Modal>
    </div>
  );
}
```

#### Paso 2: Agregar al store

```typescript
// frontend/src/lib/store.ts

// 1. Agregar al State
interface State {
  // ... existentes
  proveedores: Proveedor[];
}

// 2. Datos iniciales
const state: State = {
  // ...
  proveedores: [],
};

// 3. Métodos CRUD
export const store = {
  // ...
  addProveedor: async (p: Proveedor) => {
    state.proveedores = [p, ...state.proveedores];
    notify();
    try {
      await apiClient.post("/proveedores", p);
    } catch (e) {
      console.error("POST /proveedores falló:", e);
    }
  },
  updateProveedor: async (id: string, patch: Partial<Proveedor>) => {
    await apiClient.patch(`/proveedores/${id}`, patch);
    state.proveedores = state.proveedores.map(p => p.id === id ? { ...p, ...patch } : p);
    notify();
  },
  deleteProveedor: async (id: string) => {
    await apiClient.delete(`/proveedores/${id}`);
    state.proveedores = state.proveedores.map(p => p.id === id ? { ...p, activo: false } : p);
    notify();
  },
};

// 4. Inicializar desde API
export async function initFromApi() {
  const [provRes] = await Promise.allSettled([
    apiClient.get("/proveedores"),
    // ...
  ]);
  if (provRes.status === "fulfilled") {
    state.proveedores = provRes.value.data;
  }
}
```

#### Paso 3: Agregar al router

El router de TanStack puede auto-generarse o configurarse manualmente. Revisar `router.tsx` y `routeTree.gen.ts` para ver el patrón usado.

### 7.2 Patrón de Store

El store es el corazón del frontend. Es un **patrón Observer** simple:

```typescript
type Listener = () => void;

const listeners = new Set<Listener>();
let state: State = { ...initialState };

export function notify() {
  listeners.forEach((l) => l());
}

export function useStore<T>(selector: (s: State) => T): T {
  const [value, setValue] = useState(() => selector(state));

  useEffect(() => {
    const listener = () => setValue(selector(state));
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  return value;
}
```

### 7.3 Llamadas API con Axios

```typescript
import apiClient from "@/services/apiClient";

// GET
const { data } = await apiClient.get("/equipos");
const { data } = await apiClient.get(`/equipos/${codigo}`);

// POST
const { data } = await apiClient.post("/equipos", payload);

// PATCH
const { data } = await apiClient.patch(`/equipos/${codigo}`, payload);

// DELETE
await apiClient.delete(`/equipos/${codigo}`);
```

### 7.4 Componentes shadcn/ui

Los componentes de UI se encuentran en `frontend/src/components/ui/`. Se importan desde `@/components/ui/`:

```typescript
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
```

### 7.5 Scripts Disponibles

```bash
npm run dev            # Desarrollo en localhost:5173
npm run dev:network    # Desarrollo accesible desde la red (--host)
npm run build          # Build de producción
npm run preview        # Previsualizar build
npm run lint           # ESLint
npm run format         # Prettier
```

---

## 8. Pruebas y Depuración

### 8.1 Prueba Manual

```bash
# Probar health endpoint
curl http://localhost:4000/api/health

# Probar login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"rescobar@umsa.bo","password":"123456"}'
```

### 8.2 Depuración con Chrome DevTools

1. Abrir F12 en el navegador
2. Pestaña **Network**: Ver peticiones API y sus respuestas
3. Pestaña **Console**: Ver errores de JS y logs
4. Pestaña **Application** → Local Storage: Ver `sigmalab.token.v1` y `sigmalab.session.v1`

### 8.3 Depuración del Backend

```bash
# Logs del servidor en tiempo real
cd backend && npm run dev

# Prisma Studio (interfaz gráfica para la BD)
cd backend && npx prisma studio
# → http://localhost:5555
```

### 8.4 Error: "Rendered more hooks than during previous render"

Ocurre cuando un hook (useState, useEffect, useCallback) se declara después de un early return.

```typescript
// ❌ Incorrecto
export function MiComponente() {
  if (!user) return null;
  const [state, setState] = useState(); // ❌ Hook después de return
}

// ✅ Correcto
export function MiComponente() {
  const [state, setState] = useState(); // ✅ Hook antes de early return
  if (!user) return null;
}
```

---

## 9. Solución de Problemas Comunes

### 9.1 Error: `Unknown argument 'xxx'` al usar Prisma

**Problema**: Schema actualizado pero Prisma Client no regenerado.

**Solución**:
```bash
# 1. Matar procesos Node que bloquean archivos
taskkill /f /im node.exe

# 2. Regenerar cliente
cd backend
npx prisma generate
```

### 9.2 Error: `EPERM` al renombrar `query_engine-windows.dll.node.tmp`

**Problema**: Archivo bloqueado por otro proceso Node.

**Solución**: Matar todos los procesos Node y regenerar.

### 9.3 Error: `ECONNREFUSED` al conectar con la base de datos

**Problema**: PostgreSQL no está corriendo o la URL es incorrecta.

**Solución**:
```bash
# Verificar que PostgreSQL está corriendo
Get-Service postgresql*  # Windows
# sudo systemctl status postgresql  # Linux

# Verificar conexión
psql -U postgres -d sigmalabv3 -c "SELECT 1"
```

### 9.4 Error: 401 en todas las peticiones API

**Problema**: Token JWT expirado o inválido.

**Solución**:
```javascript
// En consola del navegador
localStorage.removeItem("sigmalab.token.v1");
localStorage.removeItem("sigmalab.session.v1");
// Recargar página e iniciar sesión nuevamente
```

### 9.5 El frontend no se conecta al backend

**Problema**: `apiClient.ts` apunta a `localhost:4000` pero el backend está en otro puerto.

**Solución**:
```bash
# Verificar que el backend corre en el puerto correcto
# Verificar apiClient.ts o configurar VITE_API_URL
set VITE_API_URL=http://localhost:4000/api
cd frontend && npm run dev
```

### 9.6 Error: `Module not found` después de clonar

**Problema**: `node_modules` no instalado.

**Solución**:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 9.7 Error: `prisma: command not found`

**Problema**: Prisma CLI no instalada.

**Solución**:
```bash
cd backend
npx prisma generate   # Usar npx en vez de npm run
```

---

## Apéndice: Referencia Rápida

```bash
# Inicio rápido (desarrollo)
cd backend && npm run dev                    # Terminal 1
cd frontend && npm run dev                   # Terminal 2
# → http://localhost:5173

# Inicio rápido (red local)
.\iniciar-red.bat                            # Ambos servidores

# Base de datos
cd backend
npx prisma studio                            # UI de la BD
npx prisma db push                           # Sincronizar schema
npx prisma generate                          # Regenerar cliente

# Build
cd frontend && npm run build                 # Build frontend

# Loguearse (test)
# Usuario: rescobar@umsa.bo / 123456 (encargado)
# Usuario: 20250001 / 123456 (preventivo)
```
