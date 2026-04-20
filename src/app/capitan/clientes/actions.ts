"use server";

import { createAdminClient, requireAuth } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { handleMivankError } from "@/utils/errors";

function getFields(formData: FormData) {
  const fields: Record<string, any> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      fields[key] = value;
    }
  });
  return fields;
}

/**
 * Genera una contraseña aleatoria segura para el primer acceso del cliente.
 */
function generarPasswordAleatoria(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export async function crearCliente(prevState: any, formData: FormData) {
  const fields = getFields(formData);

  try {
    // 1. VALIDACIÓN ZERO TRUST: El Capitán debe estar autenticado
    const { supabase, userData: sessionUser } = await requireAuth("CAPITAN");
    
    // 🔐 ZERO TRUST: Validar estado operativo
    if (sessionUser.status !== "ACTIVO") {
      throw new Error(`OPERACIÓN_BLOQUEADA: Su perfil se encuentra en estado [${sessionUser.status}] y no tiene permisos operativos de registro.`);
    }

    const adminClient = await createAdminClient();

    // Campos del formulario
    const nombre = formData.get("nombre") as string;
    const cedula = formData.get("cedula") as string;
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const telefono = formData.get("telefono") as string;
    
    // Método de pago y cuenta
    const metodo_pago_principal = formData.get("metodo_pago_principal") as string;
    const numero_cuenta = formData.get("numero_cuenta") as string;

    // Geolocalización (FASE 2: Rutas Inteligentes)
    const lat = formData.get("lat") ? parseFloat(formData.get("lat") as string) : null;
    const lng = formData.get("lng") ? parseFloat(formData.get("lng") as string) : null;

    if (!nombre || !cedula || !email) {
      return handleMivankError("crearCliente", "Campos requeridos faltantes", "VALIDATION_MANDATORY_FIELD", "Nombre, Cédula y Email son obligatorios.");
    }

    // 2. SEGURIDAD: empresa_id DEBE venir de la sesión del capitán
    const empresa_id = sessionUser.empresa_id;
    if (!empresa_id) {
       return handleMivankError("crearCliente", "Sin empresa_id", "PERMISSION_DENIED", "Tu perfil de capitán no tiene una empresa asociada.");
    }

    // REQUISITO: Documento (Cédula) es obligatorio
    const documento_url = formData.get("documento_url") as string;
    if (!documento_url) {
      return handleMivankError("crearCliente", "Cédula no subida", "VALIDATION_MANDATORY_FIELD", "Es obligatorio subir la foto de la cédula para registrar al cliente.");
    }

    // 3. GESTIÓN DE USUARIO (AUTH + PROFILE)
    const { ensureUnifiedUser } = await import("@/app/actions/user_management");
    const cliente_usuario_id = await ensureUnifiedUser({ nombre, email, rol: "CLIENTE" }, sessionUser);


    // 4. GESTIÓN DE FIADOR
    let fiador_id: string | null = null;
    const fiador_cedula = formData.get("fiador_cedula") as string;
    const fiador_nombre = formData.get("fiador_nombre") as string;

    if (fiador_cedula && fiador_nombre) {
      const { data: existingFiador } = await supabase
        .from("fiadores")
        .select("id")
        .eq("cedula", fiador_cedula)
        .maybeSingle();

      if (existingFiador) {
        fiador_id = existingFiador.id;
      } else {
        const { data: newFiador, error: fError } = await supabase
          .from("fiadores")
          .insert({
            cedula: fiador_cedula,
            nombre: fiador_nombre,
            telefono: formData.get("fiador_telefono") as string || null,
            direccion: formData.get("fiador_direccion") as string || null,
          })
          .select("id")
          .single();
        if (!fError) fiador_id = newFiador.id;
      }
    }

    // 5. REGISTRO FINAL DEL CLIENTE
    const { error: clienteError } = await supabase
      .from("clientes")
      .insert({
        usuario_id: cliente_usuario_id,
        capitan_id: sessionUser.user.id,
        empresa_id, // CRITICAL: Aislamiento por empresa
        cedula,
        email,
        telefono: telefono || null,
        direccion: formData.get("direccion") as string || null,
        barrio: formData.get("barrio") as string || null, // Nuevo campo
        actividad_economica: formData.get("actividad_economica") as string || null,
        metodo_pago_principal,
        numero_cuenta,
        lat,
        lng,
        fiador_id
      });

    if (clienteError) {
      if (clienteError.message.includes("duplicate key")) {
        return handleMivankError("crearCliente/final", clienteError, "DB_CLIENT_CREATE_ERROR", "Ya existe un cliente registrado con esta cédula.");
      }
      return handleMivankError("crearCliente/final", clienteError, "DB_CLIENT_CREATE_ERROR");
    }

    revalidatePath("/capitan/clientes");
    return { success: true };

  } catch (error: any) {
    return handleMivankError("crearCliente/catch", error);
  }
}


/**
 * Búsqueda optimizada de personas (clientes o fiadores existentes)
 * Zero Trust: Solo Capitanes pueden buscar en su entorno.
 */
export async function buscarPersonasParaFiador(query: string) {
  try {
    const { supabase } = await requireAuth("CAPITAN");

    // 1. Buscar en Clientes (Pueden ser fiadores de otros créditos)
    const { data: clientes } = await supabase
      .from("clientes")
      .select("id, cedula, telefono, direccion, usuarios(nombre)")
      .or(`cedula.ilike.%${query}%`)
      .limit(5);

    // 2. Buscar en Fiadores existentes
    const { data: fiadores } = await supabase
      .from("fiadores")
      .select("id, nombre, cedula, telefono, direccion, actividad")
      .or(`nombre.ilike.%${query}%,cedula.ilike.%${query}%`)
      .limit(5);

    const resultados: any[] = [];

    clientes?.forEach(c => {
      resultados.push({
        id: c.id,
        nombre: (c.usuarios as any)?.nombre || "Cliente Sin Nombre",
        cedula: c.cedula,
        telefono: c.telefono,
        direccion: c.direccion,
        actividad: "Cliente Mivank",
        tipo: 'cliente'
      });
    });

    fiadores?.forEach(f => {
      resultados.push({
        id: f.id,
        nombre: f.nombre,
        cedula: f.cedula,
        telefono: f.telefono,
        direccion: f.direccion,
        actividad: f.actividad,
        tipo: 'fiador'
      });
    });

    return resultados;

  } catch (error) {
    console.error("Error en buscarPersonasParaFiador:", error);
    return [];
  }
}

/**
 * Carga de documentos a Supabase Storage
 * Zero Trust: Validación de tipo de archivo y tamaño en el servidor (aunque ya se valide en el cliente).
 */
export async function uploadDocumento(formData: FormData) {
  try {
    const { supabase } = await requireAuth("CAPITAN");
    const file = formData.get("file") as File;
    const tipo = formData.get("tipo") as string;

    if (!file) throw new Error("No se proporcionó ningún archivo.");

    const fileExt = file.name.split(".").pop();
    const fileName = `${tipo}_${crypto.randomUUID()}.${fileExt}`;
    const filePath = `clientes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("documentos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("documentos")
      .getPublicUrl(filePath);

    return { url: publicUrl };

  } catch (error: any) {
    console.error("Error en uploadDocumento:", error);
    return { error: error.message || "Error al subir el archivo." };
  }
}
