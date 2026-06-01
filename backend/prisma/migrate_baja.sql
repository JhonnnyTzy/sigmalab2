ALTER TABLE equipos
  ADD COLUMN fecha_baja DATE,
  ADD COLUMN motivo_baja TEXT,
  ADD COLUMN reemplazado_por VARCHAR(30) REFERENCES equipos(codigo);
