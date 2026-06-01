# Manual de Usuario — SIGMALAB

**Sistema de Gestión de Mantenimiento de Laboratorios**
*ITIC — Universidad Mayor de San Andrés (UMSA)*

---

## Índice

1. [Introducción](#1-introducción)
2. [Acceso al Sistema](#2-acceso-al-sistema)
3. [Roles y Permisos](#3-roles-y-permisos)
4. [Encargado ITIC](#4-encargado-itic)
5. [Pasante Preventivo](#5-pasante-preventivo)
6. [Pasante Correctivo](#6-pasante-correctivo)
7. [Docente](#7-docente)
8. [Estudiante](#8-estudiante)
9. [Invitado](#9-invitado)
10. [Funciones Compartidas](#10-funciones-compartidas)
11. [Solución de Problemas Comunes](#11-solución-de-problemas-comunes)

---

## 1. Introducción

**SIGMALAB** es un sistema web diseñado para gestionar el mantenimiento preventivo y correctivo de los equipos de cómputo de los laboratorios de ITIC — UMSA.

El sistema permite:

- Reportar incidencias en los equipos de laboratorio
- Registrar mantenimientos preventivos y correctivos
- Asignar tareas a pasantes
- Controlar inventario de equipos, periféricos e insumos
- Generar reportes exportables
- Dar seguimiento a todas las operaciones mediante registros de auditoría

---

## 2. Acceso al Sistema

### 2.1 Requisitos

- Navegador web actualizado (Chrome, Firefox, Edge, Safari)
- Conexión a internet o red local
- Credenciales de acceso proporcionadas por el administrador

### 2.2 Ingreso

1. Abrir el navegador e ir a la dirección del sistema:
   - **Local**: `http://localhost:5173`
   - **Red local**: `http://192.168.x.x:5173`
   - **Remoto**: `https://nombre.ngrok-free.app`

2. Ingresar las credenciales:
   - **Usuario**: correo electrónico o registro universitario según el rol
   - **Contraseña**: proporcionada por el administrador

3. Hacer clic en **Ingresar**.

![Pantalla de inicio de sesión](*(description: formulario de login con campos de usuario y contraseña, logo de SIGMALAB y botón Ingresar)*)

### 2.3 Cierre de Sesión

1. Hacer clic en el botón **Cerrar sesión** en la barra superior
2. El sistema redirige a la pantalla de inicio de sesión

### 2.4 Cuentas de Prueba

| Rol | Usuario | Contraseña |
|---|---|---|
| Encargado ITIC | rescobar@umsa.bo | 123456 |
| Pasante Preventivo | 20250001 | 123456 |
| Pasante Correctivo | 20250003 | 123456 |
| Docente | projas@umsa.bo | 123456 |
| Estudiante | 20250005 | 123456 |
| Invitado | invitado@test.com | 123456 |

---

## 3. Roles y Permisos

Cada usuario tiene un **rol** que determina las funciones disponibles:

| Rol | Descripción |
|---|---|
| **Encargado ITIC** | Administrador del sistema. Gestiona usuarios, equipos, mantenimientos, inventario y visualiza todos los reportes. |
| **Pasante Preventivo** | Realiza mantenimientos preventivos, reporta incidencias al encargado, gestiona sus tareas asignadas. |
| **Pasante Correctivo** | Atiende incidencias correctivas, recibe asignaciones del encargado, reporta resultados. |
| **Docente** | Reporta incidencias en los laboratorios y da seguimiento a sus reportes. |
| **Estudiante** | Reporta incidencias en los equipos que utiliza. |
| **Invitado** | Consulta información de equipos, laboratorios e inventario en modo solo lectura. |

---

## 4. Encargado ITIC

El **Encargado ITIC** tiene acceso completo al sistema. Al iniciar sesión, verá el **Dashboard** con indicadores generales.

### 4.1 Dashboard

![Dashboard del encargado](*(description: panel con tarjetas de métricas: equipos totales, mantenimientos del mes, incidencias pendientes, insumos con stock bajo, y gráficos de barras)*)

En el dashboard se muestran:
- **Equipos totales**: cantidad de equipos registrados
- **Mantenimientos del mes**: mantenimientos realizados en el mes actual
- **Incidencias pendientes**: reportes sin resolver
- **Insumos con stock bajo**: alertas de inventario
- **Distribución por laboratorio**: gráfico de equipos por laboratorio
- **Incidencias por prioridad**: gráfico de torta
- **Incidencias por estado**: gráfico de barras
- **Mantenimientos recientes**: tabla con los últimos 5 mantenimientos
- **Incidencias recientes**: tabla con las últimas 5 incidencias

### 4.2 Gestión de Laboratorios

**Ruta**: Menú → Laboratorios

Permite administrar los laboratorios:
- **Listar**: tabla con código, nombre, edificio, piso, capacidad
- **Crear**: formulario con nombre, edificio, piso, capacidades
- **Editar**: modificar datos del laboratorio
- **Eliminar**: desactivar laboratorio (soft-delete)

### 4.3 Gestión de Equipos

**Ruta**: Menú → Equipos

Administración completa del inventario de equipos de cómputo:
- **Listar**: tabla con código ITIC, nombre, laboratorio, ubicación (fila/puesto), SO, estado
- **Filtros**: por laboratorio, estado, búsqueda por código o nombre
- **Crear**: formulario con código, nombre, laboratorio, estado, fila, puesto, marca, modelo, serie, SO
- **Editar**: modificar cualquier campo del equipo
- **Ver detalle**: modal con información general, componentes, periféricos asignados e historial de mantenimientos
- **Eliminar**: desactivar equipo

**Historial de mantenimientos**: desde la tabla, hacer clic en el icono de reloj para ver el historial completo de mantenimientos del equipo.

### 4.4 Gestión de Periféricos

**Ruta**: Menú → Periféricos

Administración de monitores, teclados, mouses y otros periféricos:
- CRUD completo (Crear, Listar, Editar, Eliminar)
- Asignación a laboratorio o equipo específico

### 4.5 Gestión de Insumos

**Ruta**: Menú → Insumos

Control de inventario de insumos y repuestos:
- **Listar**: tabla con nombre, unidad de medida, stock actual, stock mínimo
- **Crear**: registrar nuevo insumo
- **Ajustar stock**: entrada o salida de insumos
- **Alertas**: los insumos con stock por debajo del mínimo se marcan visualmente
- **Eliminar**: desactivar insumo

### 4.6 Gestión de Inventario

**Ruta**: Menú → Inventario

Inventario general de ITIC (equipos, mobiliario, otros):
- CRUD completo con categorías
- Códigos ITIC, facultativo y UMSA
- Asignación a laboratorios o equipos específicos

### 4.7 Gestión de Usuarios

**Ruta**: Menú → Usuarios

Administración de cuentas de usuario:
- **Listar**: tabla con nombres, apellidos, identificador, rol, estado (activo/inactivo), celular
- **Filtros**: búsqueda por texto, filtro por rol, filtro por estado (activos/inactivos/todos)
- **Crear**: formulario con nombres, apellidos, rol, email o registro, contraseña, celular
- **Editar**: modificar datos del usuario y cambiar contraseña
- **Ver perfil**: modal con datos completos del usuario
- **Desactivar/Reactivar**: cambiar estado activo/inactivo (no se elimina físicamente)

### 4.8 Mantenimientos

**Ruta**: Menú → Mantenimientos Preventivos / Correctivos

Visualización de todos los mantenimientos registrados:
- Lista filtrable por laboratorio, estado, técnico
- Vista detallada con checklist e insumos utilizados

### 4.9 Bandeja de Incidencias

**Ruta**: Menú → Bandeja de Incidencias

Todas las incidencias reportadas por cualquier rol:
- **Listar**: tabla con fecha, reportante, rol, título, laboratorio, categoría, prioridad, estado
- **Filtros**: por estado, prioridad, rol reportante, laboratorio, búsqueda de texto
- **Ver detalle**: modal con información completa de la incidencia
- **Asignar**: seleccionar un pasante (preventivo o correctivo) para atender la incidencia
- **Resolver**: cambiar estado y agregar detalle de resolución

### 4.10 Reportes de Pasantes

**Ruta**: Acceso directo desde el dashboard o menú

Reportes enviados por los pasantes:
- **Listar**: tarjetas con título, prioridad, estado, fecha
- **Ver detalle**: modal con información completa
- **Marcar como visto**: cambiar estado a "Visto"
- **Resolver**: cambiar estado a "Resuelto"

### 4.11 Reportes y Exportación

**Ruta**: Menú → Reportes

Generación de reportes exportables:
- Reporte de mantenimientos por rango de fechas
- Reporte de incidencias
- Exportación a **PDF**
- Exportación a **Excel**

### 4.12 Logs del Sistema

**Ruta**: Menú → Logs

Registro de auditoría de todas las operaciones realizadas en el sistema:
- **Listar**: tabla con fecha/hora, usuario, acción, módulo, detalle, entidad
- **Filtros**: búsqueda por texto, filtro por módulo
- Información útil para rastrear cambios y actividades

---

## 5. Pasante Preventivo

### 5.1 Dashboard

Indicadores específicos para el rol preventivo:
- Mantenimientos realizados en el mes
- Incidencias asignadas pendientes
- Próximos mantenimientos programados

### 5.2 Nuevo Mantenimiento Preventivo

**Ruta**: Menú → Nuevo Mantenimiento Preventivo

Registro de un mantenimiento preventivo:

1. **Seleccionar equipo**: buscar por código o nombre
2. **Completar formulario**:
   - Fecha, hora de inicio y fin
   - Técnico responsable
   - Diagnóstico y descripción
3. **Checklist**: marcar estado de cada item:
   - **Hardware**: limpieza, conectores, ventiladores, memoria, disco
   - **Software**: SO, antivirus, actualizaciones, office
   - **Pruebas**: rendimiento, temperatura, estabilidad
   - Cada item se califica como: OK ✓ / Regular ⚠ / Mal ✗
4. **Insumos utilizados**: agregar insumos con cantidades del stock disponible
5. **Guardar**: el registro se guarda y se descuenta del stock

### 5.3 Mis Mantenimientos

**Ruta**: Menú → Mis Mantenimientos

Historial completo de mantenimientos realizados por el pasante:
- Lista filtrable
- Edición de mantenimientos existentes
- Visualización de detalle

### 5.4 Bandeja de Incidencias

**Ruta**: Menú → Bandeja de Incidencias

Incidencias asignadas al pasante y todas las incidencias activas:
- **Ver detalle**: información completa de la incidencia
- **Resolver**: cambiar estado (En proceso, Completado) con detalle de acciones

### 5.5 Reportes al Encargado

**Ruta**: Menú → Reportes al Encargado

Envío de reportes sobre observaciones o problemas detectados:

1. **Seleccionar título**: elegir entre títulos comunes (acordeón):
   - Cables de red desconectados
   - Equipo con comportamiento anómalo
   - Falla en el suministro eléctrico
   - Limpieza general realizada
   - Actualización de software completada
   - Instalación de nuevo equipo
   - Pérdida de conectividad
   - Componente dañado o faltante
   - Ruido anormal en equipos
   - Sobrecalentamiento detectado
   - Problema con proyector
   - Insumo agotado / stock bajo
   - Otro (campo libre)
2. **Completar**: descripción, laboratorio, ubicación, categoría, prioridad
3. **Enviar**: el reporte llega al Encargado ITIC

**Mis reportes enviados**: lista de todos los reportes enviados con su estado actual.

### 5.6 Consulta de Equipos

**Ruta**: Menú → Equipos (solo lectura)

Visualización del inventario de equipos sin opciones de edición.

### 5.7 Insumos Disponibles

**Ruta**: Menú → Insumos Disponibles

Consulta del stock actual de insumos disponibles para usar en mantenimientos.

---

## 6. Pasante Correctivo

### 6.1 Dashboard

Indicadores específicos para el rol correctivo:
- Incidencias asignadas pendientes
- Correctivos realizados en el mes
- Equipos en estado crítico

### 6.2 Nuevo Correctivo

**Ruta**: Menú → Nuevo Correctivo

Registro de un mantenimiento correctivo:
1. **Seleccionar equipo** con problema
2. **Describir**: problema detectado, diagnóstico, acciones realizadas
3. **Componentes afectados**: seleccionar los componentes involucrados
4. **Insumos utilizados**: registrar repuestos o materiales usados
5. **Guardar**: el registro queda disponible para seguimiento

### 6.3 Equipos Asignados

**Ruta**: Menú → Asignados

Incidencias asignadas por el Encargado ITIC:
- **Listar**: tabla con equipo, laboratorio, problema, prioridad, estado
- **Ver detalle**: información completa de la asignación
- **Resolver**: cambiar estado y agregar detalle de resolución

### 6.4 Bandeja de Incidencias

**Ruta**: Menú → Bandeja de Incidencias

Misma funcionalidad que el pasante preventivo: ver y resolver incidencias activas.

### 6.5 Mis Correctivos

**Ruta**: Menú → Mis Correctivos

Historial de todos los mantenimientos correctivos realizados:
- Lista con búsqueda y filtros
- Edición de correctivos existentes

### 6.6 Consulta de Equipos

**Ruta**: Menú → Equipos (solo lectura)

Visualización del inventario sin opciones de edición.

---

## 7. Docente

### 7.1 Dashboard

Vista simplificada con acceso rápido a las funciones principales.

### 7.2 Crear Incidencia

**Ruta**: Menú → Crear Incidencia / Reportar Incidencia

Reportar un problema en un laboratorio:

1. **Completar formulario**:
   - **Laboratorio**: seleccionar el laboratorio donde se detectó el problema
   - **Equipo**: número de equipo específico (opcional)
   - **Título**: breve descripción del problema
   - **Descripción**: detalle completo del problema observado
   - **Categoría**: tipo de problema (Hardware, Software, Red, etc.)
   - **Prioridad**: Alta / Media / Baja
2. **Enviar**: la incidencia llega al Encargado ITIC para su revisión y asignación

### 7.3 Mis Incidencias

**Ruta**: Menú → Mis Incidencias

Seguimiento de todas las incidencias reportadas:
- Estado actual (Nuevo, Visto, En proceso, Resuelto)
- Fecha de reporte
- Detalle de resolución (cuando esté resuelta)

---

## 8. Estudiante

### 8.1 Dashboard

Mismas funciones que el Docente: acceso rápido a reporte de incidencias.

### 8.2 Crear Incidencia

**Ruta**: Menú → Crear Incidencia

Mismo formulario que Docente:
1. Seleccionar laboratorio y equipo
2. Describir el problema
3. Asignar categoría y prioridad
4. Enviar

### 8.3 Mis Incidencias

**Ruta**: Menú → Mis Incidencias

Seguimiento de incidencias reportadas con estado actual.

---

## 9. Invitado

### 9.1 Dashboard

Panel de lectura con resumen general del sistema.

### 9.2 Consultas (Solo Lectura)

El rol Invitado puede navegar y consultar:
- **Equipos**: lista completa del inventario
- **Laboratorios**: información de laboratorios
- **Periféricos**: inventario de periféricos
- **Insumos**: stock de insumos
- **Reportes**: visualización de reportes generados

No tiene opciones de crear, editar o eliminar ningún registro.

---

## 10. Funciones Compartidas

### 10.1 Perfil de Usuario

**Ruta**: Menú → Perfil (icono de usuario en la barra superior)

Visualización y edición del perfil personal:
- **Ver datos**: nombres, apellidos, email, registro, celular, rol
- **Editar perfil**: modificar datos personales
- **Cambiar contraseña**: actualizar la contraseña de acceso
- **Foto de perfil**: cargar o cambiar la foto

### 10.2 Barra de Navegación

![Barra superior](*(description: barra superior con logo SIGMALAB a la izquierda, breadcrumb de navegación en el centro, y nombre de usuario con foto y botón de cerrar sesión a la derecha)*)

- **Logo**: enlace al dashboard
- **Menú lateral**: icono de hamburguesa para mostrar/ocultar el menú
- **Breadcrumb**: ruta de navegación actual
- **Usuario**: nombre del usuario con foto y acceso al perfil

### 10.3 Menú Lateral

![Menú lateral](*(description: panel lateral izquierdo con iconos y nombres de las secciones disponibles según el rol)*)

El menú se adapta automáticamente según el rol del usuario. Las secciones disponibles varían:

**Encargado**: Dashboard, Laboratorios, Equipos, Periféricos, Mant. Preventivos, Mant. Correctivos, Incidencias, Insumos, Inventario, Usuarios, Reportes, Logs

**Preventivo**: Dashboard, Nuevo Mant., Mis Mant., Incidencias, Equipos, Insumos, Reportes

**Correctivo**: Dashboard, Nuevo Correctivo, Asignados, Incidencias, Mis Correctivos, Equipos

**Docente/Estudiante**: Dashboard, Crear Incidencia, Mis Incidencias

**Invitado**: Dashboard, Equipos, Laboratorios, Periféricos, Insumos

### 10.4 Notificaciones

El sistema muestra notificaciones emergentes (toasts) para confirmar acciones:
- ✅ **Verde**: operación exitosa ("Equipo registrado", "Incidencia enviada")
- ❌ **Rojo**: error ("Error al crear usuario", "Credenciales inválidas")
- ⚠ **Amarillo**: advertencia ("Stock bajo")

### 10.5 Exportación de Reportes

Desde la sección Reportes (encargado):
- **Exportar PDF**: genera un documento PDF con los datos filtrados
- **Exportar Excel**: genera un archivo XLSX con los datos filtrados

---

## 11. Solución de Problemas Comunes

### 11.1 No puedo iniciar sesión

**Causas posibles:**
- Credenciales incorrectas
- Cuenta desactivada por el administrador
- Token expirado

**Soluciones:**
1. Verificar que el usuario y contraseña sean correctos
2. Consultar con el administrador si la cuenta está activa
3. Si el sistema muestra pantalla en blanco después del login, limpiar localStorage:
   - Abrir Consola del navegador (F12)
   - Pestaña Application → Local Storage
   - Eliminar `sigmalab.token.v1` y `sigmalab.session.v1`
   - Recargar la página

### 11.2 La página no carga

**Causas:**
- Servidor backend no iniciado
- Puerto incorrecto
- Problema de conexión de red

**Soluciones:**
1. Verificar que el backend esté corriendo (revisar terminal)
2. Verificar que la URL sea correcta
3. Si es conexión remota, verificar que ngrok esté activo

### 11.3 No veo datos en una tabla

**Causas:**
- Filtros activos que ocultan resultados
- Datos no cargados (requiere recargar página)
- Permisos insuficientes para el rol

**Soluciones:**
1. Limpiar todos los filtros aplicados
2. Recargar la página (F5)
3. Verificar con el administrador que tenga los permisos adecuados

### 11.4 Error "No autorizado"

**Causa**: La sesión del usuario no tiene permiso para realizar la acción.

**Solución**: Cada rol tiene permisos específicos. Si necesita realizar una acción no disponible para su rol, contactar al administrador.

### 11.5 Lentitud del sistema

**Causas:**
- Conexión de internet lenta
- Demasiados datos en la tabla
- Servidor con recursos limitados (gratuito)

**Soluciones:**
1. Usar los filtros de búsqueda para reducir resultados
2. Si es conexión remota por ngrok, la velocidad depende del plan gratuito
3. Cerrar sesión y volver a iniciar

---

## Contacto y Soporte

Para problemas técnicos o consultas sobre el sistema:

- **Encargado ITIC**: contactar directamente al administrador del sistema
- **Reportar bug**: abrir issue en el repositorio del proyecto

---

*Documentación generada para el proyecto SIGMALAB — ITIC UMSA*
*Última actualización: mayo 2026*
