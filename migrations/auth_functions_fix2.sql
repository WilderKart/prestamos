-- Verificar funciones existentes
SELECT proname, pg_get_function_result(oid) as return_type 
FROM pg_proc 
WHERE proname IN ('usuario_existe', 'usuario_activo', 'get_user_role')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS usuario_existe();
DROP FUNCTION IF EXISTS usuario_activo();
DROP FUNCTION IF EXISTS get_user_role();

-- Crear funciones nuevas

-- 1. usuario_existe
CREATE FUNCTION usuario_existe()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. usuario_activo
CREATE FUNCTION usuario_activo()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND estado = 'ACTIVO');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. get_user_role
CREATE FUNCTION get_user_role()
RETURNS VARCHAR(50) AS $$
DECLARE v_rol VARCHAR(50);
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT rol INTO v_rol FROM usuarios WHERE id = auth.uid();
  RETURN v_rol;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Verificar creación
SELECT proname, pg_get_function_result(oid) as return_type 
FROM pg_proc 
WHERE proname IN ('usuario_existe', 'usuario_activo', 'get_user_role');
