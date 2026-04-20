import { getCobradorById } from "../actions";
import { notFound } from "next/navigation";
import { 
  Phone, 
  EnvelopeSimple, 
  IdentificationCard,
  CaretLeft,
  TrendUp,
  Vault,
  ShieldCheck,
  AddressBook,
  Calendar
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import CobradorCardActions from "../CobradorCardActions";

interface CobradorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CobradorDetailPage({ params }: CobradorDetailPageProps) {
  const { id } = await params;
  const cobrador = await getCobradorById(id);

  if (!cobrador) {
    notFound();
  }

  const initials = cobrador.nombre.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const metricas = (cobrador as any).metricas || { clientes: 0, capital: 0, mora: 0, efectividad: 0 };

  return (
    <div className="ios-page space-y-8 pb-32">
      {/* ── Header / Navigation ── */}
      <div className="flex items-center justify-between px-2">
        <Link 
          href="/capitan/cobradores" 
          className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors"
        >
          <CaretLeft weight="bold" size={20} />
        </Link>
        <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">Perfil Operativo</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* ── Profile Hero ── */}
      <section className="animate-fade-up">
        <div className="ios-glass p-8 rounded-[44px] border-none flex flex-col items-center text-center gap-6 relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-ios-blue/10 rounded-full blur-3xl opacity-50" />
          
          <div className="h-24 w-24 bg-black text-white rounded-[28px] flex items-center justify-center shadow-2xl relative z-10">
             <span className="text-3xl font-[1000] tracking-tighter">
               {initials}
             </span>
          </div>

          <div className="space-y-2 relative z-10">
            <h1 className="text-3xl font-[1000] text-black tracking-tighter leading-none">{cobrador.nombre}</h1>
            <div className="flex items-center justify-center gap-2">
               <span className="text-[11px] font-[900] text-black/40 uppercase tracking-widest">{cobrador.rol}</span>
               <span className="w-1 h-1 bg-black/10 rounded-full" />
               <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${
                cobrador.estado === 'ACTIVO' ? 'bg-ios-green/10 text-ios-green' :
                cobrador.estado === 'PENALIZADO' ? 'bg-ios-yellow/10 text-ios-yellow' :
                'bg-ios-pink/10 text-ios-pink'
              }`}>
                {cobrador.estado}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full relative z-10">
             <div className="no-nav">
               <CobradorCardActions cobrador={cobrador} fullWidth />
             </div>
             <button className="h-14 bg-black text-white rounded-[22px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all">
                Historial
             </button>
          </div>
        </div>
      </section>

      {/* ── Operational Metrics ── */}
      <section className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="ios-glass-alt p-5 rounded-[32px] border-none flex flex-col gap-3">
           <div className="w-10 h-10 rounded-xl bg-ios-blue/10 text-ios-blue flex items-center justify-center">
              <TrendUp weight="fill" size={20} />
           </div>
           <div>
             <p className="text-2xl font-[1000] text-black tracking-tighter">{metricas.efectividad}%</p>
             <p className="text-[9px] font-black text-black/30 uppercase tracking-widest mt-1">Efectividad</p>
           </div>
        </div>
        <div className="ios-glass-alt p-5 rounded-[32px] border-none flex flex-col gap-3">
           <div className="w-10 h-10 rounded-xl bg-ios-purple/10 text-ios-purple flex items-center justify-center">
              <Vault weight="fill" size={20} />
           </div>
           <div>
             <p className="text-2xl font-[1000] text-black tracking-tighter">{metricas.clientes}</p>
             <p className="text-[9px] font-black text-black/30 uppercase tracking-widest mt-1">Clientes</p>
           </div>
        </div>
      </section>

      {/* ── Basic Information ── */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-[11px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Datos de Expediente</h3>
        
        <div className="ios-glass p-2 rounded-[32px] border-none space-y-1">
          <InfoItem 
            icon={EnvelopeSimple} 
            label="Credencial Acceso" 
            value={cobrador.email} 
            color="blue"
          />
          <InfoItem 
            icon={Phone} 
            label="Contacto WhatsApp" 
            value={cobrador.telefono || "Sin Registro"} 
            color="green"
            href={cobrador.telefono ? `https://wa.me/${cobrador.telefono.replace(/\D/g, '')}` : undefined}
          />
          <InfoItem 
            icon={IdentificationCard} 
            label="Documento ID" 
            value={cobrador.cedula || "N/A"} 
            color="purple"
          />
          <InfoItem 
            icon={Calendar} 
            label="Fecha Registro" 
            value={new Date(cobrador.created_at).toLocaleDateString()} 
            color="ios-gray"
          />
        </div>
      </section>

      {/* ── Security / Compliance ── */}
      <section className="ios-glass-alt p-6 rounded-[32px] border-none flex items-center gap-5 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center text-ios-blue">
           <ShieldCheck weight="fill" size={28} />
        </div>
        <div>
          <h4 className="text-sm font-black text-black uppercase tracking-widest">Enclave Securizado</h4>
          <p className="text-[11px] font-bold text-black/30 mt-1">Este perfil está bajo auditoría Zero Trust y monitoreo de geolocalización activa.</p>
        </div>
      </section>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, color, href }: { icon: any, label: string, value: string, color: string, href?: string }) {
  const colorMap: any = {
    blue: "text-ios-blue",
    green: "text-ios-green",
    purple: "text-ios-purple",
    'ios-gray': "text-ios-gray"
  };

  const content = (
    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/[0.02] transition-colors">
      <div className={`w-10 h-10 rounded-xl bg-black/[0.03] flex items-center justify-center ${colorMap[color] || "text-black/40"}`}>
         <Icon weight="bold" size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-black/20 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-[14px] font-[800] text-black truncate">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block active:scale-[0.98] transition-transform">
        {content}
      </a>
    );
  }

  return content;
}
