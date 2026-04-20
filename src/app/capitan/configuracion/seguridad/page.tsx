"use client";

import { CaretLeft, ShieldCheck, Fingerprint, Key, ShieldWarning, ToggleLeft, ToggleRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

export default function SeguridadConfigPage() {
  const [mfa, setMfa] = useState(true);
  const [sessionLock, setSessionLock] = useState(true);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
      <header className="mb-12 flex items-center gap-6">
        <Link href="/capitan/configuracion" className="p-3 bg-black/5 rounded-2xl hover:bg-black/10 transition-colors">
          <CaretLeft weight="bold" size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-[1000] text-black tracking-tighter leading-none">Seguridad</h1>
          <p className="text-[11px] font-bold text-black/30 uppercase tracking-[0.2em] mt-2">Protocolos de Enclave</p>
        </div>
      </header>

      <div className="space-y-8">
        {/* Zero Trust Status */}
        <div className="p-6 bg-ios-green/5 border border-ios-green/20 rounded-[32px] flex items-center gap-5">
           <div className="w-14 h-14 bg-ios-green text-white rounded-2xl flex items-center justify-center shadow-lg shadow-ios-green/20">
             <ShieldCheck weight="fill" size={32} />
           </div>
           <div>
             <p className="text-[14px] font-[1000] text-black tracking-tight uppercase">Arquitectura Blindada</p>
             <p className="text-[11px] font-bold text-ios-green uppercase tracking-widest mt-1">Nivel de Seguridad: Máximo</p>
           </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-black/20 uppercase tracking-[3px] ml-4">Accesibilidad</h2>
          
          <div className="bg-white rounded-[32px] border border-black/[0.03] shadow-sm divide-y divide-black/[0.01]">
            <button 
              onClick={() => setMfa(!mfa)}
              className="w-full flex items-center justify-between p-6 hover:bg-black/[0.01] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black/5 rounded-[14px] flex items-center justify-center text-black/40">
                  <Fingerprint weight="bold" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[15px] text-black">Autenticación Biométrica / MFA</p>
                  <p className="text-[11px] font-medium text-black/30 italic">Requerido para acciones financieras</p>
                </div>
              </div>
              {mfa ? <ToggleRight weight="fill" size={40} className="text-ios-blue" /> : <ToggleLeft weight="fill" size={40} className="text-black/10" />}
            </button>

            <button 
              onClick={() => setSessionLock(!sessionLock)}
              className="w-full flex items-center justify-between p-6 hover:bg-black/[0.01] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black/5 rounded-[14px] flex items-center justify-center text-black/40">
                  <ShieldWarning weight="bold" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[15px] text-black">Cierre de Sesión Automático</p>
                  <p className="text-[11px] font-medium text-black/30 italic">Inactividad superior a 15 min</p>
                </div>
              </div>
              {sessionLock ? <ToggleRight weight="fill" size={40} className="text-ios-blue" /> : <ToggleLeft weight="fill" size={40} className="text-black/10" />}
            </button>

            <Link 
              href="#"
              className="w-full flex items-center justify-between p-6 hover:bg-black/[0.01] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black/5 rounded-[14px] flex items-center justify-center text-black/40">
                  <Key weight="bold" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[15px] text-black">Cambio de Contraseña</p>
                  <p className="text-[11px] font-medium text-black/30 italic">Última actualización: Hace 3 meses</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
