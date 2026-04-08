-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TIPOS ENUM
DO $$ BEGIN CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'CAPITAN', 'CLIENTE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE estado_usuario AS ENUM ('ACTIVO', 'BLOQUEADO'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE score_cliente AS ENUM ('BUENO', 'RIESGOSO', 'MOROSO'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE estado_prestamo AS ENUM ('ACTIVO', 'FINALIZADO', 'EN_MORA', 'REFINANCIADO'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tipo_prestamo AS ENUM ('NORMAL', 'RETANQUEO'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE estado_cuota AS ENUM ('PENDIENTE', 'ABONO', 'PAGADO', 'EN_MORA'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE metodo_pago AS ENUM ('EFECTIVO', 'NEQUI', 'BANCO'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE estado_pago AS ENUM ('PENDIENTE_VALIDACION', 'APROBADO', 'RECHAZADO'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tipo_notificacion AS ENUM ('PAGO_APROBADO', 'PAGO_RECHAZADO', 'RETANQUEO_APROBADO', 'RETANQUEO_RECHAZADO'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. USUARIOS (EXTENSIÓN DE AUTH.USERS)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol rol_usuario NOT NULL,
  estado estado_usuario DEFAULT 'ACTIVO',
  creado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) UNIQUE,
  capitan_id UUID REFERENCES usuarios(id) NOT NULL,
  cedula VARCHAR(50) UNIQUE NOT NULL,
  telefono VARCHAR(50),
  direccion TEXT,
  score score_cliente DEFAULT 'BUENO'
);

-- 3. PRESTAMOS
CREATE TABLE IF NOT EXISTS prestamos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  capitan_id UUID REFERENCES usuarios(id) NOT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  saldo_actual DECIMAL(12,2) NOT NULL CHECK (saldo_actual >= 0),
  interes DECIMAL(5,2) NOT NULL,
  interes_mora DECIMAL(5,2) NOT NULL,
  frecuencia VARCHAR(50) NOT NULL,
  numero_cuotas INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  estado estado_prestamo DEFAULT 'ACTIVO',
  tipo tipo_prestamo DEFAULT 'NORMAL',
  prestamo_origen_id UUID REFERENCES prestamos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CUOTAS
CREATE TABLE IF NOT EXISTS cuotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prestamo_id UUID REFERENCES prestamos(id) NOT NULL,
  numero INT NOT NULL,
  fecha_pago DATE NOT NULL,
  valor_cuota DECIMAL(12,2) NOT NULL CHECK (valor_cuota > 0),
  valor_pagado DECIMAL(12,2) DEFAULT 0 CHECK (valor_pagado >= 0),
  saldo_restante DECIMAL(12,2) NOT NULL CHECK (saldo_restante >= 0),
  estado estado_cuota DEFAULT 'PENDIENTE',
  dias_mora INT DEFAULT 0,
  mora_acumulada DECIMAL(12,2) DEFAULT 0 CHECK (mora_acumulada >= 0)
);

-- 5. PAGOS
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prestamo_id UUID REFERENCES prestamos(id) NOT NULL,
  valor DECIMAL(12,2) NOT NULL CHECK (valor > 0),
  metodo metodo_pago NOT NULL,
  comprobante_url VARCHAR(255),
  estado estado_pago DEFAULT 'PENDIENTE_VALIDACION',
  creado_por UUID REFERENCES usuarios(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PAGOS DETALLE (RESTRICCIONES Y CHECKS)
CREATE TABLE IF NOT EXISTS pagos_detalle (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pago_id UUID REFERENCES pagos(id) NOT NULL,
  cuota_id UUID REFERENCES cuotas(id) NOT NULL,
  monto_aplicado DECIMAL(12,2) NOT NULL CHECK (monto_aplicado > 0),
  UNIQUE (pago_id, cuota_id)
);

-- 7. NOTIFICACIONES, PERMISOS_MODULO Y AUDITORIA
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) NOT NULL,
  tipo tipo_notificacion NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permisos_modulo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) NOT NULL,
  modulo VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) NOT NULL,
  accion VARCHAR(100) NOT NULL,
  entidad VARCHAR(100) NOT NULL,
  entidad_id UUID NOT NULL,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES DE OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_cuotas_prestamo_numero ON cuotas(prestamo_id, numero);
CREATE INDEX IF NOT EXISTS idx_prestamos_capitan ON prestamos(capitan_id);
CREATE INDEX IF NOT EXISTS idx_clientes_capitan ON clientes(capitan_id);

-- TRIGGER VALIDACIÓN DE PAGOS
CREATE OR REPLACE FUNCTION check_pago_valido() RETURNS TRIGGER AS $$
DECLARE
  v_saldo_actual DECIMAL;
BEGIN
  IF NEW.valor <= 0 THEN
      RAISE EXCEPTION 'El pago debe ser mayor a 0.';
  END IF;
  
  SELECT saldo_actual INTO v_saldo_actual FROM prestamos WHERE id = NEW.prestamo_id;
  
  IF v_saldo_actual IS NULL THEN
      RAISE EXCEPTION 'Prestamo no existe.';
  END IF;

  IF NEW.valor > v_saldo_actual THEN
      RAISE EXCEPTION 'El pago (%) supera la deuda actual del prestamo (%).', NEW.valor, v_saldo_actual;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_pago ON pagos;
CREATE TRIGGER trigger_check_pago BEFORE INSERT OR UPDATE ON pagos FOR EACH ROW EXECUTE FUNCTION check_pago_valido();

-- ENABLE ROW LEVEL SECURITY EN TODAS LAS TABLAS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_modulo ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS (CORREGIDAS)

-- 2.1 ADMIN (Acceso Total)
-- Usamos EXISTS para evitar recursión y permitir bootstrap de nuevos admins
DROP POLICY IF EXISTS admin_all ON usuarios;
CREATE POLICY admin_all ON usuarios FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id = auth.uid() 
    AND u.rol = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id = auth.uid() 
    AND u.rol = 'ADMIN'
  )
);

DROP POLICY IF EXISTS admin_clientes ON clientes;
CREATE POLICY admin_clientes ON clientes FOR ALL USING (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN')) WITH CHECK (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN'));

DROP POLICY IF EXISTS admin_prestamos ON prestamos;
CREATE POLICY admin_prestamos ON prestamos FOR ALL USING (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN')) WITH CHECK (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN'));

DROP POLICY IF EXISTS admin_cuotas ON cuotas;
CREATE POLICY admin_cuotas ON cuotas FOR ALL USING (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN')) WITH CHECK (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN'));

DROP POLICY IF EXISTS admin_pagos ON pagos;
CREATE POLICY admin_pagos ON pagos FOR ALL USING (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN')) WITH CHECK (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN'));

DROP POLICY IF EXISTS admin_pagos_detalle ON pagos_detalle;
CREATE POLICY admin_pagos_detalle ON pagos_detalle FOR ALL USING (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN')) WITH CHECK (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN'));

DROP POLICY IF EXISTS admin_auditoria ON auditoria;
CREATE POLICY admin_auditoria ON auditoria FOR ALL USING (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN')) WITH CHECK (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN'));

DROP POLICY IF EXISTS admin_notificaciones ON notificaciones;
CREATE POLICY admin_notificaciones ON notificaciones FOR ALL USING (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN')) WITH CHECK (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN'));

DROP POLICY IF EXISTS admin_permisos ON permisos_modulo;
CREATE POLICY admin_permisos ON permisos_modulo FOR ALL USING (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN')) WITH CHECK (EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'ADMIN'));

-- 2.2 CAPITÁN (Solo data de su propiedad)
DROP POLICY IF EXISTS capitan_clientes ON clientes;
CREATE POLICY capitan_clientes ON clientes FOR ALL
USING (capitan_id = auth.uid()) WITH CHECK (capitan_id = auth.uid());

DROP POLICY IF EXISTS capitan_prestamos ON prestamos;
CREATE POLICY capitan_prestamos ON prestamos FOR ALL
USING (capitan_id = auth.uid()) WITH CHECK (capitan_id = auth.uid());

DROP POLICY IF EXISTS capitan_cuotas ON cuotas;
CREATE POLICY capitan_cuotas ON cuotas FOR ALL
USING (EXISTS (SELECT 1 FROM prestamos p WHERE p.id = cuotas.prestamo_id AND p.capitan_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM prestamos p WHERE p.id = cuotas.prestamo_id AND p.capitan_id = auth.uid()));

DROP POLICY IF EXISTS capitan_pagos ON pagos;
CREATE POLICY capitan_pagos ON pagos FOR ALL
USING (EXISTS (SELECT 1 FROM prestamos p WHERE p.id = pagos.prestamo_id AND p.capitan_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM prestamos p WHERE p.id = pagos.prestamo_id AND p.capitan_id = auth.uid()));

DROP POLICY IF EXISTS capitan_pagos_detalle ON pagos_detalle;
CREATE POLICY capitan_pagos_detalle ON pagos_detalle FOR ALL
USING (EXISTS (SELECT 1 FROM pagos pa JOIN prestamos p ON pa.prestamo_id = p.id WHERE pa.id = pagos_detalle.pago_id AND p.capitan_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM pagos pa JOIN prestamos p ON pa.prestamo_id = p.id WHERE pa.id = pagos_detalle.pago_id AND p.capitan_id = auth.uid()));

-- 2.3 CLIENTE
DROP POLICY IF EXISTS cliente_prestamos ON prestamos;
CREATE POLICY cliente_prestamos ON prestamos FOR SELECT
USING (EXISTS (SELECT 1 FROM clientes c WHERE c.id = prestamos.cliente_id AND c.usuario_id = auth.uid()));

DROP POLICY IF EXISTS cliente_cuotas ON cuotas;
CREATE POLICY cliente_cuotas ON cuotas FOR SELECT
USING (EXISTS (SELECT 1 FROM prestamos p JOIN clientes c ON p.cliente_id = c.id WHERE p.id = cuotas.prestamo_id AND c.usuario_id = auth.uid()));

DROP POLICY IF EXISTS cliente_pagos_select ON pagos;
CREATE POLICY cliente_pagos_select ON pagos FOR SELECT
USING (creado_por = auth.uid());

DROP POLICY IF EXISTS cliente_pagos_insert ON pagos;
CREATE POLICY cliente_pagos_insert ON pagos FOR INSERT
WITH CHECK (creado_por = auth.uid() AND estado = 'PENDIENTE_VALIDACION');
