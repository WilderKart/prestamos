-- ==========================================================
-- CAPITÁN FLOW: INFRAESTRUCTURA DE PRODUCCIÓN (ZERO TRUST)
-- ==========================================================

-- 1. TABLA DE NOTIFICACIONES
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'RUTA_ASIGNADA', 'PAGO_REGISTRADO', 'ALERTA_MORA'
  titulo TEXT NOT NULL,
  descripcion TEXT,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexación de performance y unicidad (Anti-Spam)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_notification 
ON public.notificaciones (user_id, tipo, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON public.notificaciones (user_id, created_at DESC);

-- Habilitar RLS
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS Tácticas
DROP POLICY IF EXISTS sel_own_notifications ON public.notificaciones;
CREATE POLICY sel_own_notifications ON public.notificaciones 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS sel_company_notifications ON public.notificaciones;
CREATE POLICY sel_company_notifications ON public.notificaciones 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND rol = 'CAPITAN' AND empresa_id = public.notificaciones.empresa_id
  )
);

DROP POLICY IF EXISTS insert_notifications ON public.notificaciones;
CREATE POLICY insert_notifications ON public.notificaciones 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND empresa_id = public.notificaciones.empresa_id
  )
);

DROP POLICY IF EXISTS update_notifications ON public.notificaciones;
CREATE POLICY update_notifications ON public.notificaciones 
FOR UPDATE USING (auth.uid() = user_id);

-- 2. TABLA DE CONFIGURACIÓN DE EMPRESA
CREATE TABLE IF NOT EXISTS public.configuracion_empresa (
  empresa_id UUID PRIMARY KEY REFERENCES public.empresas(id) ON DELETE CASCADE,
  monto_minimo_comprobante NUMERIC DEFAULT 0,
  requiere_comprobante BOOLEAN DEFAULT false
);

-- Habilitar RLS
ALTER TABLE public.configuracion_empresa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View company config" ON public.configuracion_empresa;
CREATE POLICY "View company config" ON public.configuracion_empresa 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND empresa_id = public.configuracion_empresa.empresa_id
  )
);

DROP POLICY IF EXISTS "Update company config" ON public.configuracion_empresa;
CREATE POLICY "Update company config" ON public.configuracion_empresa 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND rol = 'CAPITAN' AND empresa_id = public.configuracion_empresa.empresa_id
  )
);

-- Trigger para crear configuración por defecto al crear una empresa
CREATE OR REPLACE FUNCTION public.handle_new_company_config()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.configuracion_empresa (empresa_id, monto_minimo_comprobante, requiere_comprobante)
  VALUES (NEW.id, 50000, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_company_created ON public.empresas;
CREATE TRIGGER on_company_created
  AFTER INSERT ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_company_config();

-- 5. FUNCIÓN TÁCTICA PARA RADAR GLOBAL (ZERO TRUST)
DROP FUNCTION IF EXISTS public.rpc_global_radar_snapshot();

CREATE OR REPLACE FUNCTION public.rpc_global_radar_snapshot()
RETURNS TABLE (
    cobrador_id UUID,
    nombre TEXT,
    lat NUMERIC,
    lng NUMERIC,
    status TEXT,
    last_report TIMESTAMPTZ
) AS $$
DECLARE
    user_empresa_id UUID;
BEGIN
    -- 🔐 1. Obtener la empresa_id de quien llama
    SELECT empresa_id INTO user_empresa_id 
    FROM public.usuarios 
    WHERE id = auth.uid();

    RETURN QUERY
    WITH LatestPoints AS (
        -- Obtener la última posición conocida de cada cobrador de la empresa
        SELECT DISTINCT ON (ct.cobrador_id)
            ct.cobrador_id,
            ct.lat,
            ct.lng,
            ct.created_at
        FROM public.cobrador_tracking ct
        WHERE ct.empresa_id = user_empresa_id
        ORDER BY ct.cobrador_id, ct.created_at DESC
    )
    SELECT 
        u.id as cobrador_id,
        u.nombre,
        COALESCE(lp.lat, 0) as lat,
        COALESCE(lp.lng, 0) as lng,
        CASE 
            WHEN lp.created_at >= NOW() - INTERVAL '5 minutes' THEN 'active'
            WHEN lp.created_at >= NOW() - INTERVAL '15 minutes' THEN 'weak'
            ELSE 'offline'
        END as status,
        lp.created_at as last_report
    FROM public.usuarios u
    LEFT JOIN LatestPoints lp ON u.id = lp.cobrador_id
    WHERE u.empresa_id = user_empresa_id
      AND u.rol = 'COBRADOR'
      AND u.status = 'ACTIVO';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. AUDITORÍA INMUTABLE (SaaS-Grade Elite)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
        CREATE TYPE public.audit_action AS ENUM (
          'PAGO_REGISTRADO',
          'RUTA_ASIGNADA',
          'CLIENTE_CREADO',
          'SOLICITUD_PROCESADA',
          'LOGIN_CAPITAN'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, 
  accion public.audit_action NOT NULL,
  detalles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices Industriales (Alto Rendimiento)
CREATE INDEX IF NOT EXISTS idx_logs_empresa_fecha ON public.logs_auditoria (empresa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs_auditoria (user_id);

-- RPC Seguro (Security Definer)
CREATE OR REPLACE FUNCTION public.insert_log_secure(p_accion public.audit_action, p_detalles JSONB)
RETURNS void AS $$
BEGIN
  INSERT INTO public.logs_auditoria (empresa_id, user_id, accion, detalles)
  SELECT empresa_id, id, p_accion, p_detalles
  FROM public.usuarios
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Optimizado (Capa de Seguridad Base)
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sel_logs_empresa ON public.logs_auditoria;
CREATE POLICY sel_logs_empresa ON public.logs_auditoria FOR SELECT
USING (empresa_id = (SELECT empresa_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1));

CREATE POLICY no_update_logs ON public.logs_auditoria FOR UPDATE USING (false);
CREATE POLICY no_delete_logs ON public.logs_auditoria FOR DELETE USING (false);

-- 7. VISTA DE AUDITORÍA OPTIMIZADA (Join de Sesión + Fallback Sistema)
CREATE OR REPLACE VIEW public.v_logs_actividad AS
SELECT 
    l.*,
    COALESCE(u.nombre, 'Sistema') as usuario_nombre,
    u.rol as usuario_rol,
    (u.id IS NULL) as is_system_action
FROM public.logs_auditoria l
LEFT JOIN public.usuarios u ON u.id = l.user_id
JOIN public.usuarios me ON me.id = auth.uid()
WHERE l.empresa_id = me.empresa_id;

-- 8. PREFERENCIAS Y PERFIL REFORZADO
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS config_notificaciones JSONB 
DEFAULT '{"in_app": true, "email": false, "push": true}'::jsonb;

DROP POLICY IF EXISTS select_own_profile ON public.usuarios;
CREATE POLICY select_own_profile ON public.usuarios FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS update_own_preferences ON public.usuarios;
CREATE POLICY update_own_preferences ON public.usuarios FOR UPDATE USING (auth.uid() = id);

-- 9. MANTENIMIENTO (Plan A: pg_cron)
CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('purge_logs_30d', '0 3 * * *', $$DELETE FROM public.logs_auditoria WHERE created_at < now() - interval '30 days'$$);

-- 10. ACTIVACIÓN SEGURA DE COBRADORES (Solo Limbo)
UPDATE public.usuarios SET status = 'ACTIVO' 
WHERE rol = 'COBRADOR' AND status IS NULL;

-- 11. PERMISOS Y RECARGA DE ESQUEMA (Fix API Cache)
GRANT SELECT ON public.v_logs_actividad TO authenticated;
GRANT SELECT ON public.v_logs_actividad TO service_role;
NOTIFY pgrst, 'reload schema';

-- 12. CORRECCIÓN DE SEGURIDAD ESTRUCTURAL (Arquitectura Multi-tenant Soberana)
CREATE OR REPLACE FUNCTION protect_user_fields()
RETURNS trigger AS $$
DECLARE
  current_role TEXT;
  current_empresa UUID;
BEGIN
  -- 🟢 1. Validaciones Críticas de Integridad (Aplican a TODO rol, incluido Service Role)
  IF (TG_OP = 'INSERT') THEN
    -- Obligatoriedad de Contexto
    IF NEW.empresa_id IS NULL THEN
      RAISE EXCEPTION 'Aislamiento Multi-tenant: empresa_id es requerido para nuevos registros.';
    END IF;
    
    IF NEW.creado_por IS NULL THEN
      RAISE EXCEPTION 'Auditoría: creado_por es requerido para nuevos registros.';
    END IF;

    -- Validación Cruzada de Existencia (Nivel Élite)
    IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = NEW.creado_por) THEN
      RAISE EXCEPTION 'Integridad: El creador especificado no existe en el sistema.';
    END IF;

    -- Restricción de Roles en Creación
    IF NEW.rol = 'ADMIN' THEN
      RAISE EXCEPTION 'Seguridad: No se permite la creación de administradores por este flujo.';
    END IF;
  END IF;

  -- 🟢 2. Contexto de Sesión para Edición (UPDATE)
  -- Intentamos obtener el rol de quien ejecuta (auth.uid() puede ser NULL en backend)
  SELECT rol, empresa_id INTO current_role, current_empresa
  FROM public.usuarios
  WHERE id = auth.uid();

  -- IF current_role = 'ADMIN' THEN RETURN NEW; END IF; -- Opcional si queremos bypass total para admin

  -- 🔴 RESTRICCIONES DE CAMBIO ESTRUCTURAL (Solo en UPDATE)
  IF (TG_OP = 'UPDATE') THEN
    IF (NEW.rol IS DISTINCT FROM OLD.rol) OR 
       (NEW.empresa_id IS DISTINCT FROM OLD.empresa_id) OR
       (NEW.creado_por IS DISTINCT FROM OLD.creado_por) THEN
      -- Un usuario no puede promocionarse o cambiarse de empresa a sí mismo
      IF (NEW.id = auth.uid()) THEN
        RAISE EXCEPTION 'No tienes permisos para modificar tus propios campos estructurales.';
      END IF;
    END IF;
  END IF;

  -- 🟢 3. Reglas Específicas del Capitán
  IF current_role = 'CAPITAN' THEN
    -- El Capitán SOLO gestiona usuarios de su misma empresa (Aislamiento físico)
    IF NEW.empresa_id IS DISTINCT FROM current_empresa THEN
      RAISE EXCEPTION 'Aislamiento Multi-tenant: No puedes gestionar usuarios de otra organización.';
    END IF;
    RETURN NEW;
  END IF;

  -- 🟢 4. Auto-Edición (Perfil/Preferencias)
  IF NEW.id = auth.uid() THEN
    RETURN NEW;
  END IF;

  -- 🟢 5. Bypass para acciones legítimas de sistema (Service Role)
  -- Si llegamos aquí y no hay auth.uid(), pero es un INSERT válido, permitimos
  IF (auth.uid() IS NULL) AND (TG_OP = 'INSERT') THEN
    RETURN NEW;
  END IF;

  -- ❌ Rechazo por defecto
  RAISE EXCEPTION 'Permiso insuficiente para esta operación operativa.';

END;
$$ LANGUAGE plpgsql;

-- 13. BLINDAJE DE INFRAESTRUCTURA (Nivel Dios SaaS)
-- Asegurar integridad física y performance del modelo de datos

-- Columnas de soporte (Aseguramos que existan antes de blindarlas)
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS cedula VARCHAR(20),
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS motivo_bloqueo TEXT;

-- Blindaje Físico: NOT NULL en campos críticos
ALTER TABLE public.usuarios ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN creado_por SET NOT NULL;

-- Constraint Lógico (Garantía de Vínculo)
ALTER TABLE public.usuarios 
DROP CONSTRAINT IF EXISTS chk_empresa_creador,
ADD CONSTRAINT chk_empresa_creador 
CHECK (empresa_id IS NOT NULL AND creado_por IS NOT NULL);

-- Índice de Performance (Aceleración de Dashboard y Listados)
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON public.usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_cedula ON public.usuarios(cedula);

-- Sincronización de API
NOTIFY pgrst, 'reload schema';
