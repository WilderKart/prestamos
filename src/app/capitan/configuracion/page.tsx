"use client";

import Link from "next/link";
import { 
  UserCircle, 
  Storefront, 
  ShieldCheck, 
  Palette, 
  CaretRight,
  Bell,
  Fingerprint,
  Info
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

const SETTINGS_GROUPS = [
  {
    title: "Administración",
    items: [
      { id: "perfil", label: "Perfil del Capitán", icon: UserCircle, color: "bg-ios-blue", href: "/capitan/configuracion/perfil" },
      { id: "empresa", label: "Configuración Empresa", icon: Storefront, color: "bg-ios-purple", href: "/capitan/configuracion/empresa" }
    ]
  },
  {
    title: "Seguridad y Accesos",
    items: [
      { id: "seguridad", label: "Zero Trust & MFA", icon: ShieldCheck, color: "bg-ios-green", href: "/capitan/configuracion/seguridad" },
      { id: "logs", label: "Registro de Actividad", icon: Info, color: "bg-ios-gray", href: "/capitan/configuracion/logs" }
    ]
  },
  {
    title: "Preferencias",
    items: [
      { id: "notificaciones", label: "Notificaciones", icon: Bell, color: "bg-ios-pink", href: "/capitan/configuracion/preferencias" },
      { id: "apariencia", label: "Apariencia (Modo Claro)", icon: Palette, color: "bg-ios-yellow", href: "/capitan/configuracion/apariencia" }
    ]
  }
];

export default function ConfiguracionPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
      <header className="mb-12">
        <h1 className="text-4xl font-[1000] text-black tracking-tighter mb-2 italic">Ajustes</h1>
        <p className="text-[13px] font-bold text-black/30 uppercase tracking-[0.2em]">Configuración de Base Operativa</p>
      </header>

      <div className="space-y-10">
        {SETTINGS_GROUPS.map((group, gIdx) => (
          <motion.section 
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gIdx * 0.1 }}
          >
            <h2 className="text-[11px] font-black text-black/20 uppercase tracking-[3px] mb-4 ml-4">
              {group.title}
            </h2>
            <div className="bg-white rounded-[32px] overflow-hidden border border-black/[0.03] shadow-sm">
              {group.items.map((item, iIdx) => (
                <Link 
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between p-5 hover:bg-black/[0.02] transition-colors group ${
                    iIdx !== group.items.length - 1 ? "border-b border-black/[0.02]" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-[14px] ${item.color} text-white flex items-center justify-center shadow-lg shadow-black/5`}>
                      <item.icon weight="fill" size={20} />
                    </div>
                    <span className="font-bold text-[15px] text-black group-hover:translate-x-1 transition-transform">{item.label}</span>
                  </div>
                  <CaretRight weight="bold" size={16} className="text-black/10 group-hover:text-black transition-colors" />
                </Link>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      <footer className="mt-20 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/[0.03] rounded-full">
           <Fingerprint weight="bold" size={14} className="text-ios-blue" />
           <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Protocolo Zero Trust Activo</span>
        </div>
        <p className="text-[9px] font-bold text-black/10 tracking-[0.5em] uppercase">Mivank Fintech System v1.5.0</p>
      </footer>
    </div>
  );
}
