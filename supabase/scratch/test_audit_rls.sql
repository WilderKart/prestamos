-- PRUEBA DE FUEGO: AUDITORÍA INMUTABLE (ZERO TRUST)

-- 1. Intento de Inserción Directa (Debe Fallar si no hay RLS de INSERT o si el usuario intenta spoofing)
-- NOTA: Nuestra política 'insert_logs' permite INSERT, pero la tabla solo es segura si usamos el RPC.
-- Si hay RLS de INSERT, el usuario debe pertenecer a la empresa.

-- 2. PRUEBA DE INMUTABILIDAD (DEBE FALLAR)
-- Intentar borrar un log (Cualquier usuario, incluso el capitán)
DELETE FROM public.logs_auditoria 
WHERE id = (SELECT id FROM public.logs_auditoria LIMIT 1);
-- ❌ Resultado esperado: 0 filas afectadas (Políticas RLS no lo permiten)

-- 3. PRUEBA DE NO-MODIFICACIÓN (DEBE FALLAR)
-- Intentar alterar el historial
UPDATE public.logs_auditoria 
SET accion = 'LOGIN_CAPITAN' 
WHERE id = (SELECT id FROM public.logs_auditoria LIMIT 1);
-- ❌ Resultado esperado: 0 filas afectadas o error de RLS

-- 4. PRUEBA DE MULTI-TENANCY (DEBE FALLAR)
-- Intentar ver logs de otra empresa (Simulado, requiere IDs reales)
-- SELECT * FROM public.logs_auditoria WHERE empresa_id = 'OTRA_UUID';
-- ❌ Resultado esperado: Vacío (Zero Trust)
