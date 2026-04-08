"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "El email y la contraseña son obligatorios." };
  }

  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { error: "Credenciales incorrectas." };
  }

  // Verificar existencia (evita que un usuario de auth no inyectado en DB entre)
  const { data: existe, error: existeError } = await supabase.rpc("usuario_existe");
  
  if (existeError || !existe) {
    await supabase.auth.signOut();
    return { error: "Usuario no autorizado." };
  }

  // Verificar bloqueo
  const { data: activo, error: activoError } = await supabase.rpc("usuario_activo");
  
  if (activoError || !activo) {
    await supabase.auth.signOut();
    return { error: "Usuario bloqueado." };
  }

  // La redirección ocurrirá por medio del middleware automáticamente.
  // Solo forzamos un refetch hacia la raíz y el middleware nos enviará a /admin, /cliente o /capitan.
  redirect("/");
}
