-- =============================================================================
-- SIGMALAB — Base de Datos para Gestión de Mantenimiento de Laboratorios
-- Carrera de Informática — Universidad Mayor de San Andrés (UMSA)
-- =============================================================================
-- Diseño normalizado (1FN, 2FN, 3FN) con integridad referencial completa
-- =============================================================================

-- =============================================================================
-- 1. TABLAS DE CATÁLOGO (dominios)
-- =============================================================================

CREATE TABLE edificios (
    id          VARCHAR(10)  PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    ubicacion   VARCHAR(200),
    activo      BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE roles (
    id          VARCHAR(20)  PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    nivel_acceso SMALLINT    NOT NULL CHECK (nivel_acceso BETWEEN 1 AND 100)
);

CREATE TABLE categorias_inventario (
    id          VARCHAR(30)  PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    stock_minimo INT         NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    activo      BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE tipo_mantenimiento (
    id     VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE estado_mantenimiento (
    id     VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE estado_equipo (
    id     VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE estado_incidencia (
    id     VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- =============================================================================
-- 2. TABLAS DE PERSONAS Y USUARIOS
-- =============================================================================

CREATE TABLE personas (
    id              VARCHAR(20)  PRIMARY KEY,
    nombres         VARCHAR(100) NOT NULL,
    paterno         VARCHAR(50)  NOT NULL,
    materno         VARCHAR(50),
    ci              VARCHAR(20)  UNIQUE,
    registro_universitario VARCHAR(20) UNIQUE,
    email           VARCHAR(150) UNIQUE,
    celular         VARCHAR(20),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE usuarios (
    id              VARCHAR(20)  PRIMARY KEY,
    persona_id      VARCHAR(20)  NOT NULL UNIQUE REFERENCES personas(id) ON DELETE CASCADE,
    role_id         VARCHAR(20)  NOT NULL REFERENCES roles(id),
    password_hash   VARCHAR(255) NOT NULL,
    ultimo_acceso   TIMESTAMP,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_role ON usuarios(role_id);

-- =============================================================================
-- 3. TABLAS DE INFRAESTRUCTURA (Laboratorios, Equipos, Periféricos)
-- =============================================================================

CREATE TABLE laboratorios (
    id              VARCHAR(20)  PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    edificio_id     VARCHAR(10)  NOT NULL REFERENCES edificios(id),
    piso            SMALLINT     NOT NULL CHECK (piso >= 0),
    capacidad_equipos  INT       NOT NULL CHECK (capacidad_equipos > 0),
    capacidad_personas INT      NOT NULL CHECK (capacidad_personas > 0),
    encargado_id    VARCHAR(20)  REFERENCES personas(id),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_laboratorios_edificio ON laboratorios(edificio_id);
CREATE INDEX idx_laboratorios_encargado ON laboratorios(encargado_id);

CREATE TABLE equipos (
    codigo          VARCHAR(30)  PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    laboratorio_id  VARCHAR(20)  NOT NULL REFERENCES laboratorios(id),
    fila            VARCHAR(5),
    puesto          VARCHAR(5),
    sistema_operativo VARCHAR(100),
    marca           VARCHAR(50),
    modelo          VARCHAR(100),
    numero_serie    VARCHAR(100) UNIQUE,
    estado_id       VARCHAR(30)  NOT NULL REFERENCES estado_equipo(id),
    fecha_compra    DATE,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_equipo_ubicacion UNIQUE (laboratorio_id, fila, puesto)
);

CREATE INDEX idx_equipos_lab ON equipos(laboratorio_id);
CREATE INDEX idx_equipos_estado ON equipos(estado_id);

CREATE TABLE perifericos (
    id              VARCHAR(30)  PRIMARY KEY,
    tipo            VARCHAR(50)  NOT NULL,
    marca           VARCHAR(50),
    modelo          VARCHAR(100),
    numero_serie    VARCHAR(100),
    laboratorio_id  VARCHAR(20)  REFERENCES laboratorios(id),
    equipo_codigo   VARCHAR(30)  REFERENCES equipos(codigo),
    estado          VARCHAR(30)  NOT NULL DEFAULT 'Funcionando',
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_perifericos_lab ON perifericos(laboratorio_id);
CREATE INDEX idx_perifericos_equipo ON perifericos(equipo_codigo);

-- =============================================================================
-- 4. TABLAS DE INVENTARIO E INSUMOS
-- =============================================================================

CREATE TABLE inventario (
    id              VARCHAR(30)  PRIMARY KEY,
    categoria_id    VARCHAR(30)  NOT NULL REFERENCES categorias_inventario(id),
    codigo_itic     VARCHAR(50)  NOT NULL UNIQUE,
    codigo_facultativo VARCHAR(50),
    codigo_umsa     VARCHAR(50),
    numero_serie    VARCHAR(100),
    marca           VARCHAR(50),
    modelo          VARCHAR(100),
    estado          VARCHAR(30)  NOT NULL DEFAULT 'En almacén',
    fecha_ingreso   DATE         NOT NULL,
    fecha_asignacion DATE,
    laboratorio_id  VARCHAR(20)  REFERENCES laboratorios(id),
    equipo_codigo   VARCHAR(30)  REFERENCES equipos(codigo),
    observaciones   TEXT,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventario_categoria ON inventario(categoria_id);
CREATE INDEX idx_inventario_lab ON inventario(laboratorio_id);

CREATE TABLE insumos (
    nombre          VARCHAR(100) PRIMARY KEY,
    unidad_medida   VARCHAR(30)  NOT NULL,
    stock           INT          NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo    INT          NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insumos_stock ON insumos(stock) WHERE stock <= stock_minimo;

-- =============================================================================
-- 5. TABLAS DE MANTENIMIENTO
-- =============================================================================

CREATE TABLE mantenimientos (
    id              VARCHAR(30)  PRIMARY KEY,
    tipo_id         VARCHAR(20)  NOT NULL REFERENCES tipo_mantenimiento(id),
    equipo_codigo   VARCHAR(30)  NOT NULL REFERENCES equipos(codigo),
    tecnico_id      VARCHAR(20)  NOT NULL REFERENCES usuarios(id),
    laboratorio_id  VARCHAR(20)  REFERENCES laboratorios(id),
    fecha           DATE         NOT NULL,
    hora_inicio     TIME,
    hora_fin        TIME,
    estado_id       VARCHAR(20)  NOT NULL REFERENCES estado_mantenimiento(id),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_horas CHECK (hora_fin IS NULL OR hora_inicio IS NULL OR hora_fin > hora_inicio)
);

CREATE INDEX idx_mantenimientos_equipo ON mantenimientos(equipo_codigo);
CREATE INDEX idx_mantenimientos_tecnico ON mantenimientos(tecnico_id);
CREATE INDEX idx_mantenimientos_fecha ON mantenimientos(fecha DESC);
CREATE INDEX idx_mantenimientos_estado ON mantenimientos(estado_id);

CREATE TABLE mantenimientos_detalle (
    id              VARCHAR(30)  PRIMARY KEY,
    mantenimiento_id VARCHAR(30) NOT NULL UNIQUE REFERENCES mantenimientos(id) ON DELETE CASCADE,
    descripcion     TEXT,
    diagnostico     TEXT,
    accion_realizada TEXT,
    resolucion      TEXT,
    tipo_incidencia VARCHAR(50),
    estado_final    VARCHAR(50),
    observaciones   TEXT,
    recomendaciones TEXT
);

CREATE TABLE checklists (
    id              VARCHAR(30)  PRIMARY KEY,
    detalle_id      VARCHAR(30)  NOT NULL REFERENCES mantenimientos_detalle(id) ON DELETE CASCADE,
    categoria       VARCHAR(30)  NOT NULL CHECK (categoria IN ('hardware', 'software', 'pruebas')),
    item            VARCHAR(200) NOT NULL,
    estado          VARCHAR(20)  NOT NULL CHECK (estado IN ('OK', 'Regular', 'Mal')),
    observacion     TEXT
);

CREATE INDEX idx_checklists_detalle ON checklists(detalle_id);

CREATE TABLE insumos_usados (
    id              VARCHAR(30)  PRIMARY KEY,
    detalle_id      VARCHAR(30)  NOT NULL REFERENCES mantenimientos_detalle(id) ON DELETE CASCADE,
    insumo_nombre   VARCHAR(100) NOT NULL REFERENCES insumos(nombre),
    cantidad        VARCHAR(50)  NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insumos_usados_detalle ON insumos_usados(detalle_id);

-- =============================================================================
-- 6. TABLAS DE INCIDENCIAS Y ASIGNACIONES
-- =============================================================================

CREATE TABLE incidencias (
    id              VARCHAR(30)  PRIMARY KEY,
    equipo_codigo   VARCHAR(30)  REFERENCES equipos(codigo),
    laboratorio_id  VARCHAR(20)  REFERENCES laboratorios(id),
    usuario_id      VARCHAR(20)  REFERENCES usuarios(id),
    persona_id      VARCHAR(20)  REFERENCES personas(id),
    problema        TEXT         NOT NULL,
    requiere_seguimiento BOOLEAN NOT NULL DEFAULT FALSE,
    estado_id       VARCHAR(20)  NOT NULL REFERENCES estado_incidencia(id),
    fecha           TIMESTAMP    NOT NULL DEFAULT NOW(),
    resuelta_en     TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidencias_equipo ON incidencias(equipo_codigo);
CREATE INDEX idx_incidencias_estado ON incidencias(estado_id);
CREATE INDEX idx_incidencias_fecha ON incidencias(fecha DESC);

CREATE TABLE asignaciones (
    id              VARCHAR(30)  PRIMARY KEY,
    equipo_codigo   VARCHAR(30)  NOT NULL REFERENCES equipos(codigo),
    laboratorio_id  VARCHAR(20)  REFERENCES laboratorios(id),
    tecnico_id      VARCHAR(20)  NOT NULL REFERENCES usuarios(id),
    problema        TEXT         NOT NULL,
    prioridad       VARCHAR(10)  NOT NULL DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
    fecha           DATE         NOT NULL DEFAULT CURRENT_DATE,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En proceso', 'Completado')),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asignaciones_tecnico ON asignaciones(tecnico_id);
CREATE INDEX idx_asignaciones_estado ON asignaciones(estado);

-- =============================================================================
-- 7. TABLAS DE REPORTES, LOGS Y COMUNICACIÓN
-- =============================================================================

CREATE TABLE reportes_pasante (
    id                VARCHAR(30)  PRIMARY KEY,
    pasante_id        VARCHAR(20)  NOT NULL REFERENCES usuarios(id),
    titulo            VARCHAR(200) NOT NULL,
    descripcion       TEXT         NOT NULL,
    laboratorio_id    VARCHAR(20)  REFERENCES laboratorios(id),
    ubicacion         VARCHAR(200),
    categoria         VARCHAR(50),
    prioridad         VARCHAR(10)  NOT NULL DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
    fecha             TIMESTAMP    NOT NULL DEFAULT NOW(),
    estado            VARCHAR(20)  NOT NULL DEFAULT 'Nuevo' CHECK (estado IN ('Nuevo', 'Visto', 'En proceso', 'Resuelto')),
    resolucion_detalle TEXT,
    atendido_por      VARCHAR(20)  REFERENCES usuarios(id),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reportes_pasante ON reportes_pasante(pasante_id);
CREATE INDEX idx_reportes_estado ON reportes_pasante(estado);

CREATE TABLE logs (
    id              VARCHAR(30)  PRIMARY KEY,
    timestamp       TIMESTAMP    NOT NULL DEFAULT NOW(),
    usuario_id      VARCHAR(20)  REFERENCES usuarios(id),
    accion          VARCHAR(100) NOT NULL,
    detalle         TEXT,
    modulo          VARCHAR(50),
    entidad         VARCHAR(50),
    equipo_codigo   VARCHAR(30),
    tipo_accion     VARCHAR(20)  CHECK (tipo_accion IN ('Crear', 'Editar', 'Eliminar', 'Asignar', 'Resolver', 'Actualizar', 'Otro')),
    estado          VARCHAR(20)  NOT NULL DEFAULT 'Éxito' CHECK (estado IN ('Éxito', 'Error', 'Advertencia')),
    ip_origen       VARCHAR(45)
);

CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX idx_logs_usuario ON logs(usuario_id);
CREATE INDEX idx_logs_modulo ON logs(modulo);

-- =============================================================================
-- 8. TABLAS ACADÉMICAS (Carrera de Informática UMSA)
-- =============================================================================

CREATE TABLE materias (
    codigo          VARCHAR(20)  PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    sigla           VARCHAR(10)  NOT NULL UNIQUE,
    nivel           SMALLINT     NOT NULL CHECK (nivel BETWEEN 1 AND 10),
    horas_teoricas  INT          NOT NULL DEFAULT 0 CHECK (horas_teoricas >= 0),
    horas_practicas INT          NOT NULL DEFAULT 0 CHECK (horas_practicas >= 0),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE grupos (
    id              VARCHAR(30)  PRIMARY KEY,
    materia_codigo  VARCHAR(20)  NOT NULL REFERENCES materias(codigo),
    numero_grupo    VARCHAR(5)   NOT NULL,
    gestion         INT          NOT NULL CHECK (gestion >= 2000),
    periodo         VARCHAR(10)  NOT NULL CHECK (periodo IN ('1-2026', '2-2026', 'Verano', 'Invierno')),
    docente_id      VARCHAR(20)  REFERENCES personas(id),
    cupo_maximo     INT          NOT NULL CHECK (cupo_maximo > 0),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_grupo_materia UNIQUE (materia_codigo, numero_grupo, gestion, periodo)
);

CREATE INDEX idx_grupos_materia ON grupos(materia_codigo);
CREATE INDEX idx_grupos_docente ON grupos(docente_id);

CREATE TABLE horarios (
    id              VARCHAR(30)  PRIMARY KEY,
    grupo_id        VARCHAR(30)  NOT NULL REFERENCES grupos(id),
    laboratorio_id  VARCHAR(20)  NOT NULL REFERENCES laboratorios(id),
    dia_semana      SMALLINT     NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
    hora_inicio     TIME         NOT NULL,
    hora_fin        TIME         NOT NULL,
    tipo_clase      VARCHAR(20)  NOT NULL DEFAULT 'Práctica' CHECK (tipo_clase IN ('Teoría', 'Práctica', 'Laboratorio', 'Tutorial')),
    CONSTRAINT ck_horario CHECK (hora_fin > hora_inicio),
    CONSTRAINT uq_horario_lab UNIQUE (laboratorio_id, dia_semana, hora_inicio)
);

CREATE INDEX idx_horarios_grupo ON horarios(grupo_id);
CREATE INDEX idx_horarios_lab ON horarios(laboratorio_id);

-- =============================================================================
-- 9. TABLAS DE INSCRIPCIÓN Y USO DE LABORATORIOS
-- =============================================================================

CREATE TABLE inscripciones (
    id              VARCHAR(30)  PRIMARY KEY,
    persona_id      VARCHAR(20)  NOT NULL REFERENCES personas(id),
    grupo_id        VARCHAR(30)  NOT NULL REFERENCES grupos(id),
    fecha_inscripcion DATE       NOT NULL DEFAULT CURRENT_DATE,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_inscripcion UNIQUE (persona_id, grupo_id)
);

CREATE INDEX idx_inscripciones_persona ON inscripciones(persona_id);
CREATE INDEX idx_inscripciones_grupo ON inscripciones(grupo_id);

CREATE TABLE uso_laboratorio (
    id              VARCHAR(30)  PRIMARY KEY,
    laboratorio_id  VARCHAR(20)  NOT NULL REFERENCES laboratorios(id),
    grupo_id        VARCHAR(30)  REFERENCES grupos(id),
    persona_id      VARCHAR(20)  REFERENCES personas(id),
    fecha           DATE         NOT NULL,
    hora_ingreso    TIMESTAMP    NOT NULL,
    hora_salida     TIMESTAMP,
    motivo          VARCHAR(200),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uso_lab_fecha ON uso_laboratorio(fecha DESC);
CREATE INDEX idx_uso_lab_lab ON uso_laboratorio(laboratorio_id);

-- =============================================================================
-- 10. FUNCIONES Y TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_personas_updated
    BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_usuarios_updated
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_laboratorios_updated
    BEFORE UPDATE ON laboratorios
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_equipos_updated
    BEFORE UPDATE ON equipos
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_insumos_updated
    BEFORE UPDATE ON insumos
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_mantenimientos_updated
    BEFORE UPDATE ON mantenimientos
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_incidencias_updated
    BEFORE UPDATE ON incidencias
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_asignaciones_updated
    BEFORE UPDATE ON asignaciones
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- Actualizar estado del equipo cuando se crea un mantenimiento
CREATE OR REPLACE FUNCTION actualizar_estado_equipo_mantenimiento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado_id IN ('programado', 'en_proceso') THEN
        UPDATE equipos SET estado_id = 'en_mantenimiento', updated_at = NOW()
        WHERE codigo = NEW.equipo_codigo;
    ELSIF NEW.estado_id IN ('completado', 'resuelto') THEN
        UPDATE equipos SET estado_id = 'funcionando', updated_at = NOW()
        WHERE codigo = NEW.equipo_codigo;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mantenimiento_estado_equipo
    AFTER INSERT OR UPDATE OF estado_id ON mantenimientos
    FOR EACH ROW EXECUTE FUNCTION actualizar_estado_equipo_mantenimiento();

-- Actualizar stock de insumos al registrar uso
CREATE OR REPLACE FUNCTION descontar_insumo()
RETURNS TRIGGER AS $$
DECLARE
    cant_numerica INT;
BEGIN
    BEGIN
        cant_numerica := CAST(NEW.cantidad AS INT);
    EXCEPTION WHEN OTHERS THEN
        cant_numerica := 0;
    END;
    IF cant_numerica > 0 THEN
        UPDATE insumos
        SET stock = GREATEST(0, stock - cant_numerica)
        WHERE nombre = NEW.insumo_nombre;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_insumos_usados_descontar
    AFTER INSERT ON insumos_usados
    FOR EACH ROW EXECUTE FUNCTION descontar_insumo();

-- =============================================================================
-- 11. INSERCIONES DE DATOS — CATÁLOGOS
-- =============================================================================

INSERT INTO roles (id, nombre, descripcion, nivel_acceso) VALUES
    ('encargado',   'Encargado ITIC',       'Administrador del sistema, gestión completa', 100),
    ('preventivo',  'Pasante Preventivo',   'Mantenimiento preventivo de equipos',          70),
    ('correctivo',  'Pasante Correctivo',   'Mantenimiento correctivo y reparaciones',      70),
    ('docente',     'Docente',              'Reporta incidencias en laboratorios',           40),
    ('estudiante',  'Estudiante',           'Reporta incidencias en laboratorios',           30),
    ('invitado',    'Invitado',             'Solo lectura de información pública',           10);

INSERT INTO edificios (id, nombre, ubicacion) VALUES
    ('PPAL', 'Edificio Principal', 'Campus Universitario, Av. Villazón Nro. 1995'),
    ('LASIN', 'Edificio LASIN', 'Campus Universitario, Calle 30 de Octubre'),
    ('MONOBLOCK', 'Monoblock Central', 'Av. Villazón, frente a la Plaza del Bicentenario');

INSERT INTO estado_equipo (id, nombre) VALUES
    ('funcionando',         'Funcionando'),
    ('en_mantenimiento',    'En mantenimiento'),
    ('pendiente',           'Pendiente'),
    ('en_espera_repuesto',  'En espera repuesto'),
    ('de_baja',             'De baja');

INSERT INTO tipo_mantenimiento (id, nombre) VALUES
    ('preventivo', 'Preventivo'),
    ('correctivo', 'Correctivo');

INSERT INTO estado_mantenimiento (id, nombre) VALUES
    ('programado',  'Programado'),
    ('en_proceso',  'En proceso'),
    ('completado',  'Completado'),
    ('resuelto',    'Resuelto'),
    ('pendiente',   'Pendiente');

INSERT INTO estado_incidencia (id, nombre) VALUES
    ('nuevo',       'Nuevo'),
    ('en_proceso',  'En proceso'),
    ('resuelto',    'Resuelto'),
    ('cerrado',     'Cerrado'),
    ('rechazado',   'Rechazado');

INSERT INTO categorias_inventario (id, nombre, stock_minimo, activo) VALUES
    ('monitor',         'Monitor',             2,  TRUE),
    ('teclado',         'Teclado',             3,  TRUE),
    ('mouse',           'Mouse',               3,  TRUE),
    ('fuente_poder',    'Fuente de poder',     2,  TRUE),
    ('placa_madre',     'Placa madre',         1,  TRUE),
    ('disco_duro',      'Disco duro',          3,  TRUE),
    ('memoria_ram',     'Memoria RAM',         4,  TRUE),
    ('microprocesador', 'Microprocesador',     2,  TRUE),
    ('tarjeta_video',   'Tarjeta de video',    1,  TRUE),
    ('cooler',          'Cooler',              2,  TRUE),
    ('cable_sata',      'Cable SATA',          5,  TRUE),
    ('cortapicos',      'Cortapicos',          2,  TRUE),
    ('otro',            'Otro',                0,  TRUE);

-- =============================================================================
-- 12. INSERCIONES — PERSONAS (UMSA Informática)
-- =============================================================================

INSERT INTO personas (id, nombres, paterno, materno, ci, registro_universitario, email, celular) VALUES
    -- Personal administrativo ITIC
    ('P-ENC-001', 'Reynaldo',   'Escobar',    'Quispe',  '4455667 LP',  NULL,           'rescobar@umsa.bo',     '+591 70011223'),
    ('P-ADM-001', 'Patricia',   'Rojas',      'Vargas',  '3344556 LP',  NULL,           'projas@umsa.bo',       '+591 71234567'),
    -- Pasantes preventivos
    ('P-PRE-001', 'Yennifer',   'Sarzuri',    'Mamani',  '9988776 LP',  '20250001',     'ysarzuri@est.umsa.bo', '+591 76543210'),
    ('P-PRE-002', 'Carla',      'Mendoza',    'Flores',  '8877665 LP',  '20250002',     'cmendoza@est.umsa.bo', '+591 72456890'),
    ('P-PRE-003', 'Miguel',     'Quispe',     'Callisaya', '7766554 LP', '20250006',    'mquispe@est.umsa.bo',  '+591 61234567'),
    -- Pasantes correctivos
    ('P-COR-001', 'Jhonny',     'Arias',      'Choque',  '6655443 LP',  '20250003',     'jarias@est.umsa.bo',   '+591 79988776'),
    ('P-COR-002', 'Mauricio',   'Quispe',     'Mamani',  '5544332 LP',  '20250004',     'mquispe2@est.umsa.bo', '+591 68877665'),
    -- Docentes
    ('P-DOC-001', 'Juan Carlos', 'Mamani',    'García',  '1122334 LP',  NULL,           'jcmamani@umsa.bo',     '+591 71555666'),
    ('P-DOC-002', 'María Elena', 'Vargas',    'López',   '2233445 LP',  NULL,           'mvargas@umsa.bo',      '+591 72555444'),
    ('P-DOC-003', 'Pedro',       'Quispe',    'Huanca',  '3344557 LP',  NULL,           'pquispe@umsa.bo',      '+591 73555333'),
    ('P-DOC-004', 'Ana',         'Condori',   'Pérez',   '4455668 LP',  NULL,           'acondori@umsa.bo',     '+591 74555222'),
    ('P-DOC-005', 'Luis Alberto', 'Flores',   'Ticona',  '5566778 LP',  NULL,           'lflores@umsa.bo',      '+591 75555111'),
    -- Estudiantes
    ('P-EST-001', 'Luis',        'Mendoza',   'Flores',  NULL,           '20250005',     'lmendoza@est.umsa.bo', '+591 77665544'),
    ('P-EST-002', 'Rosa',        'Huanca',    'Choque',  NULL,           '20250007',     'rhuanca@est.umsa.bo',  '+591 60123456'),
    ('P-EST-003', 'Carlos',      'Torrez',    'Alanoca', NULL,           '20250008',     'ctorrez@est.umsa.bo',  '+591 60234567'),
    -- Invitado demo
    ('P-INV-001', 'Visitante',   'Demo',      NULL,      NULL,           NULL,           'invitado@test.com',    NULL);

-- =============================================================================
-- 13. INSERCIONES — USUARIOS
-- =============================================================================

-- Contraseña: '123456' hasheada con bcrypt (salt 12)
INSERT INTO usuarios (id, persona_id, role_id, password_hash, activo) VALUES
    ('u-admin',    'P-ENC-001', 'encargado',  '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-docente',  'P-ADM-001', 'docente',    '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-prev',     'P-PRE-001', 'preventivo', '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-prev2',    'P-PRE-002', 'preventivo', '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-prev3',    'P-PRE-003', 'preventivo', '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-corr',     'P-COR-001', 'correctivo', '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-corr2',    'P-COR-002', 'correctivo', '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-doc1',     'P-DOC-001', 'docente',    '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-doc2',     'P-DOC-002', 'docente',    '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-doc3',     'P-DOC-003', 'docente',    '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-doc4',     'P-DOC-004', 'docente',    '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-doc5',     'P-DOC-005', 'docente',    '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-est',      'P-EST-001', 'estudiante', '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-est2',     'P-EST-002', 'estudiante', '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-est3',     'P-EST-003', 'estudiante', '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE),
    ('u-invitado', 'P-INV-001', 'invitado',   '$2a$12$daKK5TvSFlj0Z2RMNDsjoeXfxl3gFIEODY91q2r/APrywNg08Vlf2', TRUE);

-- =============================================================================
-- 14. INSERCIONES — LABORATORIOS Y EQUIPOS
-- =============================================================================

INSERT INTO laboratorios (id, nombre, edificio_id, piso, capacidad_equipos, capacidad_personas, encargado_id) VALUES
    ('LAB1',    'Laboratorio 1',  'PPAL', 1, 25, 30, 'P-ENC-001'),
    ('LAB2',    'Laboratorio 2',  'PPAL', 1, 20, 25, 'P-ENC-001'),
    ('LAB3',    'Laboratorio 3',  'PPAL', 2, 22, 28, 'P-ENC-001'),
    ('LAB4',    'Laboratorio 4',  'PPAL', 2, 20, 25, 'P-ENC-001'),
    ('LASIN1',  'LASIN 1',        'LASIN', 1, 18, 22, 'P-ENC-001'),
    ('LASIN2',  'LASIN 2',        'LASIN', 1, 15, 20, 'P-ENC-001'),
    ('LASIN3',  'LASIN 3',        'LASIN', 2, 15, 20, 'P-ENC-001'),
    ('LABM1',   'Laboratorio Móvil 1', 'MONOBLOCK', 0, 10, 15, 'P-ENC-001');

INSERT INTO equipos (codigo, nombre, laboratorio_id, fila, puesto, sistema_operativo, marca, modelo, numero_serie, estado_id, fecha_compra) VALUES
    -- LAB1
    ('PC-LAB1-001', 'HP ProDesk 600 G6',  'LAB1', 'A', '01', 'Windows 11 Pro',  'HP',     'ProDesk 600 G6',  'MXL2345A1B', 'funcionando', '2023-03-15'),
    ('PC-LAB1-002', 'Dell OptiPlex 7090', 'LAB1', 'A', '02', 'Windows 11 Pro',  'Dell',   'OptiPlex 7090',   'DLL789X45',   'funcionando', '2023-03-15'),
    ('PC-LAB1-003', 'Lenovo ThinkCentre M70q', 'LAB1', 'A', '03', 'Windows 10 Pro', 'Lenovo', 'ThinkCentre M70q', 'LNV45612',   'en_mantenimiento', '2022-06-20'),
    ('PC-LAB1-004', 'HP ProDesk 600 G6',  'LAB1', 'A', '04', 'Windows 11 Pro',  'HP',     'ProDesk 600 G6',  'MXL2345A2C',  'funcionando', '2023-03-15'),
    ('PC-LAB1-005', 'HP ProDesk 600 G6',  'LAB1', 'A', '05', 'Windows 11 Pro',  'HP',     'ProDesk 600 G6',  'MXL2345A3D',  'funcionando', '2023-03-15'),
    ('PC-LAB1-006', 'HP ProDesk 600 G6',  'LAB1', 'B', '01', 'Windows 11 Pro',  'HP',     'ProDesk 600 G6',  'MXL2345A4E',  'funcionando', '2023-03-15'),
    -- LAB2
    ('PC-LAB2-001', 'HP EliteDesk 800 G8', 'LAB2', 'B', '01', 'Windows 11 Pro',  'HP',     'EliteDesk 800 G8','MXL667712',  'funcionando', '2024-01-10'),
    ('PC-LAB2-002', 'Dell OptiPlex 7080', 'LAB2', 'B', '02', 'Windows 11 Pro',  'Dell',   'OptiPlex 7080',   'DLL998844',   'funcionando', '2024-01-10'),
    ('PC-LAB2-003', 'Dell OptiPlex 7080', 'LAB2', 'B', '03', 'Windows 11 Pro',  'Dell',   'OptiPlex 7080',   'DLL998855',   'funcionando', '2024-01-10'),
    ('PC-LAB2-004', 'HP EliteDesk 800 G8', 'LAB2', 'C', '01', 'Windows 11 Pro',  'HP',     'EliteDesk 800 G8','MXL667723',  'funcionando', '2024-01-10'),
    ('PC-LAB2-005', 'Dell Vostro 3681',   'LAB2', 'C', '02', 'Windows 10 Pro',  'Dell',   'Vostro 3681',     'DLL112233',   'pendiente',   '2022-08-20'),
    -- LAB3
    ('PC-LAB3-001', 'HP ProDesk 400 G7',  'LAB3', 'C', '01', 'Windows 11 Pro',  'HP',     'ProDesk 400 G7',  'MXL998866',   'funcionando', '2023-10-05'),
    ('PC-LAB3-002', 'HP ProDesk 400 G7',  'LAB3', 'C', '02', 'Windows 11 Pro',  'HP',     'ProDesk 400 G7',  'MXL998877',   'funcionando', '2023-10-05'),
    ('PC-LAB3-003', 'HP ProDesk 400 G7',  'LAB3', 'C', '03', 'Windows 11 Pro',  'HP',     'ProDesk 400 G7',  'MXL998888',   'funcionando', '2023-10-05'),
    ('PC-LAB3-004', 'Lenovo ThinkCentre M80q', 'LAB3', 'D', '01', 'Ubuntu 22.04',  'Lenovo',  'ThinkCentre M80q','LNV556677',  'funcionando', '2024-06-15'),
    -- LAB4
    ('PC-LAB4-001', 'HP ProDesk 400 G7',  'LAB4', 'D', '01', 'Windows 10 Pro',  'HP',     'ProDesk 400 G7',  'MXL999900',   'funcionando', '2023-10-05'),
    ('PC-LAB4-002', 'HP ProDesk 400 G7',  'LAB4', 'D', '02', 'Windows 10 Pro',  'HP',     'ProDesk 400 G7',  'MXL999911',   'funcionando', '2023-10-05'),
    ('PC-LAB4-007', 'Lenovo ThinkCentre M90q', 'LAB4', 'D', '07', 'Windows 11 Pro', 'Lenovo', 'ThinkCentre M90q','LNV778899',  'de_baja',     '2021-02-10'),
    -- LASIN1
    ('PC-LASIN1-001', 'Dell OptiPlex 5080', 'LASIN1', 'E', '01', 'Ubuntu 22.04', 'Dell',   'OptiPlex 5080',   'DLL112244',   'funcionando', '2023-05-20'),
    ('PC-LASIN1-002', 'Dell OptiPlex 5080', 'LASIN1', 'E', '02', 'Ubuntu 22.04', 'Dell',   'OptiPlex 5080',   'DLL112255',   'funcionando', '2023-05-20'),
    ('PC-LASIN1-003', 'Dell OptiPlex 5080', 'LASIN1', 'E', '03', 'Ubuntu 22.04', 'Dell',   'OptiPlex 5080',   'DLL112266',   'funcionando', '2023-05-20'),
    ('PC-LASIN1-004', 'Dell OptiPlex 5080', 'LASIN1', 'E', '04', 'Ubuntu 22.04', 'Dell',   'OptiPlex 5080',   'DLL334455',   'en_espera_repuesto', '2023-05-20'),
    -- LASIN2
    ('PC-LASIN2-001', 'HP ProDesk 400 G7',  'LASIN2', 'F', '01', 'Windows 10 Pro', 'HP',    'ProDesk 400 G7',  'MXL887766',   'funcionando', '2024-02-01');

INSERT INTO perifericos (id, tipo, marca, modelo, numero_serie, equipo_codigo, laboratorio_id, estado) VALUES
    ('UMSA-INF-2024-101', 'Monitor',   'Samsung', 'S22F350',  'SAM2245X',  'PC-LAB1-001', NULL, 'Funcionando'),
    ('UMSA-INF-2024-102', 'Teclado',   'Logitech','K120',     'LGT88121',  'PC-LAB1-001', NULL, 'Funcionando'),
    ('UMSA-INF-2024-103', 'Mouse',     'Logitech','M100',     'LGT77234',  'PC-LAB1-001', NULL, 'Funcionando'),
    ('UMSA-INF-2024-104', 'Monitor',   'LG',      '20MK400',  'LG998812',  'PC-LAB2-001', NULL, 'Funcionando'),
    ('UMSA-INF-2024-105', 'Teclado',   'Genius',  'KB-110X',  'GEN334455', NULL,          'LAB4', 'De baja'),
    ('UMSA-INF-2024-106', 'Impresora', 'HP',      'LaserJet M404', 'HP445566', NULL,     'LAB1', 'En mantenimiento'),
    ('UMSA-INF-2024-107', 'Proyector', 'Epson',   'PowerLite X41+', 'EPS112233', NULL,   'LAB3', 'Funcionando'),
    ('UMSA-INF-2024-108', 'Switch',    'TP-Link', 'TL-SG1024', 'TPL778899', NULL,         'LASIN1', 'Funcionando');

-- =============================================================================
-- 15. INSERCIONES — MATERIAS (Carrera de Informática UMSA)
-- =============================================================================

INSERT INTO materias (codigo, nombre, sigla, nivel, horas_teoricas, horas_practicas) VALUES
    ('INF-111', 'Introducción a la Informática',           'INF-111', 1, 4, 2),
    ('INF-112', 'Matemática Discreta',                     'INF-112', 1, 4, 2),
    ('INF-121', 'Programación I',                          'INF-121', 2, 3, 4),
    ('INF-122', 'Álgebra Lineal',                          'INF-122', 2, 4, 2),
    ('INF-211', 'Estructuras de Datos',                    'INF-211', 3, 3, 4),
    ('INF-212', 'Base de Datos I',                         'INF-212', 3, 3, 3),
    ('INF-221', 'Programación II',                         'INF-221', 4, 3, 4),
    ('INF-222', 'Arquitectura de Computadoras',            'INF-222', 4, 3, 3),
    ('INF-311', 'Redes de Computadoras',                   'INF-311', 5, 3, 3),
    ('INF-312', 'Ingeniería de Software',                  'INF-312', 5, 4, 2),
    ('INF-321', 'Sistemas Operativos',                     'INF-321', 6, 3, 3),
    ('INF-322', 'Base de Datos II',                        'INF-322', 6, 3, 3),
    ('INF-411', 'Inteligencia Artificial',                 'INF-411', 7, 3, 3),
    ('INF-412', 'Taller de Sistemas de Información',       'INF-412', 7, 2, 4),
    ('INF-421', 'Proyecto de Grado I',                     'INF-421', 8, 2, 4),
    ('INF-422', 'Ética y Legislación Informática',          'INF-422', 8, 3, 0);

-- =============================================================================
-- 16. INSERCIONES — GRUPOS Y HORARIOS
-- =============================================================================

INSERT INTO grupos (id, materia_codigo, numero_grupo, gestion, periodo, docente_id, cupo_maximo) VALUES
    ('G-INF121-A', 'INF-121', 'A', 2026, '1-2026', 'P-DOC-001', 40),
    ('G-INF121-B', 'INF-121', 'B', 2026, '1-2026', 'P-DOC-001', 35),
    ('G-INF211-A', 'INF-211', 'A', 2026, '1-2026', 'P-DOC-002', 40),
    ('G-INF212-A', 'INF-212', 'A', 2026, '1-2026', 'P-DOC-003', 35),
    ('G-INF221-A', 'INF-221', 'A', 2026, '1-2026', 'P-DOC-004', 35),
    ('G-INF311-A', 'INF-311', 'A', 2026, '1-2026', 'P-DOC-005', 30),
    ('G-INF312-A', 'INF-312', 'A', 2026, '1-2026', 'P-DOC-002', 35),
    ('G-INF321-A', 'INF-321', 'A', 2026, '1-2026', 'P-DOC-005', 30);

INSERT INTO horarios (id, grupo_id, laboratorio_id, dia_semana, hora_inicio, hora_fin, tipo_clase) VALUES
    ('H-INF121-A-L1', 'G-INF121-A', 'LAB1', 2, '08:30', '10:00', 'Práctica'),    -- Martes
    ('H-INF121-A-L2', 'G-INF121-A', 'LAB1', 4, '08:30', '10:00', 'Práctica'),    -- Jueves
    ('H-INF121-B-L1', 'G-INF121-B', 'LAB2', 2, '10:15', '11:45', 'Práctica'),
    ('H-INF121-B-L2', 'G-INF121-B', 'LAB2', 4, '10:15', '11:45', 'Práctica'),
    ('H-INF211-A-L1', 'G-INF211-A', 'LAB3', 1, '14:00', '15:30', 'Práctica'),    -- Lunes
    ('H-INF211-A-L2', 'G-INF211-A', 'LAB3', 3, '14:00', '15:30', 'Práctica'),    -- Miércoles
    ('H-INF212-A-L1', 'G-INF212-A', 'LASIN1', 2, '14:00', '15:30', 'Práctica'),
    ('H-INF212-A-L2', 'G-INF212-A', 'LASIN1', 4, '14:00', '15:30', 'Práctica'),
    ('H-INF221-A-L1', 'G-INF221-A', 'LAB4', 3, '08:30', '10:00', 'Práctica'),
    ('H-INF221-A-L2', 'G-INF221-A', 'LAB4', 5, '08:30', '10:00', 'Práctica'),    -- Viernes
    ('H-INF311-A-L1', 'G-INF311-A', 'LASIN2', 1, '10:15', '11:45', 'Práctica'),
    ('H-INF321-A-L1', 'G-INF321-A', 'LASIN3', 5, '14:00', '15:30', 'Práctica');

-- =============================================================================
-- 17. INSERCIONES — INSUMOS
-- =============================================================================

INSERT INTO insumos (nombre, unidad_medida, stock, stock_minimo) VALUES
    ('Alcohol isopropílico',    'ml',           2400, 500),
    ('Paños de microfibra',     'unidades',     35,   10),
    ('Hisopos/brochas',         'unidades',     80,   20),
    ('Pasta térmica',           'aplicaciones', 12,   5),
    ('Aire comprimido',         'segundos',     1800, 600),
    ('Cables SATA',             'unidades',     25,   5),
    ('Tornillos para disco',    'unidades',     120,  20),
    ('Bridas plásticas',        'unidades',     200,  30),
    ('Pulsera antiestática',    'unidades',     8,    2),
    ('Limpiador de pantalla',   'ml',           800,  200);

-- =============================================================================
-- 18. INSERCIONES — INVENTARIO
-- =============================================================================

INSERT INTO inventario (id, categoria_id, codigo_itic, codigo_facultativo, codigo_umsa, numero_serie, marca, modelo, estado, fecha_ingreso, fecha_asignacion, laboratorio_id, equipo_codigo) VALUES
    ('INV-0001', 'monitor',   'ITIC-MON-0001', 'FAC-2024-101', 'UMSA-INF-2024-101', 'SAM2245X',  'Samsung',       'S22F350',       'Operativo',     '2024-03-15', '2024-04-01', 'LAB1',  'PC-LAB1-001'),
    ('INV-0002', 'teclado',   'ITIC-TEC-0001', 'FAC-2024-102', 'UMSA-INF-2024-102', 'LGT88121',  'Logitech',      'K120',          'Operativo',     '2024-03-15', '2024-04-01', 'LAB1',  'PC-LAB1-001'),
    ('INV-0003', 'mouse',     'ITIC-MSE-0001', 'FAC-2024-103', 'UMSA-INF-2024-103', 'LGT77234',  'Logitech',      'M100',          'Operativo',     '2024-03-15', '2024-04-01', 'LAB1',  'PC-LAB1-001'),
    ('INV-0004', 'monitor',   'ITIC-MON-0002', 'FAC-2024-110', 'UMSA-INF-2024-110', 'LG998812',  'LG',            '20MK400',       'Operativo',     '2024-05-02', '2024-05-10', 'LAB2',  NULL),
    ('INV-0005', 'disco_duro','ITIC-HDD-0001', 'FAC-2024-201', NULL,                'WD500987',  'Western Digital','Blue 1TB',     'En almacén',    '2024-08-20', NULL,         NULL,   NULL),
    ('INV-0006', 'memoria_ram','ITIC-RAM-0001',NULL,            NULL,                'KGT44521',  'Kingston',      'Fury 8GB DDR4', 'En almacén',    '2024-09-10', NULL,         NULL,   NULL),
    ('INV-0007', 'fuente_poder','ITIC-PSU-0001',NULL,           NULL,                'EVGA70011', 'EVGA',          '500W 80+ Bronze','En almacén',   '2024-09-15', NULL,         NULL,   NULL),
    ('INV-0008', 'cable_sata', 'ITIC-CAB-0001',NULL,            NULL,                'GEN-S-001', 'Genérico',      'SATA III 50cm', 'En almacén',    '2024-10-01', NULL,         NULL,   NULL),
    ('INV-0009', 'cortapicos', 'ITIC-CRT-0001',NULL,            NULL,                'TPL-CRT-09','TP-Link',       '6 tomas',       'Operativo',     '2024-02-01', '2024-02-10', 'LAB3',  NULL),
    ('INV-0010', 'microprocesador','ITIC-CPU-0001',NULL,        NULL,                'INTL-i5-22','Intel',         'Core i5-12400', 'En almacén',    '2025-01-12', NULL,         NULL,   NULL),
    ('INV-0011', 'tarjeta_video','ITIC-GPU-0001',NULL,          NULL,                'NV-GTX-01', 'NVIDIA',        'GTX 1650',      'De baja',       '2022-05-10', NULL,         NULL,   NULL),
    ('INV-0012', 'cooler',     'ITIC-COL-0001', NULL,           NULL,                'CM-HYPER-7','Cooler Master',  'Hyper 212',     'En almacén',    '2025-02-18', NULL,         NULL,   NULL);

-- =============================================================================
-- 19. INSERCIONES — MANTENIMIENTOS
-- =============================================================================

INSERT INTO mantenimientos (id, tipo_id, equipo_codigo, tecnico_id, laboratorio_id, fecha, hora_inicio, hora_fin, estado_id) VALUES
    ('M-PREV-001', 'preventivo', 'PC-LAB1-001', 'u-prev', 'LAB1', '2026-04-18', '08:30', '09:45', 'completado'),
    ('M-PREV-002', 'preventivo', 'PC-LAB1-002', 'u-prev', 'LAB1', '2026-04-18', '10:00', '11:15', 'completado'),
    ('M-PREV-003', 'preventivo', 'PC-LAB2-001', 'u-prev', 'LAB2', '2026-04-17', '14:00', '15:30', 'completado'),
    ('M-PREV-004', 'preventivo', 'PC-LAB3-002', 'u-prev2','LAB3', '2026-04-16', '09:00', '10:20', 'en_proceso'),
    ('M-PREV-005', 'preventivo', 'PC-LASIN2-001','u-prev','LASIN2','2026-04-15','11:00','12:30','completado'),
    ('M-CORR-001', 'correctivo', 'PC-LAB2-001', 'u-corr', 'LAB2', '2026-04-12', NULL,    NULL,    'resuelto'),
    ('M-CORR-002', 'correctivo', 'PC-LAB3-002', 'u-corr', 'LAB3', '2026-04-08', NULL,    NULL,    'resuelto'),
    ('M-CORR-003', 'correctivo', 'PC-LASIN1-004','u-corr','LASIN1','2026-04-11',NULL,    NULL,    'en_proceso'),
    ('M-CORR-004', 'correctivo', 'PC-LAB1-001', 'u-corr2','LAB1', '2026-04-05', NULL,    NULL,    'resuelto');

INSERT INTO mantenimientos_detalle (id, mantenimiento_id, descripcion, diagnostico, accion_realizada, resolucion, tipo_incidencia, estado_final, observaciones, recomendaciones) VALUES
    ('DET-PREV-001', 'M-PREV-001',
     'Mantenimiento preventivo completo',
     NULL,
     'Limpieza externa e interna, verificación de componentes, actualización de SO',
     'Completado',
     NULL,
     'Bueno',
     'Equipo en buen estado general. Se aplicó aire comprimido y se limpiaron ventiladores.',
     'Programar cambio de pasta térmica en 6 meses.'),
    ('DET-PREV-002', 'M-PREV-002',
     'Mantenimiento preventivo',
     NULL,
     'Limpieza general, revisión de software, actualización de antivirus',
     'Completado',
     NULL,
     'Bueno',
     'Sin novedades relevantes.',
     NULL),
    ('DET-PREV-003', 'M-PREV-003',
     'Mantenimiento preventivo de rutina',
     NULL,
     'Limpieza de componentes, verificación de discos, actualizaciones',
     'Completado',
     NULL,
     'Bueno',
     'Se encontraron archivos temporales excesivos, se realizó limpieza.',
     'Monitorear espacio en disco cada 3 meses.'),
    ('DET-CORR-001', 'M-CORR-001',
     'Equipo se reinicia aleatoriamente',
     'Test de memtest86 indica fallos en módulo de RAM',
     'Cambio de módulo de 8GB DDR4 Kingston por nuevo módulo Crucial de 8GB DDR4',
     'Resuelto',
     'Hardware',
     'Resuelto',
     'La memoria defectuosa fue reemplazada exitosamente.',
     'Realizar prueba de estrés en 1 semana para verificar estabilidad.'),
    ('DET-CORR-002', 'M-CORR-002',
     'Disco duro con sectores defectuosos',
     'CHKDSK reporta sectores dañados en disco mecánico',
     'Reemplazo por SSD de 240GB Kingston, clonación de datos',
     'Resuelto',
     'Hardware',
     'Resuelto',
     'El cambio a SSD mejoró significativamente el rendimiento.',
     'Considerar migrar todos los equipos del Lab 3 a SSD.'),
    ('DET-CORR-003', 'M-CORR-003',
     'No enciende, posible falla de fuente de poder',
     'Fuente de poder no suministra voltaje en línea de 12V',
     'En espera de repuesto (fuente de poder 500W)',
     NULL,
     'Hardware',
     'Pendiente',
     'Se solicitó fuente de poder a almacén. Sin stock disponible.',
     'Adquirir fuentes de poder de repuesto para el inventario.');

INSERT INTO checklists (id, detalle_id, categoria, item, estado, observacion) VALUES
    ('CHK-P1-01', 'DET-PREV-001', 'hardware', 'Limpieza externa del case',       'OK',      'Sin polvo visible'),
    ('CHK-P1-02', 'DET-PREV-001', 'hardware', 'Limpieza interna (componentes)',  'OK',      'Aire comprimido aplicado'),
    ('CHK-P1-03', 'DET-PREV-001', 'hardware', 'Ventiladores y disipadores',       'Regular', 'Cambiar pasta térmica próxima vez'),
    ('CHK-P1-04', 'DET-PREV-001', 'hardware', 'Fuente de poder',                  'OK',      'Voltajes normales'),
    ('CHK-P1-05', 'DET-PREV-001', 'hardware', 'Memoria RAM',                      'OK',      '8GB DDR4 funcionando correctamente'),
    ('CHK-P1-06', 'DET-PREV-001', 'software', 'Actualizaciones del SO',           'OK',      'Windows 11 al día'),
    ('CHK-P1-07', 'DET-PREV-001', 'software', 'Antivirus actualizado',            'OK',      'Windows Defender activo'),
    ('CHK-P1-08', 'DET-PREV-001', 'pruebas',  'Encendido/apagado correcto',       'OK',      NULL),
    ('CHK-P1-09', 'DET-PREV-001', 'pruebas',  'Velocidad de respuesta',           'OK',      'Arranque en 25 segundos');

INSERT INTO insumos_usados (id, detalle_id, insumo_nombre, cantidad) VALUES
    ('IU-P1-01', 'DET-PREV-001', 'Alcohol isopropílico', '150'),
    ('IU-P1-02', 'DET-PREV-001', 'Paños de microfibra',  '2'),
    ('IU-P1-03', 'DET-PREV-003', 'Aire comprimido',      '45'),
    ('IU-P1-04', 'DET-PREV-003', 'Alcohol isopropílico', '100'),
    ('IU-C1-01', 'DET-CORR-001', 'Pasta térmica',        '1'),
    ('IU-C1-02', 'DET-CORR-002', 'Aire comprimido',      '30');

-- =============================================================================
-- 20. INSERCIONES — INCIDENCIAS
-- =============================================================================

INSERT INTO incidencias (id, equipo_codigo, laboratorio_id, usuario_id, persona_id, problema, requiere_seguimiento, estado_id, fecha) VALUES
    ('INC-001', 'PC-LASIN1-004', 'LASIN1', 'u-doc1', 'P-DOC-001', 'No enciende, posible falla de fuente de poder',                     TRUE,  'en_proceso', '2026-04-18 09:30:00'),
    ('INC-002', 'PC-LAB2-005',   'LAB2',   'u-est',  'P-EST-001', 'Pantalla azul intermitente al abrir aplicaciones',                 TRUE,  'en_proceso', '2026-04-17 11:15:00'),
    ('INC-003', 'PC-LAB1-003',   'LAB1',   'u-doc2', 'P-DOC-002', 'Ventilador del CPU haciendo ruido excesivo',                        FALSE, 'nuevo',     '2026-04-16 14:00:00'),
    ('INC-004', 'PC-LAB4-007',   'LAB4',   'u-doc3', 'P-DOC-003', 'Equipo no enciende, posible daño irreparable en placa madre',        FALSE, 'cerrado',   '2026-04-14 10:45:00'),
    ('INC-005', 'PC-LAB3-002',   'LAB3',   'u-est2', 'P-EST-002', 'Lentitud al cargar el sistema operativo',                           FALSE, 'nuevo',     '2026-04-12 16:30:00'),
    ('INC-006', 'PC-LAB4-002',   'LAB4',   'u-doc4', 'P-DOC-004', 'Sin acceso a la red local, cable de red desconectado',              FALSE, 'nuevo',     '2026-04-20 08:00:00'),
    ('INC-007', 'PC-LAB1-001',   'LAB1',   'u-est3', 'P-EST-003', 'El teclado no responde en algunos caracteres',                      FALSE, 'nuevo',     '2026-04-19 12:00:00');

-- =============================================================================
-- 21. INSERCIONES — ASIGNACIONES
-- =============================================================================

INSERT INTO asignaciones (id, equipo_codigo, laboratorio_id, tecnico_id, problema, prioridad, fecha, estado) VALUES
    ('AS-001', 'PC-LASIN1-004', 'LASIN1', 'u-corr',  'No enciende, posible falla de fuente de poder',                'Alta',  '2026-04-18', 'Pendiente'),
    ('AS-002', 'PC-LAB2-005',   'LAB2',   'u-corr',  'Pantalla azul intermitente',                                    'Media', '2026-04-17', 'En proceso'),
    ('AS-003', 'PC-LAB1-002',   'LAB1',   'u-prev',  'Equipo lento, requiere mantenimiento preventivo urgente',       'Media', '2026-04-19', 'Pendiente'),
    ('AS-004', 'PC-LAB3-002',   'LAB3',   'u-prev2', 'Limpieza profunda y revisión de software',                      'Baja',  '2026-04-18', 'En proceso');

-- =============================================================================
-- 22. INSERCIONES — REPORTES DE PASANTE
-- =============================================================================

INSERT INTO reportes_pasante (id, pasante_id, titulo, descripcion, laboratorio_id, ubicacion, categoria, prioridad, fecha, estado) VALUES
    ('RP-001', 'u-prev', 'Cables de red desconectados',
     'Se encontraron 3 cables de red sueltos detrás del rack del Laboratorio 1. Posible riesgo de desconexión.',
     'LAB1', 'Piso 1 - Rack de red', 'Red', 'Media', '2026-04-19 10:30:00', 'Nuevo'),
    ('RP-002', 'u-prev2', 'Foco fundido en Laboratorio 3',
     'El foco del pasillo frente al Lab 3 está fundido, dificulta la visibilidad al ingresar.',
     'LAB3', 'Pasillo exterior', 'Infraestructura', 'Baja', '2026-04-16 15:00:00', 'Visto'),
    ('RP-003', 'u-corr', 'Stock bajo de pasta térmica',
     'Solo quedan 3 aplicaciones de pasta térmica. Se recomienda solicitar reposición.',
     NULL, 'Almacén ITIC', 'Insumos', 'Alta', '2026-04-15 11:45:00', 'Resuelto');

-- =============================================================================
-- 23. INSERCIONES — LOGS (auditoría)
-- =============================================================================

INSERT INTO logs (id, timestamp, usuario_id, accion, detalle, modulo, entidad, equipo_codigo, tipo_accion, estado) VALUES
    ('LOG-001', '2026-04-20 09:12:00', 'u-prev', 'Mantenimiento creado',      'Preventivo PC-LAB1-001',        'Mantenimientos', 'Mantenimiento',            'PC-LAB1-001', 'Crear',   'Éxito'),
    ('LOG-002', '2026-04-20 08:55:00', 'u-corr', 'Estado actualizado',        'PC-LAB2-005 → En mantenimiento','Equipos',        'Equipo',                    'PC-LAB2-005', 'Actualizar', 'Éxito'),
    ('LOG-003', '2026-04-19 17:30:00', 'u-admin','Equipo registrado',         'PC-LAB3-012 (HP ProDesk)',      'Equipos',        'Equipo',                    'PC-LAB3-004', 'Crear',   'Éxito'),
    ('LOG-004', '2026-04-19 14:22:00', 'u-admin','Usuario creado',            'cmendoza (Pasante Preventivo)', 'Usuarios',       'Usuario',                   NULL,          'Crear',   'Éxito'),
    ('LOG-005', '2026-04-19 11:08:00', 'u-corr', 'Correctivo cerrado',        'PC-LAB2-001 — RAM reemplazada', 'Mantenimientos', 'Mantenimiento Correctivo',  'PC-LAB2-001', 'Resolver', 'Éxito'),
    ('LOG-006', '2026-04-20 10:00:00', 'u-prev2','Incidencia creada',         'PC-LAB3-002 lentitud en SO',    'Incidencias',    'Incidencia',                'PC-LAB3-002', 'Crear',   'Éxito'),
    ('LOG-007', '2026-04-18 16:45:00', 'u-admin','Reporte de pasante resuelto','Stock bajo de pasta térmica',   'Incidencias',    'Reporte de pasante',        NULL,          'Resolver', 'Éxito');

-- =============================================================================
-- 24. INSERCIONES — INSCRIPCIONES (estudiantes en grupos)
-- =============================================================================

INSERT INTO inscripciones (id, persona_id, grupo_id, fecha_inscripcion) VALUES
    ('INS-001', 'P-EST-001', 'G-INF121-A', '2026-02-10'),
    ('INS-002', 'P-EST-002', 'G-INF121-A', '2026-02-10'),
    ('INS-003', 'P-EST-003', 'G-INF121-B', '2026-02-11'),
    ('INS-004', 'P-EST-001', 'G-INF211-A', '2026-02-12'),
    ('INS-005', 'P-EST-002', 'G-INF212-A', '2026-02-12');

-- =============================================================================
-- 25. CONSULTAS DE VERIFICACIÓN
-- =============================================================================

-- Verificar integridad referencial: equipos por laboratorio
SELECT l.nombre AS laboratorio, COUNT(e.codigo) AS total_equipos
FROM laboratorios l
LEFT JOIN equipos e ON e.laboratorio_id = l.id
GROUP BY l.nombre
ORDER BY l.nombre;

-- Verificar mantenimientos recientes
SELECT m.id, tm.nombre AS tipo, e.codigo AS equipo, p.nombres || ' ' || p.paterno AS tecnico,
       m.fecha, em.nombre AS estado
FROM mantenimientos m
JOIN tipo_mantenimiento tm ON tm.id = m.tipo_id
JOIN equipos e ON e.codigo = m.equipo_codigo
JOIN usuarios u ON u.id = m.tecnico_id
JOIN personas p ON p.id = u.persona_id
JOIN estado_mantenimiento em ON em.id = m.estado_id
ORDER BY m.fecha DESC;

-- Inventario: ítems con stock bajo
SELECT ci.nombre AS categoria, COUNT(inv.id) AS total, ci.stock_minimo
FROM categorias_inventario ci
LEFT JOIN inventario inv ON inv.categoria_id = ci.id AND inv.estado != 'De baja'
GROUP BY ci.nombre, ci.stock_minimo
HAVING COUNT(inv.id) <= ci.stock_minimo;

-- Horarios de laboratorios
SELECT h.dia_semana, h.hora_inicio, h.hora_fin, l.nombre AS laboratorio,
       m.sigla, m.nombre AS materia, g.numero_grupo
FROM horarios h
JOIN laboratorios l ON l.id = h.laboratorio_id
JOIN grupos g ON g.id = h.grupo_id
JOIN materias m ON m.codigo = g.materia_codigo
ORDER BY h.dia_semana, h.hora_inicio;
