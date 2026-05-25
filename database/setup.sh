#!/bin/bash
echo "============================================"
echo " SIGMALAB — Configuración de Base de Datos"
echo " Carrera de Informática - UMSA"
echo "============================================"
echo ""

# Verificar que PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "[ERROR] PostgreSQL no encontrado. Instala PostgreSQL primero."
    exit 1
fi

echo "[1/5] Creando base de datos sigmalab..."
psql -U postgres -c "CREATE DATABASE sigmalab;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  Base de datos creada."
else
    echo "  La base de datos ya existe o hubo un error."
fi

echo "[2/5] Ejecutando schema SQL..."
psql -U postgres -d sigmalab -f sigmalab-umsa.sql
if [ $? -ne 0 ]; then
    echo "[ERROR] Falló la ejecución del schema."
    exit 1
fi
echo "  Schema creado exitosamente."

echo "[3/5] Verificando tablas..."
psql -U postgres -d sigmalab -c "\dt"
echo ""

echo "[4/5] Verificando datos insertados..."
psql -U postgres -d sigmalab <<EOF
SELECT 'personas: ' || COUNT(*)::text FROM personas;
SELECT 'usuarios: ' || COUNT(*)::text FROM usuarios;
SELECT 'equipos: ' || COUNT(*)::text FROM equipos;
SELECT 'mantenimientos: ' || COUNT(*)::text FROM mantenimientos;
SELECT 'incidencias: ' || COUNT(*)::text FROM incidencias;
EOF
echo ""

echo "[5/5] Configurando backend..."
cp -n ../backend/.env.example ../backend/.env 2>/dev/null || echo "  .env ya existe."
echo ""

echo "============================================"
echo "  SETUP COMPLETADO"
echo "============================================"
echo ""
echo "Para iniciar el backend:"
echo "  cd backend && npm install && npx prisma generate && npm run dev"
echo ""
echo "Para iniciar el frontend:"
echo "  cd frontend && npm install && npm run dev"
echo ""
echo "Credenciales de prueba:"
echo "  - Admin:      admin@test.com / 123456"
echo "  - Preventivo: 20250001 / 123456"
echo "  - Correctivo: 20250003 / 123456"
echo "  - Docente:    jcmamani@umsa.bo / 123456"
echo "  - Estudiante: 20250005 / 123456"
echo ""
