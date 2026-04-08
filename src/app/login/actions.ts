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

  // Forzar refresh para asegurar que la sesión está disponible
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error("No se pudo obtener sesión después del login");
    await supabase.auth.signOut();
    return { error: "Error al iniciar sesión." };
  }

  // Consultar usuario directamente de la tabla usando el cliente actual
  // El problema es RLS - por eso usamos la sesión verificada
  const { data: usuarioData, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id, rol, estado")
    .eq("id", userId)
    .single();

  if (usuarioError) {
    console.error("Error consultando usuario:", usuarioError);
    console.error("UserID:", userId);
    await supabase.auth.signOut();
    return { error: "Error de base de datos." };
  }

  if (!usuarioData) {
    console.error("Usuario no encontrado en tabla usuarios, userId:", userId);
    await supabase.auth.signOut();
    return { error: "Usuario no autorizado." };
  }

  if (usuarioData.estado !== "ACTIVO") {
    console.error("Usuario bloqueado:", usuarioData.estado);
    await supabase.auth.signOut();
    return { error: "Usuario bloqueado." };
  }

  const role = usuarioData.rol;

  console.log("Login exitoso:", { userId, role, estado: usuarioData.estado });

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
