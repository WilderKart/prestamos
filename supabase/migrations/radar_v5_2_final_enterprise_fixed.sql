-- Mivank Radar Global V5.2: Arquitectura Enterprise Resiliente
-- Migración: radar_v5_2_final_enterprise_fixed.sql

-- 1. RPC PRINCIPAL: Obtener última ubicación de la flota (Zero Trust)
-- Esta función NO filtra por tiempo para permitir la degradación visual en el frontend.
CREATE OR REPLACE FUNCTION get_latest_tracking_for_company()
RETURNS TABLE (
  cobrador_id UUID,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ,
  nombre TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (t.cobrador_id)
    t.cobrador_id,
    t.lat,
    t.lng,
    t.created_at,
    u.nombre
  FROM cobrador_tracking t
  INNER JOIN usuarios u ON u.id = t.cobrador_id
  INNER JOIN usuarios me ON me.id = auth.uid()
  WHERE u.empresa_id = me.empresa_id
  AND u.estado_mision = 'EN_MISION'
  ORDER BY t.cobrador_id, t.created_at DESC;
END;
$$;

-- 2. RPC RUTA ACTIVA: Ubicar misión del día para navegación táctica
CREATE OR REPLACE FUNCTION get_active_route_for_collector(cobrador UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE route_id UUID;
BEGIN
  -- Buscamos rutas bajo el huso horario de Bogotá
  SELECT r.id INTO route_id
  FROM rutas r
  INNER JOIN usuarios me ON me.id = auth.uid()
  WHERE r.cobrador_id = cobrador
  AND r.empresa_id = me.empresa_id
  AND r.estado IN ('pendiente', 'ACTIVA') -- Resiliencia ante estados legacy
  AND r.fecha = (NOW() AT TIME ZONE 'America/Bogota')::date
  ORDER BY r.created_at DESC
  LIMIT 1;

  RETURN route_id;
END;
$$;

-- 3. ÍNDICES DE RENDIMIENTO TELEMÉTRICO
CREATE INDEX IF NOT EXISTS idx_tracking_cobrador_time
ON cobrador_tracking (cobrador_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tracking_empresa_time
ON cobrador_tracking (empresa_id, created_at DESC);

-- 4. COMENTARIOS DE SEGURIDAD
COMMENT ON FUNCTION get_latest_tracking_for_company() IS 'Obtiene la última posición conocida de cada cobrador activo de la empresa del solicitante. Zero Trust activado via auth.uid().';
COMMENT ON FUNCTION get_active_route_for_collector(UUID) IS 'Resuelve el ID de la ruta operativa de hoy para un cobrador bajo el huso horario de Bogotá.';
