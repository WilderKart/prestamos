"use server";

import { createClient, getCurrentUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "El email y la contraseña son obligatorios." };
  }

  const supabase = await createClient();

  // Intento de login
  const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !signInData?.user) {
    console.error("Error de autenticación:", authError?.message);
    return { error: "Credenciales incorrectas." };
  }

  // Verificar que el usuario existe en la tabla usuarios
  const { data: existe, error: existeError } = await supabase.rpc("usuario_existe");
  
  if (existeError || !existe) {
    console.error("Usuario no existe en tabla usuarios:", existeError);
    await supabase.auth.signOut();
    return { error: "Usuario no autorizado." };
  }

  // Verificar que el usuario está activo
  const { data: activo, error: activoError } = await supabase.rpc("usuario_activo");
  
  if (activoError || !activo) {
    console.error("Usuario inactivo:", activoError);
    await supabase.auth.signOut();
    return { error: "Usuario bloqueado." };
  }

  // Obtener rol para redirección
  const { data: roleData, error: roleError } = await supabase.rpc("get_user_role");
  const role = typeof roleData === "string" ? roleData : roleData?.[0]?.get_user_role;

  // Redireccionar según el rol
  if (role?.toUpperCase() === "ADMIN") {
    redirect("/admin");
  } else if (role?.toUpperCase() === "CAPITAN") {
    redirect("/capitan");
  } else {
    redirect("/cliente");
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
