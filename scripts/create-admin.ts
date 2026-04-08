import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Faltan variables de entorno en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  const email = 'admin@mivank.com';
  const password = 'prisioner';
  const nombre = 'Admin Mivank';

  console.log(`Buscando usuario: ${email}...`);

  // 1. Listar usuarios para ver si ya existe
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listando usuarios:', listError.message);
    return;
  }

  const existingUser = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;

  if (existingUser) {
    console.log(`Usuario encontrado (ID: ${existingUser.id}). Reseteando contraseña...`);
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: password, email_confirm: true }
    );

    if (updateError) {
      console.error('Error al actualizar contraseña:', updateError.message);
      return;
    }
    userId = existingUser.id;
    console.log('Contraseña actualizada correctamente.');
  } else {
    console.log('Usuario no encontrado. Creando nuevo...');
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { nombre: nombre }
    });

    if (createError) {
      console.error('Error al crear usuario:', createError.message);
      return;
    }
    userId = createData.user!.id;
    console.log('Usuario creado en Auth correctamente.');
  }

  // 2. Vincular/Actualizar en tabla pública
  console.log('Sincronizando con tabla public.usuarios...');
  const { error: upsertError } = await supabase
    .from('usuarios')
    .upsert({
      id: userId,
      email: email,
      nombre: nombre,
      rol: 'ADMIN'
    }, { onConflict: 'id' });

  if (upsertError) {
    console.error('Error al sincronizar tabla pública:', upsertError.message);
  } else {
    console.log('¡Operación exitosa!');
    console.log('User:', email);
    console.log('Pass:', password);
    console.log('Rol:', 'ADMIN');
  }
}

setupAdmin();
