-- Primero ver el return type actual
SELECT proname, pg_get_function_result(oid) as return_type 
FROM pg_proc 
WHERE proname = 'get_user_role';

-- Verificar si las funciones ya existen y funcionan
-- En lugar de drop, usamos ALTER para cambiar el return type si es necesario
-- Pero primero verifiquemos si existen
