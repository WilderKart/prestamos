-- Ver usuarios en auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Ver usuarios en tabla usuarios
SELECT id, nombre, email, rol, estado FROM usuarios ORDER BY created_at DESC LIMIT 10;
