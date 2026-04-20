"use server";

import { createClient, requireAuth } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotificationInternal } from "./notifications";
import { logActivity } from "./audit";

/**
 * Server Action: Generar Rutas Diarias (V5.0 Ultra Elite)
 * Ejecuta el balanceo de carga y prioridad de mora con blindaje transaccional absoluto.
 */
export async function generateDailyRoutesAction() {
  try {
    const { supabase, userData: sessionUser } = await requireAuth("CAPITAN");
    const empresa_id = sessionUser.empresa_id;

    // 0. Validación de Contexto (Zero Trust Hardening)
    if (!empresa_id) {
      throw new Error("ERROR_SEGURIDAD: No se ha detectado el contexto de empresa. Sesión inválida.");
    }

    const hoy = new Date().toISOString().split('T')[0];

    // 1. Verificación de Fecha Hábil (Bloqueo Centralizado)
    const { data: isHabil } = await supabase.rpc("es_dia_habil", { p_fecha: hoy });
    if (!isHabil) {
      throw new Error("DÍA NO OPERATIVO: Hoy es domingo o festivo. Los motores financieros están inactivos.");
    }

    // 2. Obtener Cobradores Operativos (Isolation)
    const { data: cobradores } = await supabase
      .from("usuarios")
      .select("id, nombre")
      .eq("empresa_id", empresa_id)
      .eq("rol", "COBRADOR")
      .eq("estado", "ACTIVO");

    if (!cobradores || cobradores.length === 0) {
      throw new Error("NO_OPERATIONAL_COLLECTORS: No hay cobradores activos para desplegar rutas.");
    }

    // 3. Obtener Objetivos de Cobro (Relacional Agregado)
    const { data: clientesRaw } = await supabase
      .from("clientes")
      .select(`
        id, 
        lat, 
        lng, 
        barrio,
        usuarios!clientes_usuario_id_fkey(nombre),
        prestamos!inner(id, saldo_actual, frecuencia, fecha_proximo_pago, estado)
      `)
      .eq("empresa_id", empresa_id)
      .in("prestamos.estado", ["ACTIVO", "EN_MORA"])
      .lte("prestamos.fecha_proximo_pago", hoy)
      .limit(500);

    if (!clientesRaw || clientesRaw.length === 0) {
      throw new Error("NO_PENDING_COLLECTIONS: Su empresa no tiene cobros programados para la fecha actual.");
    }

    // 4. Deduplicación Agregativa Total (Protocolo No-Data-Loss)
    // Agrupa múltiples préstamos preservando datos geográficos y descriptivos
    const uniqueClientes = Object.values(
      clientesRaw.reduce((acc: any, c: any) => {
        if (!acc[c.id]) {
          acc[c.id] = { 
            id: c.id, 
            lat: c.lat, 
            lng: c.lng, 
            barrio: c.barrio, 
            usuarios: c.usuarios, 
            prestamos: [] 
          };
        }
        acc[c.id].prestamos.push(...(c.prestamos || []));
        return acc;
      }, {})
    );

    // 5. Motor de Prioridad Elite (Deuda Agregada)
    // Formula: (dias_mora * 3) + (monto_deuda_total * 0.01) + Bonus Mora
    const clientesOrdenados = uniqueClientes.sort((a: any, b: any) => {
      const scoring = (cl: any) => {
        const tieneMora = cl.prestamos.some((p: any) => p.estado === "EN_MORA");
        const montoTotalDeuda = cl.prestamos.reduce((sum: number, p: any) => sum + (p.saldo_actual || 0), 0);
        
        // Obtenemos la fecha de mora más antigua para el scoring de días
        const mDates = cl.prestamos.filter((p:any) => p.estado === "EN_MORA").map((p:any) => new Date(p.fecha_proximo_pago).getTime());
        const minDate = mDates.length > 0 ? Math.min(...mDates) : new Date().getTime();
        const diasMora = tieneMora ? Math.max(0, Math.floor((new Date().getTime() - minDate) / (1000 * 3600 * 24))) : 0;
        
        return (diasMora * 3) + (montoTotalDeuda * 0.01) + (tieneMora ? 1000 : 0);
      };
      return scoring(b) - scoring(a);
    });

    // 6. Balanceo Round Robin (Equidad Operativa)
    const planRutas = cobradores.map(cb => ({
      cobrador_id: cb.id,
      clientes: [] as { id: string; orden: number }[]
    }));

    clientesOrdenados.forEach((cliente: any, index: number) => {
      const cbIdx = index % cobradores.length;
      planRutas[cbIdx].clientes.push({
        id: cliente.id,
        orden: planRutas[cbIdx].clientes.length + 1
      });
    });

    // 7. Despliegue Atómico Ultra (Enterprise Lock + DB Check)
    const { data: rpcResult, error: rpcError } = await supabase.rpc('deploy_daily_routes_ultra', {
      p_empresa_id: empresa_id,
      p_fecha: hoy,
      p_plan: planRutas
    });

    if (rpcError) {
      if (rpcError.message.includes("ROUTES_ALREADY_EXIST")) {
        throw new Error("CONTROL_DUPLICIDAD: El motor ya ha generado rutas para esta empresa hoy.");
      }
      if (rpcError.message.includes("NON_WORKING_DAY")) {
        throw new Error("DÍA_NO_OPERATIVO: La base de datos ha bloqueado el despliegue por ser día no hábil.");
      }
      throw rpcError;
    }

    // 8. Registro de Historial Crediticio (Determinístico sin Duplicados)
    // Validamos existencia previa para no saturar el historial en re-intentos
    const hoyISO = new Date().toISOString().split('T')[0];
    
    for (const cliente of clientesOrdenados) {
       const tieneMora = cliente.prestamos.some((p: any) => p.estado === "EN_MORA");
       if (tieneMora) {
          const totalDeuda = cliente.prestamos.reduce((s:number, p:any) => s + (p.saldo_actual || 0), 0);
          
          // Inserción Blindada por Check de Existencia Diaria
          const { data: exists } = await supabase
            .from("historial_crediticio")
            .select("id")
            .eq("cliente_id", cliente.id)
            .eq("tipo_evento", "MORA")
            .gte("created_at", hoyISO)
            .limit(1);

          if (!exists || exists.length === 0) {
            await supabase.from("historial_crediticio").insert({
              cliente_id: cliente.id,
              empresa_id: empresa_id,
              tipo_evento: "MORA",
              descripcion: `Mora financiera detectada. Deuda Total Agregada: $${totalDeuda.toLocaleString()}`,
              valor: totalDeuda
            });
          }
       }
    }

    // 9. Auditoría Pro
    console.log("IA_ROUTE_ENGINE_GOD_MODE_ENTERPRISE", {
      empresa: empresa_id,
      cobradores: cobradores.length,
      objetivos_unicos: uniqueClientes.length,
      timestamp: new Date().toISOString()
    });


    await logActivity("RUTA_ASIGNADA", { 
      detalle: "Generación masiva de rutas (Cerebro Financiero Elite)",
      rutas: rpcResult.rutas_creadas 
    });

    revalidatePath("/capitan/rutas");
    
    return { 
      success: true, 
      message: `LOGÍSTICA DESPLEGADA: ${rpcResult.rutas_creadas} rutas y ${rpcResult.visitas_creadas} visitas sincronizadas atómicamente.` 
    };

  } catch (error: any) {
    console.error("LOGISTICS_ENGINE_ERROR:", error);
    return { success: false, error: error.message.toUpperCase() };
  }
}

/**
 * Acción: Finalizar Visita / Pago (Aislada por RPC Nativo)
 */
export async function recordPaymentAction(formData: {
  visitaId: string;
  pagoId?: string;
  accuracy: number;
  lat: number;
  lng: number;
  evidenciaUrl: string;
  monto: number;
  metodo: string;
}) {
  try {
    const { supabase, userData: session } = await requireAuth();

    // Zero Trust: Validar estado de cuenta
    if (session.status !== "ACTIVO") {
      throw new Error("Su cuenta no tiene permisos para registrar recaudos en este momento.");
    }

    // Regla de Oro: Precisión GPS (Zero Trust Geográfico)
    if (formData.accuracy > 70) {
      throw new Error("Precisión GPS insuficiente. Acérquese más al punto de cobro.");
    }

    // 2. Auditoría Inteligente: Validar Comprobante vs Configuración de Empresa (Zero Trust)
    const { data: config } = await supabase
      .from("configuracion_empresa")
      .select("monto_minimo_comprobante, requiere_comprobante")
      .eq("empresa_id", session.empresa_id)
      .single();

    const montoMinimo = config?.monto_minimo_comprobante || 50000;
    const requiereSiempre = config?.requiere_comprobante || false;

    if ((formData.monto >= montoMinimo || requiereSiempre) && !formData.evidenciaUrl) {
      throw new Error(`Este recaudo requiere comprobante fotográfico (Mínimo: ${montoMinimo}).`);
    }

    // 3. Ejecutar lógica de pago atómica via RPC
    const { data: result, error } = await supabase.rpc('process_visit_payment', {
      p_visita_id: formData.visitaId,
      p_monto: formData.monto,
      p_metodo: formData.metodo,
      p_lat: formData.lat,
      p_lng: formData.lng,
      p_evidencia: formData.evidenciaUrl,
      p_cobrador_id: session.id
    });

    if (error) throw error;
    if (!result.success) throw new Error(result.error);

    revalidatePath("/cobrador/mision");

    // 4. Auditoría
    await logActivity("PAGO_REGISTRADO", {
      visitaId: formData.visitaId,
      monto: formData.monto,
      metodo: formData.metodo
    });

    return { success: true };

  } catch (error: any) {
    console.error("PAYMENT_RECORD_ERROR:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Acción: Reordenar Visitas (Manual)
 */
export async function updateVisitasOrderAction(visitas: { id: string; orden: number }[]) {
  try {
    const { supabase } = await requireAuth("CAPITAN");

    // Realizar en bloque para minimizar latencia
    const { error } = await supabase
      .from("visitas")
      .upsert(visitas.map(v => ({ id: v.id, orden: v.orden })), { onConflict: 'id' });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("ORDER_UPDATE_ERROR:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Acción: Asignar Ruta a Cobrador (Zero Trust + Notificación)
 */
export async function assignRouteToCollectorAction(routeId: string, cobradorId: string) {
  try {
    const user = await requireAuth("CAPITAN");
    const supabase = await createClient();

    // 🔐 VALIDACIÓN CRUZADA: Validar que la ruta pertenece a la empresa del capitán
    const { data: route } = await supabase
      .from("rutas")
      .select("empresa_id")
      .eq("id", routeId)
      .single();

    if (!route || route.empresa_id !== user.empresa_id) {
      throw new Error("VIOLACIÓN_JURISDICCIÓN: La ruta no pertenece a su empresa.");
    }

    // 🔐 VALIDACIÓN CRUZADA: Validar que el cobrador pertenece a la misma empresa
    const { data: cobrador } = await supabase
      .from("usuarios")
      .select("id, empresa_id, nombre")
      .eq("id", cobradorId)
      .eq("rol", "COBRADOR")
      .single();

    if (!cobrador || cobrador.empresa_id !== user.empresa_id) {
      throw new Error("VIOLACIÓN_OPERATIVA: El cobrador no pertenece a su jurisdicción.");
    }

    // Ejecutar asignación
    const { error: updateError } = await supabase
      .from("rutas")
      .update({ cobrador_id: cobradorId })
      .eq("id", routeId);

    if (updateError) throw updateError;

    // Disparar Notificación Táctica (Async)
    await createNotificationInternal(supabase, {
      empresa_id: user.empresa_id!,
      user_id: cobradorId,
      tipo: "RUTA_ASIGNADA",
      titulo: "Nueva Ruta Asignada",
      descripcion: `Capitán, se le ha asignado una nueva secuencia de cobro operativa.`
    });

    revalidatePath("/capitan/rutas");

    // 4. Auditoría
    await logActivity("RUTA_ASIGNADA", {
      routeId,
      cobrador: cobrador.nombre
    });

    return { success: true };
  } catch (error: any) {
    console.error("ASSIGN_ROUTE_ERROR:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Registrar Punto de Tracking (Live + Breadcrumbs)
 */
export async function saveTrackingPointAction(data: {
  lat: number;
  lng: number;
  empresaId: string;
}) {
  try {
    const { supabase, userData: session } = await requireAuth("COBRADOR");

    const { error } = await supabase
      .from("cobrador_tracking")
      .insert({
        cobrador_id: session.id,
        empresa_id: data.empresaId,
        lat: data.lat,
        lng: data.lng
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("TRACKING_SAVE_ERROR:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Registrar Pago Manual (Capitán)
 */
export async function registerManualPaymentAction(data: {
  clienteId: string;
  monto: number;
  metodo: string;
}) {
  try {
    const { supabase, userData: session } = await requireAuth("CAPITAN");

    // Ejecutar lógica de pago manual vía RPC
    // Nota: Usamos una variante del proceso de visita pero sin ID de visita (p_visita_id = null)
    const { data: result, error } = await supabase.rpc('process_manual_payment', {
      p_cliente_id: data.clienteId,
      p_monto: data.monto,
      p_metodo: data.metodo,
      p_capitan_id: session.id,
      p_empresa_id: session.empresa_id
    });

    if (error) throw error;
    if (!result.success) throw new Error(result.error);

    revalidatePath("/capitan/clientes");
    revalidatePath("/capitan/cartera");
    
    return { success: true };
  } catch (error: any) {
    console.error("MANUAL_PAYMENT_ERROR:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Control de Misión (Beacon Control)
 */
export async function toggleMissionStatusAction(newStatus: 'EN_MISION' | 'INACTIVO') {
  try {
    const { supabase, userData: session } = await requireAuth("COBRADOR");

    const { error } = await supabase
      .from("usuarios")
      .update({ estado_mision: newStatus })
      .eq("id", session.id);

    if (error) throw error;

    revalidatePath("/cobrador/mision");
    return { success: true };
  } catch (error: any) {
    console.error("MISSION_TOGGLE_ERROR:", error);
    return { success: false, error: error.message };
  }
}
