"use server";

import { createClient } from "@/utils/supabase/server";
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
  let existe = false;
  let existeError = null;
  try {
    const result = await supabase.rpc("usuario_existe");
    existe = result.data;
    existeError = result.error;
  } catch (e) {
    console.error("Error calling usuario_existe:", e);
    existeError = e;
  }
  
  if (existeError || !existe) {
    console.error("Usuario no existe en tabla usuarios:", existeError);
    await supabase.auth.signOut();
    return { error: "Usuario no autorizado." };
  }

  // Verificar que el usuario está activo
  let activo = false;
  let activoError = null;
  try {
    const result = await supabase.rpc("usuario_activo");
    activo = result.data;
    activoError = result.error;
  } catch (e) {
    console.error("Error calling usuario_activo:", e);
    activoError = e;
  }
  
  if (activoError || !activo) {
    console.error("Usuario inactivo:", activoError);
    await supabase.auth.signOut();
    return { error: "Usuario bloqueado." };
  }

  // Obtener rol para redirección
  let role = null;
  try {
    const result = await supabase.rpc("get_user_role");
    if (!result.error && result.data) {
      role = typeof result.data === "string" ? result.data : result.data?.[0]?.get_user_role;
    }
  } catch (e) {
    console.error("Error calling get_user_role:", e);
  }

  // Si no se pudo obtener el rol, permitir acceso al cliente por defecto
  // (en caso de que sea un nuevo usuario sin rol asignado aún)
  if (!role) {
    role = "CLIENTE";
  }

  // Redireccionar según el rol
  if (role.toUpperCase() === "ADMIN") {
    redirect("/admin");
  } else if (role.toUpperCase() === "CAPITAN") {
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
