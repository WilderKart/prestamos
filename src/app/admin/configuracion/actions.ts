"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateConfig(clave: string, valor: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("configuracion_sistema")
    .update({ valor })
    .eq("clave", clave);
    
  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath("/admin/configuracion");
}
