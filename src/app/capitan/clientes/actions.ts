"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearCliente(prevState: any, formData: FormData) {
  // Datos personales
  const nombre = formData.get("nombre") as string;
  const cedula = formData.get("cedula") as string;
  const email = formData.get("email") as string;
  const telefono = formData.get("telefono") as string;
  const telefono_fijo = formData.get("telefono_fijo") as string;

  // Contacto
  const direccion = formData.get("direccion") as string;

  // Laboral
  const actividad_economica = formData.get("actividad_economica") as string;
  const lugar_trabajo = formData.get("lugar_trabajo") as string;
  const direccion_trabajo = formData.get("direccion_trabajo") as string;

  // Financiero
  const metodo_pago_principal = formData.get("metodo_pago_principal") as string;
  const numero_cuenta = formData.get("numero_cuenta") as string;

  // Fiador
  const fiador_cedula = formData.get("fiador_cedula") as string;
  const fiador_nombre = formData.get("fiador_nombre") as string;
  const fiador_telefono = formData.get("fiador_telefono") as string;
  const fiador_direccion = formData.get("fiador_direccion") as string;
  const fiador_actividad = formData.get("fiador_actividad") as string;
  
  // Documento
  const documento_url = formData.get("documento_url") as string;

  // Validaciones
  if (!nombre || !cedula) {
    return { error: "Nombre y Cédula son obligatorios." };
  }
  if (!metodo_pago_principal || !numero_cuenta) {
    return { error: "El método de pago y número de cuenta son obligatorios." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  // 1. GESTIÓN DE USUARIO (CLIENTE)
  // Como la tabla 'clientes' no tiene 'nombre', creamos el perfil en 'usuarios'
  // Si ya existe un usuario con ese email/cedula lo vinculamos, sino creamos uno nuevo 'prospecto'
  let cliente_usuario_id: string | null = null;
  
  // Buscar si ya existe el usuario por cedula o email (si email existe)
  const { data: existingUser } = await supabase
    .from("usuarios")
    .select("id")
    .or(`email.eq.${email || 'no-email'},id.in.(select usuario_id from clientes where cedula.eq.${cedula})`)
    .maybeSingle();

  if (existingUser) {
    cliente_usuario_id = existingUser.id;
  } else {
    // Si no existe, creamos un registro en la tabla usuarios (rol CLIENTE)
    // Nota: Esto es un registro de perfil, no una cuenta de Auth todavia
    const { data: newUser, error: userError } = await supabase
      .from("usuarios")
      .insert({
        nombre,
        email: email || null,
        rol: "CLIENTE",
        estado: "ACTIVO",
        creado_por: user.id
      })
      .select("id")
      .single();
    
    if (userError) {
      return { error: `Error creando perfil de usuario: ${userError.message}` };
    }
    cliente_usuario_id = newUser.id;
  }

  // 2. GESTIÓN DE FIADOR
  let fiador_id: string | null = null;
  if (fiador_cedula && fiador_nombre) {
    const { data: existingFiador } = await supabase
      .from("fiadores")
      .select("id")
      .eq("cedula", fiador_cedula)
      .maybeSingle();

    if (existingFiador) {
      fiador_id = existingFiador.id;
    } else {
      const { data: newFiador, error: fiadorError } = await supabase
        .from("fiadores")
        .insert({
          cedula: fiador_cedula,
          nombre: fiador_nombre,
          telefono: fiador_telefono || null,
          direccion: fiador_direccion || null,
          actividad_economica: fiador_actividad || null,
        })
        .select("id")
        .single();

      if (fiadorError) {
        return { error: `Error al registrar fiador: ${fiadorError.message}` };
      }
      fiador_id = newFiador.id;
    }
  }

  // 3. INSERTAR CLIENTE
  const { error: clienteError } = await supabase
    .from("clientes")
    .insert({
      usuario_id: cliente_usuario_id,
      capitan_id: user.id,
      cedula,
      email: email || null,
      telefono: telefono || null,
      telefono_fijo: telefono_fijo || null,
      direccion: direccion || null,
      actividad_economica: actividad_economica || null,
      lugar_trabajo: lugar_trabajo || null,
      direccion_trabajo: direccion_trabajo || null,
      metodo_pago_principal: metodo_pago_principal || null,
      numero_cuenta: numero_cuenta || null,
      fiador_id,
      documento_url: documento_url || null
    });

  if (clienteError) {
    console.error("Error creando cliente:", clienteError);
    if (clienteError.message.includes("duplicate key")) {
      return { error: "Ya existe un cliente con esta cédula." };
    }
    return { error: `Error al crear cliente: ${clienteError.message}` };
  }

  revalidatePath("/capitan/clientes");
  return { success: true };
}

export async function buscarFiador(cedula: string) {
  if (!cedula || cedula.length < 5) return { fiador: null };

  const supabase = await createClient();
  const { data: fiador } = await supabase
    .from("fiadores")
    .select("id, nombre, cedula, telefono, direccion, actividad_economica")
    .eq("cedula", cedula)
    .single();

  return { fiador };
}

export async function uploadDocumento(formData: FormData) {
  const file = formData.get("file") as File;
  const clienteId = formData.get("clienteId") as string;
  const tipo = formData.get("tipo") as string; // 'cedula_cliente' | 'cedula_fiador'

  if (!file) return { error: "No se seleccionó ningún archivo" };
  if (file.size > 5 * 1024 * 1024) return { error: "El archivo excede el límite de 5MB" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const ext = file.name.split(".").pop();
  const path = `clientes/${user.id}/${tipo}_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("comprobantes")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: `Error al subir archivo: ${uploadError.message}` };
  }

  const { data: urlData } = supabase.storage.from("comprobantes").getPublicUrl(path);

  // Si tenemos clienteId, actualizar la URL en la tabla
  if (clienteId) {
    await supabase
      .from("clientes")
      .update({ documento_url: urlData.publicUrl })
      .eq("id", clienteId);
  }

  return { url: urlData.publicUrl };
}
