-- =============================================================================
-- SIGMALAB — Datos adicionales para verificar funcionamiento completo
-- =============================================================================

-- 1. MÁS EQUIPOS (cuidando uq_equipo_ubicacion: laboratorio+fila+puesto únicos)
INSERT INTO equipos (codigo, nombre, laboratorio_id, fila, puesto, sistema_operativo, marca, modelo, numero_serie, estado_id, fecha_compra) VALUES
('PC-LAB1-007','HP EliteDesk 800','LAB1','A','07','Windows 11 Pro','HP','EliteDesk 800','HP7890123','funcionando','2024-01-15'),
('PC-LAB1-008','Dell OptiPlex 3000','LAB1','A','08','Windows 11 Pro','Dell','OptiPlex 3000','DLL890123','funcionando','2024-02-20'),
('PC-LAB1-009','Lenovo ThinkCentre M80q','LAB1','B','03','Windows 10 Pro','Lenovo','ThinkCentre M80q','LNV901234','funcionando','2023-11-10'),
('PC-LAB1-010','HP ProDesk 400 G7','LAB1','B','04','Windows 10 Pro','HP','ProDesk 400 G7','HP0123456','funcionando','2023-08-05'),
('PC-LAB2-006','Dell OptiPlex 7080','LAB2','C','03','Windows 11 Pro','Dell','OptiPlex 7080','DLL234567','funcionando','2024-03-01'),
('PC-LAB2-007','HP EliteDesk 805 G6','LAB2','C','04','Windows 11 Pro','HP','EliteDesk 805 G6','HP3456789','funcionando','2024-01-20'),
('PC-LAB2-008','Lenovo ThinkCentre M75q','LAB2','C','05','Windows 10 Pro','Lenovo','ThinkCentre M75q','LNV456789','en_mantenimiento','2023-09-15'),
('PC-LAB3-005','HP ProDesk 600 G5','LAB3','C','04','Windows 10 Pro','HP','ProDesk 600 G5','HP5678901','funcionando','2023-06-10'),
('PC-LAB3-006','Dell OptiPlex 3070','LAB3','C','05','Windows 11 Pro','Dell','OptiPlex 3070','DLL678901','funcionando','2024-04-05'),
('PC-LAB3-007','Lenovo ThinkCentre M90q','LAB3','D','02','Windows 11 Pro','Lenovo','ThinkCentre M90q','LNV789012','funcionando','2024-02-15'),
('PC-LAB3-008','HP EliteDesk 800 G5','LAB3','D','03','Windows 10 Pro','HP','EliteDesk 800 G5','HP8901234','funcionando','2023-07-20'),
('PC-LAB4-004','Dell OptiPlex 5090','LAB4','D','03','Windows 11 Pro','Dell','OptiPlex 5090','DLL901234','funcionando','2024-03-15'),
('PC-LAB4-005','HP ProDesk 400 G8','LAB4','D','04','Windows 11 Pro','HP','ProDesk 400 G8','HP0123457','funcionando','2024-01-10'),
('PC-LASIN1-005','Dell Precision 3650','LASIN1','E','05','Windows 11 Pro','Dell','Precision 3650','DLL123458','funcionando','2024-05-01'),
('PC-LASIN1-006','HP Z2 Tower G9','LASIN1','E','06','Windows 11 Pro','HP','Z2 Tower G9','HP2345690','funcionando','2024-04-20'),
('PC-LASIN1-007','Lenovo ThinkStation P350','LASIN1','E','07','Windows 10 Pro','Lenovo','ThinkStation P350','LNV345670','funcionando','2023-12-01');

-- 2. PERIFÉRICOS ADICIONALES
INSERT INTO perifericos (id, tipo, marca, modelo, numero_serie, equipo_codigo, laboratorio_id, estado) VALUES
('UMSA-INF-2024-140','Monitor','Dell','SE2422H','DELL45678','PC-LAB3-005','LAB3','Funcionando'),
('UMSA-INF-2024-141','Teclado','HP','K1500','HP123456','PC-LAB3-005','LAB3','Funcionando'),
('UMSA-INF-2024-142','Mouse','HP','M150','HP789012','PC-LAB3-005','LAB3','Funcionando'),
('UMSA-INF-2024-143','Monitor','Lenovo','ThinkVision S24e-20','LNV654321','PC-LASIN1-005','LASIN1','Funcionando'),
('UMSA-INF-2024-144','Teclado','Lenovo','ThinkPad TrackPoint II','LNV987654','PC-LASIN1-005','LASIN1','Funcionando'),
('UMSA-INF-2024-145','Mouse','Dell','MS116','DELL24680','PC-LAB4-004','LAB4','Funcionando'),
('UMSA-INF-2024-146','Impresora Multifuncional','Epson','L3250','EPS554433',NULL,'LASIN2','Funcionando');

-- 3. MÁS MANTENIMIENTOS PREVENTIVOS
INSERT INTO mantenimientos (id, tipo_id, equipo_codigo, tecnico_id, laboratorio_id, fecha, hora_inicio, hora_fin, estado_id) VALUES
('M-PREV-006','preventivo','PC-LAB1-007','u-prev','LAB1','2026-04-10','09:00','10:30','completado'),
('M-PREV-007','preventivo','PC-LAB1-008','u-prev2','LAB1','2026-04-10','11:00','12:00','completado'),
('M-PREV-008','preventivo','PC-LAB2-006','u-prev','LAB2','2026-04-09','08:30','10:00','completado'),
('M-PREV-009','preventivo','PC-LAB2-007','u-prev2','LAB2','2026-04-09','10:30','11:30','completado'),
('M-PREV-010','preventivo','PC-LAB3-006','u-prev','LAB3','2026-04-08','14:00','15:30','completado'),
('M-PREV-011','preventivo','PC-LASIN1-005','u-prev3','LASIN1','2026-04-07','09:00','10:00','completado'),
('M-PREV-012','preventivo','PC-LAB4-004','u-prev2','LAB4','2026-04-07','11:00','12:30','completado'),
('M-PREV-013','preventivo','PC-LAB1-009','u-prev3','LAB1','2026-04-04','08:30','09:45','completado'),
('M-PREV-014','preventivo','PC-LAB3-007','u-prev','LAB3','2026-04-03','14:00','15:00','completado'),
('M-PREV-015','preventivo','PC-LASIN1-006','u-prev2','LASIN1','2026-04-02','09:00','10:30','completado'),
('M-PREV-016','preventivo','PC-LAB2-001','u-prev3','LAB2','2026-04-01','10:00','11:30','completado'),
('M-PREV-017','preventivo','PC-LAB4-005','u-prev','LAB4','2026-03-31','08:30','09:30','completado');

INSERT INTO mantenimientos_detalle (id, mantenimiento_id, descripcion, diagnostico, accion_realizada, resolucion, tipo_incidencia, estado_final, observaciones, recomendaciones) VALUES
('DET-PREV-006','M-PREV-006','Mantenimiento preventivo completo',NULL,'Limpieza externa e interna, verificación de disco','Completado',NULL,'Excelente','Equipo nuevo, en óptimas condiciones','Próximo mantenimiento en 6 meses'),
('DET-PREV-007','M-PREV-007','Mantenimiento preventivo completo',NULL,'Limpieza de componentes, actualización de Windows','Completado',NULL,'Bueno','Se encontró polvo acumulado en ventilador','Monitorear temperatura'),
('DET-PREV-008','M-PREV-008','Mantenimiento preventivo',NULL,'Limpieza general, verificación de memoria RAM','Completado',NULL,'Bueno','Memoria RAM funciona correctamente','Sin novedades'),
('DET-PREV-009','M-PREV-009','Mantenimiento completo',NULL,'Limpieza de case y periféricos','Completado',NULL,'Regular','Teclado presenta desgaste en teclas','Considerar reemplazo de teclado'),
('DET-PREV-010','M-PREV-010','Mantenimiento preventivo estándar',NULL,'Limpieza de componentes, cambio de pasta térmica','Completado',NULL,'Excelente','Pasta térmica reemplazada correctamente','Próximo cambio en 12 meses'),
('DET-PREV-011','M-PREV-011','Mantenimiento de estación de trabajo',NULL,'Limpieza profunda, organización de cables','Completado',NULL,'Bueno','Cables organizados con bridas','Mantener orden'),
('DET-PREV-012','M-PREV-012','Mantenimiento preventivo',NULL,'Limpieza, actualización de SO y antivirus','Completado',NULL,'Bueno','SO actualizado a última versión','Equipo listo para uso'),
('DET-PREV-013','M-PREV-013','Mantenimiento completo',NULL,'Verificación de hardware y limpieza','Completado',NULL,'Excelente','Sin observaciones','Equipo en excelente estado'),
('DET-PREV-014','M-PREV-014','Mantenimiento preventivo',NULL,'Limpieza de ventiladores y disipadores','Completado',NULL,'Bueno','Ventiladores funcionando correctamente','Controlar ruido'),
('DET-PREV-015','M-PREV-015','Mantenimiento de estación de trabajo',NULL,'Limpieza externa e interna, revisión de cableado','Completado',NULL,'Bueno','Cableado de red verificado','Sin observaciones'),
('DET-PREV-016','M-PREV-016','Mantenimiento preventivo',NULL,'Limpieza de componentes, verificación de disco','Completado',NULL,'Excelente','Disco SSD con buena salud','Próximo mantenimiento en 6 meses'),
('DET-PREV-017','M-PREV-017','Mantenimiento preventivo',NULL,'Limpieza general y organización','Completado',NULL,'Bueno','Equipo funcionando correctamente','Sin novedades');

-- 4. MÁS MANTENIMIENTOS CORRECTIVOS
INSERT INTO mantenimientos (id, tipo_id, equipo_codigo, tecnico_id, laboratorio_id, fecha, hora_inicio, hora_fin, estado_id) VALUES
('M-CORR-005','correctivo','PC-LAB1-003','u-corr','LAB1','2026-04-09','09:00','11:00','resuelto'),
('M-CORR-006','correctivo','PC-LAB2-005','u-corr2','LAB2','2026-04-07','14:00','16:30','resuelto'),
('M-CORR-007','correctivo','PC-LAB3-004','u-corr','LAB3','2026-04-06','08:00','10:00','resuelto'),
('M-CORR-008','correctivo','PC-LASIN1-001','u-corr2','LASIN1','2026-04-05','10:00','12:00','resuelto'),
('M-CORR-009','correctivo','PC-LAB1-005','u-corr','LAB1','2026-04-03','09:30','11:30','resuelto'),
('M-CORR-010','correctivo','PC-LAB4-007','u-corr2','LAB4','2026-04-01','14:00','15:30','resuelto'),
('M-CORR-011','correctivo','PC-LASIN2-001','u-corr','LASIN2','2026-03-30','08:00','09:30','resuelto');

INSERT INTO mantenimientos_detalle (id, mantenimiento_id, descripcion, diagnostico, accion_realizada, resolucion, tipo_incidencia, estado_final, observaciones, recomendaciones) VALUES
('DET-CORR-005','M-CORR-005','PC no enciende correctamente','Fallo en fuente de poder interna','Reemplazo de fuente de poder Corsair VS450','Resuelto','Hardware','Excelente','Fuente reemplazada exitosamente','Verificar estabilidad en una semana'),
('DET-CORR-006','M-CORR-006','Pantalla azul al iniciar sesión','Controlador de gráficos dañado por actualización','Reinstalación de drivers de video','Resuelto','Software','Bueno','Drivers reinstalados correctamente','Deshabilitar actualizaciones automáticas de drivers'),
('DET-CORR-007','M-CORR-007','Teclado no responde','Derrame de líquido sobre teclado','Reemplazo de teclado','Resuelto','Hardware','Bueno','Teclado reemplazado por nuevo Logitech K120','Mantener líquidos alejados de equipos'),
('DET-CORR-008','M-CORR-008','Equipo lento y congelamiento frecuente','Disco duro con sectores defectuosos','Reemplazo de HDD por SSD Kingston 480GB','Resuelto','Hardware','Excelente','SSD instalado, rendimiento mejorado significativamente','Equipo notablemente más rápido'),
('DET-CORR-009','M-CORR-009','Puerto USB no funciona','Conector USB dañado en placa madre','Uso de puerto USB alternativo. Limpieza de puertos','Resuelto','Hardware','Regular','Puerto dañado no reparado, se usan puertos alternativos','Considerar reemplazo de placa madre'),
('DET-CORR-010','M-CORR-010','Mouse óptico no funciona','Cable del mouse cortado internamente','Reemplazo de mouse','Resuelto','Hardware','Bueno','Mouse reemplazado por nuevo Dell MS116','Mouse en garantía, gestionar cambio'),
('DET-CORR-011','M-CORR-011','Impresora no imprime','Atasco de papel en bandeja inferior','Extracción de papel atascado, limpieza de rodillos','Resuelto','Hardware','Bueno','Impresora funcionando correctamente','No sobrecargar bandeja de papel');

-- 5. MÁS INCIDENCIAS (sin columna descripcion en esta BD)
INSERT INTO incidencias (id, equipo_codigo, laboratorio_id, usuario_id, persona_id, problema, estado_id, fecha) VALUES
('INC-008','PC-LAB2-008','LAB2','u-doc1','P-DOC-001','Monitor parpadea intermitentemente','nuevo','2026-04-20'),
('INC-009','PC-LAB3-008','LAB3','u-est','P-EST-001','USB no reconoce dispositivos','nuevo','2026-04-19'),
('INC-010','PC-LASIN1-003','LASIN1','u-doc2','P-DOC-002','Equipo se apaga solo','en_proceso','2026-04-18'),
('INC-011','PC-LAB4-002','LAB4','u-doc3','P-DOC-003','Sonido distorsionado','nuevo','2026-04-17'),
('INC-012','PC-LAB1-006','LAB1','u-est2','P-EST-002','Teclado numérico no funciona','nuevo','2026-04-16'),
('INC-013','PC-LAB2-002','LAB2','u-doc4','P-DOC-004','No hay conexión a internet','en_proceso','2026-04-15'),
('INC-014','PC-LAB3-003','LAB3','u-est3','P-EST-003','Ventilador hace ruido excesivo','nuevo','2026-04-14'),
('INC-015','PC-LASIN1-002','LASIN1','u-doc5','P-DOC-005','Microsoft Office no abre','nuevo','2026-04-13'),
('INC-016','PC-LAB4-001','LAB4','u-est','P-EST-001','Pantalla azul al entrar a la UMSA Virtual','en_proceso','2026-04-12');

-- 6. MÁS ASIGNACIONES
INSERT INTO asignaciones (id, equipo_codigo, laboratorio_id, tecnico_id, problema, prioridad, fecha, estado) VALUES
('AS-005','PC-LASIN1-003','LASIN1','u-corr','Equipo se apaga solo - diagnóstico completo','Alta','2026-04-18','Pendiente'),
('AS-006','PC-LAB2-002','LAB2','u-corr','No hay conexión a internet - verificar tarjeta de red','Media','2026-04-15','En proceso'),
('AS-007','PC-LAB1-006','LAB1','u-prev3','Teclado numérico no funciona - revisar y limpiar','Baja','2026-04-16','Pendiente'),
('AS-008','PC-LAB3-003','LAB3','u-prev','Ventilador ruidoso - limpieza y cambio de pasta térmica','Media','2026-04-14','Pendiente');

-- 7. MÁS REPORTES DE PASANTES
INSERT INTO reportes_pasante (id, pasante_id, titulo, descripcion, laboratorio_id, ubicacion, categoria, prioridad, fecha, estado, resolucion_detalle) VALUES
('RP-004','u-prev','Cableado eléctrico expuesto en LASIN 1','Se encontraron cables eléctricos expuestos cerca de la estación de trabajo A3','LASIN1','Piso 1 - Estación A3','Seguridad','Alta','2026-04-18','Nuevo',NULL),
('RP-005','u-corr','Silla en mal estado en Lab 2','La silla de la estación B2 tiene el espaldar suelto','LAB2','Piso 1 - Estación B2','Mobiliario','Media','2026-04-17','Resuelto','Silla reemplazada por una nueva'),
('RP-006','u-prev2','Falta de aire acondicionado en LAB3','La temperatura en el laboratorio 3 supera los 30°C','LAB3','Piso 2','Infraestructura','Alta','2026-04-16','Nuevo',NULL),
('RP-007','u-prev3','Router de WiFi caído en LASIN','El router TP-Link del LASIN no enciende','LASIN1','Cuarto de redes','Red','Alta','2026-04-15','Visto',NULL),
('RP-008','u-corr2','Extintor vencido en LAB1','El extintor del pasillo del laboratorio 1 venció en marzo 2026','LAB1','Pasillo exterior','Seguridad','Alta','2026-04-14','Nuevo',NULL);

-- 8. MÁS LOGS (sin columna cambios)
INSERT INTO logs (id, usuario_id, accion, detalle, modulo, entidad, equipo_codigo, tipo_accion, estado) VALUES
('LOG-008','u-prev','Mantenimiento preventivo completado','M-PREV-006 completado en PC-LAB1-007','Mantenimientos','Mantenimiento Preventivo','PC-LAB1-007','Actualizar','Éxito'),
('LOG-009','u-corr','Correctivo registrado','M-CORR-005 - Fuente de poder reemplazada en PC-LAB1-003','Mantenimientos','Mantenimiento Correctivo','PC-LAB1-003','Crear','Éxito'),
('LOG-010','u-doc1','Incidencia reportada','Monitor parpadea - PC-LAB2-008','Incidencias','Incidencia','PC-LAB2-008','Crear','Éxito'),
('LOG-011','u-admin','Nuevo equipo registrado','PC-LAB1-007 HP EliteDesk 800 dado de alta en LAB1','Equipos','Equipo','PC-LAB1-007','Crear','Éxito'),
('LOG-012','u-invitado','Inicio de sesión','Visitante accedió al sistema','Sistema',NULL,NULL,'Otro','Éxito'),
('LOG-013','u-prev','Reporte de mantenimiento generado','Reporte mensual abril 2026 generado','Reportes','Reporte',NULL,'Crear','Éxito'),
('LOG-014','u-corr2','Asignación recibida','AS-006 - PC-LAB2-002 asignado para verificar conexión','Asignaciones','Asignación','PC-LAB2-002','Asignar','Éxito'),
('LOG-015','u-admin','Stock mínimo actualizado','Stock de Teclado actualizado de 3 a 5 unidades','Inventario','Stock mínimo',NULL,'Actualizar','Éxito'),
('LOG-016','u-prev2','Mantenimiento completado','M-PREV-007 completado en PC-LAB1-008','Mantenimientos','Mantenimiento Preventivo','PC-LAB1-008','Actualizar','Éxito'),
('LOG-017','u-corr','Correctivo registrado','M-CORR-006 - Pantalla azul en PC-LAB2-005 resuelto','Mantenimientos','Mantenimiento Correctivo','PC-LAB2-005','Crear','Éxito');
