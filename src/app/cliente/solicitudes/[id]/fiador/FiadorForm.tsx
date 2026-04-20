"use client";

import { useState } from "react";
import { usePersistentForm } from "@/hooks/usePersistentForm";
import { clienteAgregarFiador } from "./actions";
import { 
  UserPlus, 
  CircleNotch, 
  CheckCircle,
  IdentificationCard,
  User,
  Phone,
  CurrencyDollar,
  MapPin,
  Briefcase,
  WarningCircle,
  CaretRight
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function FiadorForm({ solicitudId }: { solicitudId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: formData, setFieldValue, clearDraft } = usePersistentForm(`agregar-fiador-${solicitudId}`, {
    cedula: "",
    nombre: "",
    telefono: "",
    direccion: "",
    actividad_economica: "",
    ingresos_mensuales: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(e.target.name as any, e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const ingresos = parseFloat(formData.ingresos_mensuales);
    if (isNaN(ingresos) || ingresos <= 0) {
      setError("Indique ingresos mensuales válidos (Matriz de Riesgo)");
      setLoading(false);
      return;
    }

    const result = await clienteAgregarFiador(solicitudId, {
      cedula: formData.cedula,
      nombre: formData.nombre,
      telefono: formData.telefono,
      direccion: formData.direccion,
      actividad_economica: formData.actividad_economica,
      ingresos_mensuales: ingresos,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      clearDraft();
      setTimeout(() => {
        router.push("/cliente/solicitudes");
      }, 2500);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
        <div className="ios-glass p-16 rounded-[60px] text-center space-y-8 shadow-2xl shadow-ios-green/10 max-w-lg">
          <div className="w-32 h-32 bg-ios-green text-white rounded-[44px] flex items-center justify-center mx-auto shadow-2xl shadow-ios-green/30 transform -rotate-3 border-4 border-white">
            <CheckCircle weight="fill" size={64} />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-[1000] text-black tracking-tighter uppercase">
              Fiador Vinculado
            </h3>
            <p className="text-[15px] font-bold text-black/40 leading-relaxed uppercase tracking-tight">
              Protocolo de respaldo activado exitosamente. Sincronizando con el Capitán...
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 py-4">
             <CircleNotch className="animate-spin text-ios-green" size={24} weight="bold" />
             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-black/20">Actualizando Nodo</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-up pb-32">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-black text-white rounded-[24px] flex items-center justify-center shadow-2xl transform shadow-black/20">
            <UserPlus weight="fill" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
              Respaldo de <span className="text-ios-blue">Capital</span>
            </h1>
            <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em] mt-1">
              Vinculación de Garantía Humana
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ios-glass p-6 border-none bg-ios-pink/[0.03] text-ios-pink rounded-[32px] flex items-center gap-4 shadow-xl shadow-ios-pink/5"
              >
                <div className="w-10 h-10 bg-ios-pink text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-ios-pink/20">
                   <WarningCircle weight="fill" size={20} />
                </div>
                <p className="text-[13px] font-[1000] uppercase tracking-tight">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ios-glass border-none p-12 rounded-[52px] shadow-2xl shadow-black/5 space-y-10">
            <div className="flex items-center gap-3 border-b border-black/[0.03] pb-6">
                <User weight="fill" size={20} className="text-black/20" />
                <h2 className="text-[13px] font-[1000] text-black uppercase tracking-[0.2em]">Identidad Civil</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] ml-2">Doc. Identificación</label>
                <div className="relative">
                  <IdentificationCard weight="fill" size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10" />
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    className="w-full bg-black/[0.03] rounded-3xl py-6 pl-14 pr-6 text-lg font-[1000] text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all shadow-inner"
                    placeholder="Número de cédula"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] ml-2">Nombre Completo</label>
                <div className="relative">
                  <User weight="fill" size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10" />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full bg-black/[0.03] rounded-3xl py-6 pl-14 pr-6 text-lg font-[1000] text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all shadow-inner"
                    placeholder="Nombre del fiador"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] ml-2">Teléfono Sincronía</label>
                <div className="relative">
                  <Phone weight="fill" size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10" />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full bg-black/[0.03] rounded-3xl py-6 pl-14 pr-6 text-lg font-[1000] text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all shadow-inner"
                    placeholder="+57"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] ml-2">Retorno Mensual Est.</label>
                <div className="relative">
                  <CurrencyDollar weight="fill" size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10" />
                  <input
                    type="number"
                    name="ingresos_mensuales"
                    value={formData.ingresos_mensuales}
                    onChange={handleChange}
                    className="w-full bg-black/[0.03] rounded-3xl py-6 pl-14 pr-6 text-lg font-[1000] text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all shadow-inner"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-10 pt-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] ml-2">Geolocalización Residencial</label>
                <div className="relative">
                  <MapPin weight="fill" size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10" />
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full bg-black/[0.03] rounded-3xl py-6 pl-14 pr-6 text-lg font-[1000] text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all shadow-inner"
                    placeholder="Dirección completa"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] ml-2">Ocupación / Nodo Económico</label>
                <div className="relative">
                  <Briefcase weight="fill" size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10" />
                  <input
                    type="text"
                    name="actividad_economica"
                    value={formData.actividad_economica}
                    onChange={handleChange}
                    className="w-full bg-black/[0.03] rounded-3xl py-6 pl-14 pr-6 text-lg font-[1000] text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all shadow-inner"
                    placeholder="Ej: Independiente, Consultor..."
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="ios-glass border-none p-10 rounded-[44px] shadow-2xl shadow-black/5 space-y-8 sticky top-32">
              <div className="space-y-4">
                 <h3 className="text-[17px] font-[1000] text-black tracking-tight uppercase leading-none">Matriz de Respaldo</h3>
                 <p className="text-[13px] font-bold text-black/40 leading-relaxed italic uppercase tracking-tight">
                   "La incorporación de un fiador fortalece su historial de crédito y facilita la aprobación de capitales mayores."
                 </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-black/[0.03]">
                 <div className="flex items-center gap-3 text-ios-blue">
                    <CheckCircle weight="fill" size={18} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Validación en Tiempo Real</span>
                 </div>
                 <div className="flex items-center gap-3 text-ios-blue">
                    <CheckCircle weight="fill" size={18} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Cifrado de Alta Fidelidad</span>
                 </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-24 bg-ios-blue text-white rounded-[32px] font-black text-[13px] tracking-[0.3em] uppercase shadow-2xl shadow-ios-blue/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
              >
                {loading ? (
                   <CircleNotch className="animate-spin" size={32} weight="bold" />
                ) : (
                  <>
                    Confirmar Fiador
                    <CaretRight weight="bold" size={20} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
           </div>
        </div>
      </form>
    </div>
  );
}
