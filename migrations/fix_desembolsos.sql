-- ==========================================
-- CORRECCIÓN ARQUITECTURA DESEMBOLSOS
-- Ejecutar en SQL Editor de Supabase
-- ==========================================

-- 1. ELIMINAR CAMPO INCORRECTO (duplicaba estado)
ALTER TABLE prestamos DROP COLUMN IF EXISTS desembolsado;

-- 2. EVITAR MÚLTIPLES DESEMBOLSOS (protección crítica)
CREATE UNIQUE INDEX IF NOT EXISTS unico_desembolso_por_prestamo
ON desembolsos(prestamo_id);

-- 3. FUNCIÓN PARA CONSULTAR SI PRÉSTAMO ESTÁ DESEMBOLSADO
CREATE OR REPLACE FUNCTION prestamo_esta_desembolsado(p_prestamo UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM desembolsos 
    WHERE prestamo_id = p_prestamo
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. VIEW PARA USO EN FRONTEND (evita consultas repetitivas)
CREATE OR REPLACE VIEW prestamos_con_desembolso AS
SELECT 
  p.*,
  EXISTS (
    SELECT 1 
    FROM desembolsos d 
    WHERE d.prestamo_id = p.id
  ) AS desembolsado,
  (
    SELECT d.monto 
    FROM desembolsos d 
    WHERE d.prestamo_id = p.id
    LIMIT 1
  ) AS monto_desembolsado,
  (
    SELECT d.fecha_desembolso 
    FROM desembolsos d 
    WHERE d.prestamo_id = p.id
    LIMIT 1
  ) AS fecha_desembolso,
  (
    SELECT d.metodo_desembolso 
    FROM desembolsos d 
    WHERE d.prestamo_id = p.id
    LIMIT 1
  ) AS metodo_desembolso,
  (
    SELECT d.comprobante_url 
    FROM desembolsos d 
    WHERE d.prestamo_id = p.id
    LIMIT 1
  ) AS comprobante_desembolso
FROM prestamos p;
