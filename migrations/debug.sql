-- SQL más simple - crear funciones sin eliminar

-- 1. Verificar si get_user_role existe y su definición
SELECT prosrc FROM pg_proc WHERE proname = 'get_user_role';

-- 2. Si existe, ver qué pasa con ella
