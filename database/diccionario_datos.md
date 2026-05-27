# Diccionario de Datos — SigmaLab v3

## Convenciones
- **PK**: Primary Key
- **FK**: Foreign Key
- **UQ**: Unique
- **NN**: Not Null
- `camelCase` = nombre en Prisma, `snake_case` = columna física en PostgreSQL

---

## 1. edificios

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del edificio |
| nombre | VARCHAR | NN | Nombre del edificio |
| ubicacion | VARCHAR | — | Dirección o referencia |
| activo | BOOLEAN | NN, default `true` | Soft-delete |

**Relaciones:** `1:N → laboratorios`

---

## 2. roles

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del rol |
| nombre | VARCHAR | UQ, NN | Nombre del rol (Admin, Encargado, Técnico, Docente, Estudiante, Invitado) |
| descripcion | VARCHAR | — | Descripción opcional |
| nivel_acceso | INTEGER | NN | Número de nivel (mayor = más permisos) |

**Relaciones:** `1:N → usuarios`

---

## 3. categorias_inventario

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID de la categoría |
| nombre | VARCHAR | UQ, NN | Nombre de la categoría (Monitor, CPU, Teclado, etc.) |
| stock_minimo | INTEGER | NN, default `0` | Umbral de alerta de stock bajo |
| activo | BOOLEAN | NN, default `true` | Soft-delete |

**Relaciones:** `1:N → inventario`

---

## 4. tipo_mantenimiento

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del tipo |
| nombre | VARCHAR | UQ, NN | Preventivo / Correctivo |

**Relaciones:** `1:N → mantenimientos`

---

## 5. estado_equipo

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del estado |
| nombre | VARCHAR | UQ, NN | Funcionando / Dañado / En reparación / Baja |

**Relaciones:** `1:N → equipos`

---

## 6. estado_mantenimiento

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del estado |
| nombre | VARCHAR | UQ, NN | Pendiente / En Progreso / Completado / Cancelado |

**Relaciones:** `1:N → mantenimientos`

---

## 7. estado_incidencia

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del estado |
| nombre | VARCHAR | UQ, NN | Abierto / En proceso / Resuelto / Cerrado |

**Relaciones:** `1:N → incidencias`

---

## 8. personas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID de la persona |
| nombres | VARCHAR | NN | Nombre(s) |
| paterno | VARCHAR | NN | Apellido paterno |
| materno | VARCHAR | — | Apellido materno |
| ci | VARCHAR | UQ | Cédula de identidad |
| registro_universitario | VARCHAR | UQ | RU (para estudiantes) |
| email | VARCHAR | UQ | Correo electrónico |
| celular | VARCHAR | — | Teléfono / celular |
| foto_url | VARCHAR | — | Foto de perfil en base64 |
| activo | BOOLEAN | NN, default `true` | Soft-delete |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de creación |
| updated_at | TIMESTAMP | NN, auto | Última modificación |

**Relaciones:**
- `1:1 → usuarios`
- `1:N → laboratorios` (como encargado)
- `1:N → incidencias` (como reportante)

---

## 9. usuarios

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del usuario |
| persona_id | VARCHAR | UQ, NN, FK → personas.id | Persona asociada (Cascade delete) |
| role_id | VARCHAR | NN, FK → roles.id | Rol del usuario |
| password_hash | VARCHAR | NN | Hash bcrypt de la contraseña |
| ultimo_acceso | TIMESTAMP | — | Último inicio de sesión |
| activo | BOOLEAN | NN, default `true` | Soft-delete |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de creación |
| updated_at | TIMESTAMP | NN, auto | Última modificación |

**Relaciones:**
- `N:1 → personas`
- `N:1 → roles`
- `1:N → mantenimientos` (como técnico)
- `1:N → incidencias` (como reportante)
- `1:N → asignaciones` (como técnico)
- `1:N → reportes_pasante` (como pasante)
- `1:N → reportes_pasante` (como atendió)
- `1:N → logs`

---

## 10. laboratorios

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del laboratorio |
| nombre | VARCHAR | NN | Nombre del laboratorio |
| edificio_id | VARCHAR | NN, FK → edificios.id | Edificio donde se ubica |
| piso | INTEGER | NN | Número de piso |
| capacidad_equipos | INTEGER | NN | Máximo de equipos |
| capacidad_personas | INTEGER | NN | Capacidad de personas |
| encargado_id | VARCHAR | FK → personas.id | Persona encargada |
| activo | BOOLEAN | NN, default `true` | Soft-delete |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de creación |
| updated_at | TIMESTAMP | NN, auto | Última modificación |

**Relaciones:**
- `N:1 → edificios`
- `N:1 → personas` (encargado)
- `1:N → equipos`
- `1:N → perifericos`
- `1:N → inventario`
- `1:N → incidencias`
- `1:N → mantenimientos`

---

## 11. equipos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| codigo | VARCHAR | PK, NN | Código único del equipo (ej. LAB01-PC01) |
| nombre | VARCHAR | NN | Nombre descriptivo |
| laboratorio_id | VARCHAR | NN, FK → laboratorios.id | Laboratorio al que pertenece |
| fila | VARCHAR | — | Fila dentro del lab |
| puesto | VARCHAR | — | Número de puesto |
| sistema_operativo | VARCHAR | — | SO instalado |
| marca | VARCHAR | — | Marca del equipo |
| modelo | VARCHAR | — | Modelo |
| numero_serie | VARCHAR | UQ | Número de serie del fabricante |
| estado_id | VARCHAR | NN, FK → estado_equipo.id | Estado actual |
| fecha_compra | DATE | — | Fecha de adquisición |
| activo | BOOLEAN | NN, default `true` | Soft-delete |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de creación |
| updated_at | TIMESTAMP | NN, auto | Última modificación |

**Restricciones adicionales:** `UNIQUE(laboratorio_id, fila, puesto)` — no duplicar ubicación.

**Relaciones:**
- `N:1 → laboratorios`
- `N:1 → estado_equipo`
- `1:N → mantenimientos`
- `1:N → incidencias`
- `1:N → asignaciones`
- `1:N → perifericos`
- `1:N → inventario`

---

## 12. perifericos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del periférico |
| tipo | VARCHAR | NN | Tipo (Mouse, Teclado, Monitor, Audífonos, etc.) |
| marca | VARCHAR | — | Marca |
| modelo | VARCHAR | — | Modelo |
| numero_serie | VARCHAR | — | Número de serie |
| laboratorio_id | VARCHAR | FK → laboratorios.id | Laboratorio asignado |
| equipo_codigo | VARCHAR | FK → equipos.codigo | Equipo específico asignado |
| estado | VARCHAR | NN, default `'Funcionando'` | Estado actual |
| activo | BOOLEAN | NN, default `true` | Soft-delete |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de creación |

**Relaciones:**
- `N:1 → laboratorios`
- `N:1 → equipos`

---

## 13. inventario

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del item |
| categoria_id | VARCHAR | NN, FK → categorias_inventario.id | Categoría del item |
| codigo_itic | VARCHAR | UQ, NN | Código ITIC del item |
| codigo_facultativo | VARCHAR | — | Código facultativo |
| codigo_umsa | VARCHAR | — | Código UMSA |
| numero_serie | VARCHAR | — | Número de serie del fabricante |
| marca | VARCHAR | — | Marca |
| modelo | VARCHAR | — | Modelo |
| estado | VARCHAR | NN, default `'En almacén'` | Estado actual |
| fecha_ingreso | DATE | NN | Fecha de ingreso al inventario |
| fecha_asignacion | DATE | — | Fecha de asignación a laboratorio/equipo |
| laboratorio_id | VARCHAR | FK → laboratorios.id | Laboratorio asignado |
| equipo_codigo | VARCHAR | FK → equipos.codigo | Equipo asignado |
| observaciones | VARCHAR | — | Notas adicionales |
| activo | BOOLEAN | NN, default `true` | Soft-delete |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de creación |

**Relaciones:**
- `N:1 → categorias_inventario`
- `N:1 → laboratorios`
- `N:1 → equipos`

---

## 14. insumos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| nombre | VARCHAR | PK, NN | Nombre del insumo |
| unidad_medida | VARCHAR | NN | Unidad (Unidad, Litro, Metro, etc.) |
| stock | INTEGER | NN, default `0` | Cantidad actual |
| stock_minimo | INTEGER | NN, default `0` | Umbral de alerta |
| activo | BOOLEAN | NN, default `true` | Soft-delete |
| updated_at | TIMESTAMP | NN, auto | Última modificación |

**Relaciones:** `1:N → insumos_usados`

---

## 15. mantenimientos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del mantenimiento |
| tipo_id | VARCHAR | NN, FK → tipo_mantenimiento.id | Preventivo / Correctivo |
| equipo_codigo | VARCHAR | NN, FK → equipos.codigo | Equipo intervenido |
| tecnico_id | VARCHAR | NN, FK → usuarios.id | Técnico responsable |
| laboratorio_id | VARCHAR | FK → laboratorios.id | Laboratorio (contexto) |
| fecha | DATE | NN | Fecha del mantenimiento |
| hora_inicio | TIMESTAMP | — | Hora de inicio |
| hora_fin | TIMESTAMP | — | Hora de finalización |
| estado_id | VARCHAR | NN, FK → estado_mantenimiento.id | Estado del mantenimiento |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de creación |
| updated_at | TIMESTAMP | NN, auto | Última modificación |

**Relaciones:**
- `N:1 → tipo_mantenimiento`
- `N:1 → equipos`
- `N:1 → usuarios` (técnico)
- `N:1 → laboratorios`
- `N:1 → estado_mantenimiento`
- `1:1 → mantenimientos_detalle`

---

## 16. mantenimientos_detalle

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del detalle |
| mantenimiento_id | VARCHAR | UQ, NN, FK → mantenimientos.id | Mantenimiento asociado (Cascade delete) |
| descripcion | VARCHAR | — | Descripción del trabajo |
| diagnostico | VARCHAR | — | Diagnóstico técnico |
| accion_realizada | VARCHAR | — | Acción correctiva/preventiva realizada |
| resolucion | VARCHAR | — | Resolución final |
| tipo_incidencia | VARCHAR | — | Tipo de incidencia detectada |
| estado_final | VARCHAR | — | Estado final del equipo |
| observaciones | VARCHAR | — | Observaciones adicionales |
| recomendaciones | VARCHAR | — | Recomendaciones futuras |

**Relaciones:**
- `1:1 → mantenimientos`
- `1:N → checklists`
- `1:N → insumos_usados`

---

## 17. checklists

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del checklist |
| detalle_id | VARCHAR | NN, FK → mantenimientos_detalle.id | Detalle asociado (Cascade delete) |
| categoria | VARCHAR | NN | Categoría del ítem (Hardware, Software, Conexión, etc.) |
| item | VARCHAR | NN | Nombre del ítem verificado |
| estado | VARCHAR | NN | OK / Fallo / N/A |
| observacion | VARCHAR | — | Observación si aplica |

**Relaciones:** `N:1 → mantenimientos_detalle`

---

## 18. insumos_usados

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del registro |
| detalle_id | VARCHAR | NN, FK → mantenimientos_detalle.id | Detalle asociado (Cascade delete) |
| insumo_nombre | VARCHAR | NN, FK → insumos.nombre | Insumo utilizado |
| cantidad | VARCHAR | NN | Cantidad usada (en texto por flexibilidad) |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de registro |

**Relaciones:**
- `N:1 → mantenimientos_detalle`
- `N:1 → insumos`

---

## 19. incidencias

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID de la incidencia |
| equipo_codigo | VARCHAR | FK → equipos.codigo | Equipo afectado |
| laboratorio_id | VARCHAR | FK → laboratorios.id | Laboratorio afectado |
| usuario_id | VARCHAR | FK → usuarios.id | Usuario que reporta |
| persona_id | VARCHAR | FK → personas.id | Persona que reporta (no usuario) |
| problema | VARCHAR | NN | Descripción del problema |
| requiere_seguimiento | BOOLEAN | NN, default `false` | Marca si requiere seguimiento especial |
| estado_id | VARCHAR | NN, FK → estado_incidencia.id | Estado de la incidencia |
| fecha | TIMESTAMP | NN, default `now()` | Fecha del reporte |
| resuelta_en | TIMESTAMP | — | Fecha de resolución |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de creación |
| updated_at | TIMESTAMP | NN, auto | Última modificación |

**Relaciones:**
- `N:1 → equipos`
- `N:1 → laboratorios`
- `N:1 → usuarios`
- `N:1 → personas`
- `N:1 → estado_incidencia`

---

## 20. asignaciones

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID de la asignación |
| equipo_codigo | VARCHAR | NN, FK → equipos.codigo | Equipo asignado |
| laboratorio_id | VARCHAR | FK → laboratorios.id | Laboratorio de contexto |
| tecnico_id | VARCHAR | NN, FK → usuarios.id | Técnico responsable |
| problema | VARCHAR | NN | Descripción del problema |
| prioridad | VARCHAR | NN, default `'Media'` | Alta / Media / Baja |
| fecha | DATE | NN | Fecha de asignación |
| estado | VARCHAR | NN, default `'Pendiente'` | Pendiente / En Progreso / Completado |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de creación |
| updated_at | TIMESTAMP | NN, auto | Última modificación |

**Relaciones:**
- `N:1 → equipos`
- `N:1 → usuarios` (técnico)

---

## 21. reportes_pasante

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del reporte |
| pasante_id | VARCHAR | NN, FK → usuarios.id | Pasante que reporta |
| titulo | VARCHAR | NN | Título breve del reporte |
| descripcion | VARCHAR | NN | Descripción detallada |
| laboratorio_id | VARCHAR | FK → laboratorios.id | Laboratorio relacionado |
| ubicacion | VARCHAR | — | Ubicación específica |
| categoria | VARCHAR | — | Categoría del reporte |
| prioridad | VARCHAR | NN, default `'Media'` | Alta / Media / Baja |
| fecha | TIMESTAMP | NN, default `now()` | Fecha del reporte |
| estado | VARCHAR | NN, default `'Nuevo'` | Nuevo / En Progreso / Resuelto |
| resolucion_detalle | VARCHAR | — | Detalle de la resolución |
| atendido_por | VARCHAR | FK → usuarios.id | Usuario que atendió |
| created_at | TIMESTAMP | NN, default `now()` | Fecha de creación |
| updated_at | TIMESTAMP | NN, auto | Última modificación |

**Relaciones:**
- `N:1 → usuarios` (pasante)
- `N:1 → usuarios` (atendió)

---

## 22. logs

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | VARCHAR | PK, NN | UUID del log |
| timestamp | TIMESTAMP | NN, default `now()` | Fecha y hora del evento |
| usuario_id | VARCHAR | FK → usuarios.id | Usuario que realizó la acción |
| accion | VARCHAR | NN | Acción realizada |
| detalle | VARCHAR | — | Detalle de la acción |
| modulo | VARCHAR | — | Módulo del sistema |
| entidad | VARCHAR | — | Entidad afectada |
| equipo_codigo | VARCHAR | — | Equipo relacionado |
| tipo_accion | VARCHAR | — | CREATE / UPDATE / DELETE / LOGIN / etc. |
| estado | VARCHAR | NN, default `'Éxito'` | Éxito / Error |
| ip_origen | VARCHAR | — | Dirección IP de origen |

**Relaciones:** `N:1 → usuarios`

---

## Resumen de relaciones (MER)

### Tablas maestras / catálogos
| Tabla | Tipo |
|-------|------|
| edificios | Geografía |
| roles | Seguridad |
| categorias_inventario | Inventario |
| tipo_mantenimiento | Mantenimiento |
| estado_equipo | Equipos |
| estado_mantenimiento | Mantenimiento |
| estado_incidencia | Incidencias |
| insumos | Inventario |

### Tablas de negocio
| Tabla | Tipo |
|-------|------|
| personas | Personas físicas |
| usuarios | Cuentas del sistema |
| laboratorios | Espacios físicos |
| equipos | Equipos de cómputo |
| perifericos | Periféricos asociados |
| inventario | Items inventariados |
| mantenimientos | Órdenes de mantenimiento |
| mantenimientos_detalle | Detalle técnico del mantenimiento |
| checklists | Checklist del detalle |
| insumos_usados | Insumos consumidos |
| incidencias | Reportes de incidencias |
| asignaciones | Asignaciones a técnicos |
| reportes_pasante | Reportes de pasantes |
| logs | Auditoría del sistema |

### Mapa de relaciones principales

```
edificios 1─N laboratorios
roles 1─N usuarios
personas 1─1 usuarios
personas 1─N laboratorios (encargado)
laboratorios 1─N equipos
laboratorios 1─N perifericos
laboratorios 1─N inventario
laboratorios 1─N incidencias
laboratorios 1─N mantenimientos
estado_equipo 1─N equipos
equipos 1─N mantenimientos
equipos 1─N incidencias
equipos 1─N asignaciones
equipos 1─N perifericos
equipos 1─N inventario
tipo_mantenimiento 1─N mantenimientos
estado_mantenimiento 1─N mantenimientos
mantenimientos 1─1 mantenimientos_detalle
mantenimientos_detalle 1─N checklists
mantenimientos_detalle 1─N insumos_usados
insumos 1─N insumos_usados
categorias_inventario 1─N inventario
estado_incidencia 1─N incidencias
incidencias N─1 usuarios
incidencias N─1 personas
usuarios 1─N asignaciones
usuarios 1─N reportes_pasante
usuarios 1─N logs
```
