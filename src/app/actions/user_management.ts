"use server";

import { createAdminClient, requireAuth } from "@/utils/supabase/server";
import { handleMivankError } from "@/utils/errors";

/**
 * Genera una contraseña aleatoria segura.
 */
function generarPasswordAleatoria(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

/**
 * Tipado Discriminado de Grado Industrial
 */
export type FormInputs = {
  nombre?: string;
  cedula?: string;
  email?: string;
  telefono?: string;
};

export type MivankResponse =
  | { success: true; error?: never; inputs?: never }
  | { success: false; error: string; inputs?: FormInputs };

/**
 * Helper: Normalización de Errores de Base de Datos
 */
function normalizeError(error: any) {
  return {
    message: error?.message || "Error inesperado en el servidor",
    code: error?.code,
    hint: error?.hint,
    details: error?.details
  };
}

/**
 * Proceso Unificado Zero Trust para asegurar un usuario en Auth y Perfil.
 */
export async function ensureUnifiedUser(
  formData: { nombre: string; email: string; rol: "CLIENTE" | "COBRADOR"; cedula?: string; telefono?: string },
  sessionUser: any
) {
  const adminClient = await createAdminClient();
  const email = formData.email.toLowerCase().trim();
  const nombre = formData.nombre;
  const empresa_id = sessionUser.empresa_id;

  if (!empresa_id) {
    throw new Error("CONTEXTO_INVALIDO: El usuario no tiene una empresa asignada.");
  }

  let userId: string;

  // 1. Intentar crear en Auth
  const tempPassword = generarPasswordAleatoria();
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { nombre, empresa_id }
  });

  if (authError) {
    if (authError.message.includes("already registered") || (authError as any).code === 'email_exists') {
      const { data: recoveredId, error: rpcError } = await adminClient.rpc('get_user_id_by_email', { p_email: email });
      
      if (rpcError || !recoveredId) {
        throw new Error(`AUTH_RECOVERY_FAILED: ${rpcError?.message || "No se pudo recuperar ID de Auth"}`);
      }
      userId = recoveredId;
    } else {
      throw authError;
    }
  } else {
    userId = authUser.user.id;
  }

  // 2. Sincronizar Perfil (Upsert)
  const { error: profileError } = await adminClient
    .from("usuarios")
    .upsert({
      id: userId,
      nombre,
      email,
      rol: formData.rol,
      cedula: formData.cedula,
      telefono: formData.telefono,
      estado: "ACTIVO",
      creado_por: sessionUser.id,
      empresa_id: empresa_id,
      debe_cambiar_password: true 
    });

  if (profileError) {
    throw profileError;
  }

  return userId;
}

/**
 * Acción unificada para el Capitán: Crear Cobrador.
 */
export async function crearCobradorAction(
  prevState: MivankResponse | null, 
  formData: FormData
): Promise<MivankResponse> {
  const nombre = formData.get("nombre") as string;
  const cedula = formData.get("cedula") as string;
  const email = formData.get("email") as string;
  const telefono = formData.get("telefono") as string;

  try {
    const { userData: sessionUser } = await requireAuth("CAPITAN");
    
    // 🔐 VALIDACIÓN FAIL-FAST: CONTEXTO SOBERANO
    if (!sessionUser.id || !sessionUser.empresa_id) {
      console.error("🔥 ERROR DE SEGURIDAD: Intento de creación con contexto de sesión incompleto.");
      return { success: false, error: "SESIÓN INVÁLIDA: CONTEXTO DE EMPRESA NO DEFINIDO." };
    }

    if (sessionUser.status !== "ACTIVO") {
      return { success: false, error: `OPERACIÓN BLOQUEADA: PERFIL EN ESTADO [${sessionUser.status}].` };
    }

    if (!nombre || !email || !cedula) {
      return { success: false, error: "NOMBRE, EMAIL Y CÉDULA SON OBLIGATORIOS." };
    }

    // 1. Asegurar Usuario (Auth + Perfil) con contexto explícito
    await ensureUnifiedUser(
      { nombre, email, rol: "COBRADOR", cedula, telefono }, 
      sessionUser // sessionUser ya contiene id y empresa_id validados
    );

    return { success: true };

  } catch (error: any) {
    const err = normalizeError(error);

    // 🛠️ LOG TÉCNICO ÉLITE
    if (process.env.NODE_ENV !== "production") {
      console.error("\n🔥 [MIVANK DEBUG] ERROR REAL DETECTADO:");
      console.error("Mensaje:", err.message);
      console.error("Código:", err.code);
      console.error("-----------------------------------\n");
    }

    // 🎯 MAPEO DE ERRORES UX
    let userMessage = err.message;
    if (err.code === "23505") userMessage = "Este correo o documento ya está registrado.";
    if (err.message.includes("already registered")) userMessage = "Este correo electrónico ya está registrado.";

    return {
      success: false,
      error: userMessage.toUpperCase(),
      inputs: { nombre, cedula, email, telefono }
    };
  }
}

/**
 * Generar Código de Invitación (Siguiente Nivel)
 */
export async function crearCodigoInvitacionAction() {
  try {
    const { userData } = await requireAuth("CAPITAN");
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("create_invitation_code", {});

    if (error) throw error;

    return { success: true, codigo: data[0].codigo };
  } catch (error: any) {
    console.error("🔥 ERROR GENERAR CÓDIGO:", error);
    return { success: false, error: error.message || "Error al generar código" };
  }
}

/**
 * Registro de Cliente Externo vía Código (Soberano)
 */
export async function registerClienteAction(formData: FormData): Promise<MivankResponse> {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const codigo = formData.get("codigo") as string;

  try {
    // 🔐 VALIDACIÓN FAIL-FAST
    if (!codigo || codigo.length < 6) {
      return { success: false, error: "CÓDIGO DE INVITACIÓN INVÁLIDO O MUY CORTO." };
    }

    if (!nombre || !email) {
      return { success: false, error: "NOMBRE Y EMAIL SON OBLIGATORIOS." };
    }

    const supabase = await createClient();

    // 1. Obtener Empresa vía RPC Atómico (Anti-Race Condition)
    const { data: empresa_id, error: rpcError } = await supabase.rpc("get_empresa_by_codigo", { 
      p_codigo_input: codigo 
    });

    if (rpcError || !empresa_id) {
      return { success: false, error: rpcError?.message || "CÓDIGO INVÁLIDO O EXPIRADO." };
    }

    // 2. Crear Usuario (Usamos el ID de empresa obtenido de forma segura)
    await ensureUnifiedUser(
      { nombre, email, rol: "CLIENTE" },
      { empresa_id, id: null } // El creador es NULL para registros externos
    );

    return { success: true };

  } catch (error: any) {
    console.error("🔥 REGISTER CLIENT ERROR:", {
      code: error?.code,
      message: error?.message,
      hint: error?.hint
    });
    return { success: false, error: "ERROR EN EL REGISTRO. POR FAVOR INTENTE MÁS TARDE." };
  }
}

/**
 * Crear Cliente desde el Panel de Capitán
 */
export async function crearClienteDesdeCapitanAction(formData: FormData): Promise<MivankResponse> {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const cedula = formData.get("cedula") as string;
  const telefono = formData.get("telefono") as string;

  try {
    const { userData: sessionUser } = await requireAuth("CAPITAN");

    if (!nombre || !email || !cedula) {
      return { success: false, error: "NOMBRE, EMAIL Y CÉDULA SON OBLIGATORIOS." };
    }

    await ensureUnifiedUser(
      { nombre, email, rol: "CLIENTE", cedula, telefono },
      sessionUser
    );

    return { success: true };

  } catch (error: any) {
    console.error("🔥 ERROR CREAR CLIENTE CAPITÁN:", error);
    return { success: false, error: error.message || "ERROR INESPERADO" };
  }
}
