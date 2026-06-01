import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const estados = await prisma.estadoEquipo.findMany();
  console.log('=== ESTADO_EQUIPO ===');
  estados.forEach(e => console.log(e.id, e.nombre));
} catch(e) { console.error(e); }
finally { const d = prisma.$disconnect; await d.call(prisma); }
