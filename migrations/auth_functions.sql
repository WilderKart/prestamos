-- ==========================================
-- FUNCIONES DE AUTENTICACIÓN (LOGIN)
-- Ejecutar en SQL Editor de Supabase
-- ==========================================

-- 1. Verificar si usuario existe en tabla usuarios
CREATE OR REPLACE FUNCTION usuario_existe()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Verificar si usuario está activo (no bloqueado)
CREATE OR REPLACE FUNCTION usuario_activo()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() AND estado = 'ACTIVO'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. Obtener rol del usuario
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR(50) AS $$
DECLARE
  v_rol VARCHAR(50);
BEGIN
  SELECT rol INTO v_rol FROM usuarios WHERE id = auth.uid();
  RETURN v_rol;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

SELECT 'Funciones creadas exitosamente' AS resultado;
