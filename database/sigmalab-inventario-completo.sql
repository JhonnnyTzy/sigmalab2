-- ============================================================
-- SIGMALAB: Comprehensive data for inventory, PCs & peripherals
-- Adds PCs to match user needs (10 PCs per lab) and
-- creates perifericos + inventario items for each PC.
-- ============================================================

-- 1. ADD MORE PCs TO LABS THAT NEED THEM
-- Each lab should have ~10 PCs

-- LAB2 (currently 8 → add 2 → 10)
INSERT INTO equipos (codigo, nombre, laboratorio_id, fila, puesto, sistema_operativo, marca, modelo, numero_serie, estado_id, activo, created_at, updated_at)
VALUES
  ('PC-LAB2-009', 'HP ProDesk 400 G8', 'LAB2', 'B', '09', 'Windows 11 Pro', 'HP', 'ProDesk 400 G8',  'MXL2B009X', 'funcionando', true, NOW(), NOW()),
  ('PC-LAB2-010', 'Dell OptiPlex 7090', 'LAB2', 'B', '10', 'Windows 11 Pro', 'Dell', 'OptiPlex 7090', 'DLL2B010X', 'funcionando', true, NOW(), NOW());

-- LAB3 (currently 8 → add 2 → 10)
INSERT INTO equipos (codigo, nombre, laboratorio_id, fila, puesto, sistema_operativo, marca, modelo, numero_serie, estado_id, activo, created_at, updated_at)
VALUES
  ('PC-LAB3-009', 'Lenovo ThinkCentre M90q', 'LAB3', 'C', '09', 'Windows 11 Pro', 'Lenovo', 'ThinkCentre M90q', 'LNV3C009X', 'funcionando', true, NOW(), NOW()),
  ('PC-LAB3-010', 'HP EliteDesk 800 G5', 'LAB3', 'C', '10', 'Windows 10 Pro', 'HP', 'EliteDesk 800 G5', 'MXL3C010X', 'funcionando', true, NOW(), NOW());

-- LAB4 (currently 5 → add 5 → 10)
INSERT INTO equipos (codigo, nombre, laboratorio_id, fila, puesto, sistema_operativo, marca, modelo, numero_serie, estado_id, activo, created_at, updated_at)
VALUES
  ('PC-LAB4-008', 'HP ProDesk 600 G6', 'LAB4', 'D', '08', 'Windows 11 Pro', 'HP', 'ProDesk 600 G6', 'MXL4D008X', 'funcionando', true, NOW(), NOW()),
  ('PC-LAB4-009', 'Dell OptiPlex 7080', 'LAB4', 'D', '09', 'Windows 11 Pro', 'Dell', 'OptiPlex 7080', 'DLL4D009X', 'funcionando', true, NOW(), NOW()),
  ('PC-LAB4-010', 'Lenovo ThinkCentre M70q', 'LAB4', 'D', '10', 'Windows 10 Pro', 'Lenovo', 'ThinkCentre M70q', 'LNV4D010X', 'funcionando', true, NOW(), NOW()),
  ('PC-LAB4-011', 'HP ProDesk 400 G8', 'LAB4', 'D', '11', 'Windows 11 Pro', 'HP', 'ProDesk 400 G8', 'MXL4D011X', 'funcionando', true, NOW(), NOW()),
  ('PC-LAB4-012', 'Dell Vostro 3681', 'LAB4', 'D', '12', 'Windows 10 Pro', 'Dell', 'Vostro 3681', 'DLL4D012X', 'en_mantenimiento', true, NOW(), NOW());

-- LASIN1 (currently 7 → add 3 → 10)
INSERT INTO equipos (codigo, nombre, laboratorio_id, fila, puesto, sistema_operativo, marca, modelo, numero_serie, estado_id, activo, created_at, updated_at)
VALUES
  ('PC-LASIN1-008', 'HP ProDesk 600 G5', 'LASIN1', 'E', '08', 'Windows 10 Pro', 'HP', 'ProDesk 600 G5', 'MXL1E008X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN1-009', 'Dell OptiPlex 3070', 'LASIN1', 'E', '09', 'Windows 11 Pro', 'Dell', 'OptiPlex 3070', 'DLL1E009X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN1-010', 'Lenovo ThinkStation P350', 'LASIN1', 'E', '10', 'Windows 10 Pro', 'Lenovo', 'ThinkStation P350', 'LNV1E010X', 'funcionando', true, NOW(), NOW());

-- LASIN2 (currently 1 → add 6 → 7)
INSERT INTO equipos (codigo, nombre, laboratorio_id, fila, puesto, sistema_operativo, marca, modelo, numero_serie, estado_id, activo, created_at, updated_at)
VALUES
  ('PC-LASIN2-002', 'HP EliteDesk 800 G8', 'LASIN2', 'F', '02', 'Windows 11 Pro', 'HP', 'EliteDesk 800 G8', 'MXL2F002X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN2-003', 'Dell OptiPlex 5090', 'LASIN2', 'F', '03', 'Windows 11 Pro', 'Dell', 'OptiPlex 5090', 'DLL2F003X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN2-004', 'HP ProDesk 400 G8', 'LASIN2', 'F', '04', 'Windows 11 Pro', 'HP', 'ProDesk 400 G8', 'MXL2F004X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN2-005', 'Lenovo ThinkCentre M75q', 'LASIN2', 'F', '05', 'Windows 10 Pro', 'Lenovo', 'ThinkCentre M75q', 'LNV2F005X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN2-006', 'Dell OptiPlex 3000', 'LASIN2', 'F', '06', 'Windows 11 Pro', 'Dell', 'OptiPlex 3000', 'DLL2F006X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN2-007', 'HP ProDesk 600 G6', 'LASIN2', 'F', '07', 'Windows 11 Pro', 'HP', 'ProDesk 600 G6', 'MXL2F007X', 'en_mantenimiento', true, NOW(), NOW());

-- LABM1 (currently 0 → add 8) – Mobile lab with laptops/workstations
INSERT INTO equipos (codigo, nombre, laboratorio_id, fila, puesto, sistema_operativo, marca, modelo, numero_serie, estado_id, activo, created_at, updated_at)
VALUES
  ('PC-LABM1-001', 'Dell Precision 3650', 'LABM1', 'M', '01', 'Windows 11 Pro', 'Dell', 'Precision 3650', 'DLLM1001X', 'funcionando', true, NOW(), NOW()),
  ('PC-LABM1-002', 'HP Z2 Tower G9', 'LABM1', 'M', '02', 'Windows 11 Pro', 'HP', 'Z2 Tower G9', 'MXLM1002X', 'funcionando', true, NOW(), NOW()),
  ('PC-LABM1-003', 'Lenovo ThinkStation P350', 'LABM1', 'M', '03', 'Windows 10 Pro', 'Lenovo', 'ThinkStation P350', 'LNVM1003X', 'funcionando', true, NOW(), NOW()),
  ('PC-LABM1-004', 'Dell OptiPlex 7090', 'LABM1', 'M', '04', 'Windows 11 Pro', 'Dell', 'OptiPlex 7090', 'DLLM1004X', 'funcionando', true, NOW(), NOW()),
  ('PC-LABM1-005', 'HP EliteDesk 800 G8', 'LABM1', 'M', '05', 'Windows 11 Pro', 'HP', 'EliteDesk 800 G8', 'MXLM1005X', 'funcionando', true, NOW(), NOW()),
  ('PC-LABM1-006', 'Lenovo ThinkCentre M80q', 'LABM1', 'M', '06', 'Windows 10 Pro', 'Lenovo', 'ThinkCentre M80q', 'LNVM1006X', 'funcionando', true, NOW(), NOW()),
  ('PC-LABM1-007', 'HP ProDesk 600 G6', 'LABM1', 'M', '07', 'Windows 11 Pro', 'HP', 'ProDesk 600 G6', 'MXLM1007X', 'funcionando', true, NOW(), NOW()),
  ('PC-LABM1-008', 'Dell OptiPlex 5080', 'LABM1', 'M', '08', 'Ubuntu 22.04', 'Dell', 'OptiPlex 5080', 'DLLM1008X', 'funcionando', true, NOW(), NOW());

-- LASIN3 (currently 0 → add 6)
INSERT INTO equipos (codigo, nombre, laboratorio_id, fila, puesto, sistema_operativo, marca, modelo, numero_serie, estado_id, activo, created_at, updated_at)
VALUES
  ('PC-LASIN3-001', 'HP ProDesk 400 G7', 'LASIN3', 'G', '01', 'Windows 11 Pro', 'HP', 'ProDesk 400 G7', 'MXL3G001X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN3-002', 'Dell OptiPlex 7080', 'LASIN3', 'G', '02', 'Windows 11 Pro', 'Dell', 'OptiPlex 7080', 'DLL3G002X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN3-003', 'Lenovo ThinkCentre M90q', 'LASIN3', 'G', '03', 'Windows 11 Pro', 'Lenovo', 'ThinkCentre M90q', 'LNV3G003X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN3-004', 'HP EliteDesk 800 G5', 'LASIN3', 'G', '04', 'Windows 10 Pro', 'HP', 'EliteDesk 800 G5', 'MXL3G004X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN3-005', 'Dell OptiPlex 5090', 'LASIN3', 'G', '05', 'Windows 11 Pro', 'Dell', 'OptiPlex 5090', 'DLL3G005X', 'funcionando', true, NOW(), NOW()),
  ('PC-LASIN3-006', 'HP ProDesk 600 G5', 'LASIN3', 'G', '06', 'Windows 10 Pro', 'HP', 'ProDesk 600 G5', 'MXL3G006X', 'en_mantenimiento', true, NOW(), NOW());

-- 2. ADD PERIFERICOS FOR EVERY PC (monitor + keyboard + mouse)
-- This DO block generates perifericos for every equipo that doesn't already have that type

DO $$
DECLARE
  rec RECORD;
  pid_counter INT := 200;
  pid TEXT;
  monitores_marcas TEXT[][] := ARRAY[['Samsung','S22F350'],['LG','20MK400'],['Dell','SE2222H'],['HP','V24e'],['Lenovo','ThinkVision T24d'],['Acer','KA240H']];
  teclados_marcas TEXT[][] := ARRAY[['Logitech','K120'],['HP','K1500'],['Dell','KB216'],['Lenovo','ThinkPad USB'],['Genius','KB-110X']];
  mouse_marcas TEXT[][] := ARRAY[['Logitech','M100'],['HP','S100'],['Dell','MS116'],['Lenovo','ThinkPad USB'],['Genius','NX-7000']];
  midx INT;
  tidx INT;
  midx2 INT;
  mon_idx INT := 1;
  tec_idx INT := 1;
  mou_idx INT := 1;
BEGIN
  FOR rec IN SELECT codigo, laboratorio_id FROM equipos ORDER BY laboratorio_id, codigo LOOP
    -- Monitor: skip if this equipo already has one
    IF NOT EXISTS (SELECT 1 FROM perifericos WHERE equipo_codigo = rec.codigo AND tipo = 'Monitor') THEN
      pid_counter := pid_counter + 1;
      pid := 'UMSA-INF-2025-' || LPAD(pid_counter::TEXT, 3, '0');
      midx := (mon_idx - 1) % array_length(monitores_marcas, 1) + 1;
      INSERT INTO perifericos (id, tipo, marca, modelo, numero_serie, laboratorio_id, equipo_codigo, estado, activo, created_at)
      VALUES (pid, 'Monitor', monitores_marcas[midx][1], monitores_marcas[midx][2],
              'SN-MON-' || LPAD(pid_counter::TEXT, 4, '0'),
              rec.laboratorio_id, rec.codigo, 'Funcionando', true, NOW());
      mon_idx := mon_idx + 1;
    END IF;

    -- Teclado: skip if this equipo already has one
    IF NOT EXISTS (SELECT 1 FROM perifericos WHERE equipo_codigo = rec.codigo AND tipo = 'Teclado') THEN
      pid_counter := pid_counter + 1;
      pid := 'UMSA-INF-2025-' || LPAD(pid_counter::TEXT, 3, '0');
      tidx := (tec_idx - 1) % array_length(teclados_marcas, 1) + 1;
      INSERT INTO perifericos (id, tipo, marca, modelo, numero_serie, laboratorio_id, equipo_codigo, estado, activo, created_at)
      VALUES (pid, 'Teclado', teclados_marcas[tidx][1], teclados_marcas[tidx][2],
              'SN-KB-' || LPAD(pid_counter::TEXT, 4, '0'),
              rec.laboratorio_id, rec.codigo, 'Funcionando', true, NOW());
      tec_idx := tec_idx + 1;
    END IF;

    -- Mouse: skip if this equipo already has one
    IF NOT EXISTS (SELECT 1 FROM perifericos WHERE equipo_codigo = rec.codigo AND tipo = 'Mouse') THEN
      pid_counter := pid_counter + 1;
      pid := 'UMSA-INF-2025-' || LPAD(pid_counter::TEXT, 3, '0');
      midx2 := (mou_idx - 1) % array_length(mouse_marcas, 1) + 1;
      INSERT INTO perifericos (id, tipo, marca, modelo, numero_serie, laboratorio_id, equipo_codigo, estado, activo, created_at)
      VALUES (pid, 'Mouse', mouse_marcas[midx2][1], mouse_marcas[midx2][2],
              'SN-MS-' || LPAD(pid_counter::TEXT, 4, '0'),
              rec.laboratorio_id, rec.codigo, 'Funcionando', true, NOW());
      mou_idx := mou_idx + 1;
    END IF;
  END LOOP;
END $$;

-- 3. ADD INVENTARIO ITEMS FOR NEW PERIFERICOS (so stock tracking includes them)
-- Also add some extra spare parts
DO $$
DECLARE
  rec RECORD;
  inv_id INT := 20;
  cat_id TEXT;
  counter INT;
BEGIN
  -- Add inventario items for monitors, keyboards, mice that came from new PCs
  -- These are items "En almacén" to track stock
  FOR rec IN SELECT p.id, p.tipo, p.marca, p.modelo, p.numero_serie, p.laboratorio_id
             FROM perifericos p
             WHERE NOT EXISTS (SELECT 1 FROM inventario WHERE equipo_codigo IS NOT NULL AND equipo_codigo = p.equipo_codigo)
               AND p.tipo IN ('Monitor', 'Teclado', 'Mouse')
               AND p.numero_serie LIKE 'SN-MON%' OR p.numero_serie LIKE 'SN-KB%' OR p.numero_serie LIKE 'SN-MS%'
             ORDER BY p.id
  LOOP
    inv_id := inv_id + 1;
    IF rec.tipo = 'Monitor' THEN cat_id := 'monitor';
    ELSIF rec.tipo = 'Teclado' THEN cat_id := 'teclado';
    ELSIF rec.tipo = 'Mouse' THEN cat_id := 'mouse';
    ELSE cat_id := 'otro';
    END IF;
    INSERT INTO inventario (id, categoria_id, codigo_itic, numero_serie, marca, modelo, estado, fecha_ingreso, activo, created_at)
    VALUES (
      'INV-' || LPAD(inv_id::TEXT, 4, '0'),
      cat_id,
      'ITIC-' || UPPER(LEFT(rec.tipo, 3)) || '-' || LPAD(inv_id::TEXT, 4, '0'),
      rec.numero_serie,
      rec.marca,
      rec.modelo,
      'En almacén',
      CURRENT_DATE,
      true,
      NOW()
    );
  END LOOP;

  -- Add extra spare parts to be well stocked
  FOR counter IN 1..3 LOOP
    inv_id := inv_id + 1;
    INSERT INTO inventario (id, categoria_id, codigo_itic, numero_serie, marca, modelo, estado, fecha_ingreso, activo, created_at)
    VALUES ('INV-' || LPAD(inv_id::TEXT, 4, '0'), 'disco_duro',
            'ITIC-HDD-' || LPAD(inv_id::TEXT, 4, '0'),
            'WD-SN-' || LPAD(inv_id::TEXT, 4, '0'),
            CASE counter WHEN 1 THEN 'Seagate' WHEN 2 THEN 'Western Digital' ELSE 'Kingston' END,
            CASE counter WHEN 1 THEN 'Barracuda 1TB' WHEN 2 THEN 'Blue 1TB' ELSE 'A400 480GB' END,
            'En almacén', CURRENT_DATE, true, NOW());
  END LOOP;

  FOR counter IN 1..3 LOOP
    inv_id := inv_id + 1;
    INSERT INTO inventario (id, categoria_id, codigo_itic, numero_serie, marca, modelo, estado, fecha_ingreso, activo, created_at)
    VALUES ('INV-' || LPAD(inv_id::TEXT, 4, '0'), 'memoria_ram',
            'ITIC-RAM-' || LPAD(inv_id::TEXT, 4, '0'),
            'RAM-SN-' || LPAD(inv_id::TEXT, 4, '0'),
            CASE counter WHEN 1 THEN 'Kingston' WHEN 2 THEN 'Corsair' ELSE 'Crucial' END,
            CASE counter WHEN 1 THEN 'Fury 8GB DDR4' WHEN 2 THEN 'Vengeance 16GB DDR4' ELSE 'Ballistix 8GB DDR4' END,
            'En almacén', CURRENT_DATE, true, NOW());
  END LOOP;

  FOR counter IN 1..2 LOOP
    inv_id := inv_id + 1;
    INSERT INTO inventario (id, categoria_id, codigo_itic, numero_serie, marca, modelo, estado, fecha_ingreso, activo, created_at)
    VALUES ('INV-' || LPAD(inv_id::TEXT, 4, '0'), 'fuente_poder',
            'ITIC-PSU-' || LPAD(inv_id::TEXT, 4, '0'),
            'PSU-SN-' || LPAD(inv_id::TEXT, 4, '0'),
            CASE counter WHEN 1 THEN 'EVGA' ELSE 'Corsair' END,
            CASE counter WHEN 1 THEN '500W 80+ Bronze' ELSE 'VS600 600W' END,
            'En almacén', CURRENT_DATE, true, NOW());
  END LOOP;

  -- Add some monitors, keyboards, mice as spare stock (not assigned to any PC)
  FOR counter IN 1..5 LOOP
    inv_id := inv_id + 1;
    INSERT INTO inventario (id, categoria_id, codigo_itic, numero_serie, marca, modelo, estado, fecha_ingreso, activo, created_at)
    VALUES ('INV-' || LPAD(inv_id::TEXT, 4, '0'), 'monitor',
            'ITIC-MON-' || LPAD(inv_id::TEXT, 4, '0'),
            'STOCK-MON-' || LPAD(inv_id::TEXT, 4, '0'),
            CASE counter WHEN 1 THEN 'Samsung' WHEN 2 THEN 'LG' WHEN 3 THEN 'Dell' WHEN 4 THEN 'HP' ELSE 'Acer' END,
            CASE counter WHEN 1 THEN 'S22F350' WHEN 2 THEN '20MK400' WHEN 3 THEN 'SE2222H' WHEN 4 THEN 'V24e' ELSE 'KA240H' END,
            CASE WHEN counter <= 3 THEN 'En almacén' ELSE 'Operativo' END,
            CURRENT_DATE, true, NOW());
  END LOOP;

  FOR counter IN 1..5 LOOP
    inv_id := inv_id + 1;
    INSERT INTO inventario (id, categoria_id, codigo_itic, numero_serie, marca, modelo, estado, fecha_ingreso, activo, created_at)
    VALUES ('INV-' || LPAD(inv_id::TEXT, 4, '0'), 'teclado',
            'ITIC-TEC-' || LPAD(inv_id::TEXT, 4, '0'),
            'STOCK-KB-' || LPAD(inv_id::TEXT, 4, '0'),
            CASE counter WHEN 1 THEN 'Logitech' WHEN 2 THEN 'HP' WHEN 3 THEN 'Dell' WHEN 4 THEN 'Lenovo' ELSE 'Genius' END,
            CASE counter WHEN 1 THEN 'K120' WHEN 2 THEN 'K1500' WHEN 3 THEN 'KB216' WHEN 4 THEN 'ThinkPad USB' ELSE 'KB-110X' END,
            'En almacén', CURRENT_DATE, true, NOW());
  END LOOP;

  FOR counter IN 1..5 LOOP
    inv_id := inv_id + 1;
    INSERT INTO inventario (id, categoria_id, codigo_itic, numero_serie, marca, modelo, estado, fecha_ingreso, activo, created_at)
    VALUES ('INV-' || LPAD(inv_id::TEXT, 4, '0'), 'mouse',
            'ITIC-MSE-' || LPAD(inv_id::TEXT, 4, '0'),
            'STOCK-MS-' || LPAD(inv_id::TEXT, 4, '0'),
            CASE counter WHEN 1 THEN 'Logitech' WHEN 2 THEN 'HP' WHEN 3 THEN 'Dell' WHEN 4 THEN 'Lenovo' ELSE 'Genius' END,
            CASE counter WHEN 1 THEN 'M100' WHEN 2 THEN 'S100' WHEN 3 THEN 'MS116' WHEN 4 THEN 'ThinkPad USB' ELSE 'NX-7000' END,
            'En almacén', CURRENT_DATE, true, NOW());
  END LOOP;
END $$;
