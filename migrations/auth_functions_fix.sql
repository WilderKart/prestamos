-- ==========================================
-- CORRECCIÓN: FUNCIONES DE AUTENTICACIÓN ZERO TRUST
-- Ejecute en SQL Editor de Supabase
-- ==========================================

-- 1. Función para verificar si usuario existe en la tabla usuarios
CREATE OR REPLACE FUNCTION usuario_existe()
RETURNS BOOLEAN AS $$
BEGIN
  -- Retorna false si auth.uid() es NULL
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM usuarios WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Función para verificar si usuario está activo
CREATE OR REPLACE FUNCTION usuario_activo()
RETURNS BOOLEAN AS $$
BEGIN
  -- Retorna false si auth.uid() es NULL
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND estado = 'ACTIVO'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. Función para obtener el rol del usuario (CORREGIDA)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR(50) AS $$
DECLARE v_rol VARCHAR(50);
BEGIN
  -- Retorna NULL si auth.uid() es NULL (sin generar excepción)
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT rol INTO v_rol FROM usuarios WHERE id = auth.uid();
  
  -- Retorna NULL si no encuentra el usuario
  RETURN v_rol;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Verificar que las funciones se crearon correctamente
SELECT 
  proname AS funcion,
  prosrc AS definicion_corta
FROM pg_proc 
WHERE proname IN ('usuario_existe', 'usuario_activo', 'get_user_role')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
