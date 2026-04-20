import { createClient, requireRole } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  Money, 
  CreditCard, 
  ShieldCheck, 
  WarningCircle, 
  CheckCircle,
  ArrowRight,
  ChartLineUp,
  ClockCounterClockwise,
  User,
  CaretRight,
  HandPointing,
  Fingerprint
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";

export default async function CobradorCierrePage() {
  const { userData: sessionUser, supabase } = await requireRole(["COBRADOR", "ADMIN"]);

  const { data: ruta } = await supabase
    .from("rutas")
    .select(`
      *,
      visitas (*),
      pagos:pagos(id, valor, metodo)
    `)
    .eq("cobrador_id", sessionUser.id)
    .eq("fecha", new Date().toISOString().split('T')[0])
    .eq("estado", "pendiente")
    .maybeSingle();

  if (!ruta) {
    return (
      <div className="ios-page flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 px-8">
        <div className="w-24 h-24 bg-black/5 rounded-[44px] flex items-center justify-center text-black/10 shadow-inner border border-white">
           <WarningCircle weight="fill" size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-[1000] text-black tracking-tighter">Cierre No Hábil</h2>
          <p className="text-[15px] font-semibold text-black/30 leading-relaxed">No existe un protocolo de ruta activa asignado para su identidad en el ciclo actual.</p>
        </div>
        <Link href="/cobrador/mision" className="px-10 py-5 bg-black text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">
          Retornar a Operaciones
        </Link>
      </div>
    );
  }

  const visitasPendientes = ruta.visitas?.filter((v: any) => v.estado === 'pendiente').length || 0;
  const totalEfectivo = ruta.pagos?.filter((p: any) => p.metodo === 'EFECTIVO').reduce((acc: number, p: any) => acc + p.valor, 0) || 0;
  const totalTransferencia = ruta.pagos?.filter((p: any) => p.metodo === 'TRANSFERENCIA').reduce((acc: number, p: any) => acc + p.valor, 0) || 0;
  const totalCobrado = totalEfectivo + totalTransferencia;

  return (
    <div className="ios-page space-y-10 selection:bg-ios-blue selection:text-white pb-32 pt-4">
      {/* Header Section */}
      <section className="animate-fade-up px-4 text-center">
        <div className="w-16 h-16 bg-ios-yellow text-black rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-ios-yellow/30 border-2 border-white mb-6 transform -rotate-2">
           <ShieldCheck weight="fill" size={32} />
        </div>
        <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none mb-2">
          Balance de <span className="text-ios-blue">Caja</span>
        </h1>
        <p className="text-[12px] font-black text-black/20 uppercase tracking-[0.4em]">Checkpoint Operativo</p>
      </section>

      {/* Hero Financial Card */}
      <section className="px-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="ios-card-gradient-blue p-10 rounded-[44px] relative overflow-hidden shadow-2xl shadow-ios-blue/30 border-4 border-white/20">
          <div className="absolute top-[-30%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
          <div className="relative z-10 text-center space-y-8">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Liquidación de Recaudos</p>
              <h2 className="text-6xl font-[1000] tracking-tighter leading-none">
                {formatCurrency(totalCobrado)}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
              <div className="text-left space-y-1 p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                  <Money weight="fill" size={16} className="text-ios-green" />
                  Efectivo Real
                </div>
                <p className="text-2xl font-[1000]">{formatCurrency(totalEfectivo)}</p>
              </div>
              <div className="text-right space-y-1 p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 justify-end text-[10px] font-black uppercase tracking-widest opacity-40">
                  Digital Matrix
                  <CreditCard weight="fill" size={16} className="text-ios-yellow" />
                </div>
                <p className="text-2xl font-[1000]">{formatCurrency(totalTransferencia)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Compliance */}
      <section className="px-4 space-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em] px-4">Cumplimiento Operativo</h3>
        <div className={`ios-glass border-none p-6 rounded-[36px] flex items-center justify-between shadow-2xl shadow-black/5 ${
          visitasPendientes > 0 ? 'bg-ios-pink/[0.02]' : 'bg-ios-green/[0.02]'
        }`}>
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center border-2 border-white shadow-xl ${
              visitasPendientes > 0 ? 'bg-ios-pink text-white' : 'bg-ios-green text-white'
            }`}>
              {visitasPendientes > 0 ? <WarningCircle weight="fill" size={32} /> : <CheckCircle weight="fill" size={32} />}
            </div>
            <div>
              <p className="text-[17px] font-[900] text-black tracking-tight leading-loose">
                {visitasPendientes > 0 ? `Incompleto: ${visitasPendientes} Pendientes` : 'Protocolo Completado'}
              </p>
              <p className="text-[13px] font-bold text-black/30">
                {visitasPendientes > 0 ? 'Acción requerida en terreno.' : 'Integridad de ruta verificada.'}
              </p>
            </div>
          </div>
          {visitasPendientes > 0 && <CaretRight weight="bold" className="text-black/10" size={20} />}
        </div>
      </section>

      {/* Confirmation Zone */}
      <section className="px-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        {visitasPendientes === 0 ? (
          <button 
            className="w-full h-20 bg-black text-white rounded-[32px] font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-black/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
          >
            <Fingerprint weight="fill" size={32} className="text-ios-blue" />
            Certificar y Cerrar
            <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <Link 
            href="/cobrador/mision"
            className="w-full h-20 bg-black/[0.03] text-black/20 rounded-[32px] font-black text-[13px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all border border-black/5"
          >
            Regresar a Operaciones
            <HandPointing weight="fill" size={24} />
          </Link>
        )}
      </section>

      {/* Audit Footnote */}
      <section className="px-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex gap-4 items-center opacity-40">
           <ChartLineUp weight="fill" size={24} className="shrink-0 text-black" />
           <p className="text-[11px] font-bold text-black italic leading-relaxed">
             Este balance será inmutable tras la certificación. La auditoría Zero Trust notificará inmediatamente al Capitán de red.
           </p>
        </div>
      </section>
    </div>
  );
}
