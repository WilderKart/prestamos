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

  const userId = signInData.user.id;

  // Consultar usuario directamente de la tabla
  const { data: usuarioData, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id, rol, estado")
    .eq("id", userId)
    .maybeSingle();

  if (usuarioError) {
    console.error("Error consultando usuario:", usuarioError);
    await supabase.auth.signOut();
    return { error: "Error de base de datos." };
  }

  if (!usuarioData) {
    console.error("Usuario no encontrado en tabla usuarios");
    await supabase.auth.signOut();
    return { error: "Usuario no autorizado." };
  }

  if (usuarioData.estado !== "ACTIVO") {
    console.error("Usuario bloqueado:", usuarioData.estado);
    await supabase.auth.signOut();
    return { error: "Usuario bloqueado." };
  }

  const role = usuarioData.rol;

  // Redireccionar según el rol
  if (role === "ADMIN") {
    redirect("/admin");
  } else if (role === "CAPITAN") {
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
