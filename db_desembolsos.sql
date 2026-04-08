-- ==========================================
-- MIGRACIÓN: SISTEMA DE DESEMBOLSOS - MIVANK
-- Ejecutar en SQL Editor de Supabase
-- ==========================================

-- 1. Agregar columna desembolsado a prestamos (si no existe)
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS desembolsado BOOLEAN DEFAULT FALSE;

-- 2. Asegurar que la tabla desembolsos existe (si ya fue creada, esto no hará daño)
-- ENUM para método de desembolso
DO $$ BEGIN 
  CREATE TYPE metodo_desembolso AS ENUM ('EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TRANSFERENCIA'); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tabla desembolsos (si no existe)
CREATE TABLE IF NOT EXISTS desembolsos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prestamo_id UUID REFERENCES prestamos(id) NOT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  metodo_desembolso metodo_desembolso NOT NULL,
  comprobante_url VARCHAR(500),
  fecha_desembolso DATE NOT NULL DEFAULT NOW(),
  capitan_id UUID REFERENCES usuarios(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_desembolsos_prestamo ON desembolsos(prestamo_id);
CREATE INDEX IF NOT EXISTS idx_desembolsos_capitan ON desembolsos(capitan_id);

-- RLS para desembolsos
ALTER TABLE desembolsos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Admin: acceso total
DROP POLICY IF EXISTS admin_desembolsos ON desembolsos;
CREATE POLICY admin_desembolsos ON desembolsos FOR ALL 
USING (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN')) 
WITH CHECK (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN'));

-- Capitán: solo sus desembolsos
DROP POLICY IF EXISTS capitan_desembolsos ON desembolsos;
CREATE POLICY capitan_desembolsos ON desembolsos FOR ALL
USING (capitan_id = auth.uid()) 
WITH CHECK (capitan_id = auth.uid());

-- Cliente: solo lectura de sus desembolsos
DROP POLICY IF EXISTS cliente_desembolsos ON desembolsos;
CREATE POLICY cliente_desembolsos ON desembolsos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM prestamos p 
  JOIN clientes c ON p.cliente_id = c.id 
  WHERE p.id = desembolsos.prestamo_id 
  AND c.usuario_id = auth.uid()
));
