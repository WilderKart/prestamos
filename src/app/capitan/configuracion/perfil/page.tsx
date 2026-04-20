"use client";

import { CaretLeft, User, Camera, Check } from "@phosphor-icons/react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PerfilConfigPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
      <header className="mb-12 flex items-center gap-6">
        <Link href="/capitan/configuracion" className="p-3 bg-black/5 rounded-2xl hover:bg-black/10 transition-colors">
          <CaretLeft weight="bold" size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-[1000] text-black tracking-tighter leading-none">Mi Perfil</h1>
          <p className="text-[11px] font-bold text-black/30 uppercase tracking-[0.2em] mt-2">Identidad del Capitán</p>
        </div>
      </header>

      <div className="space-y-10">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 bg-ios-blue text-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-ios-blue/30">
              <User weight="fill" size={64} />
            </div>
            <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
              <Camera weight="fill" size={20} />
            </button>
          </div>
          <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Capitán de Operaciones</p>
        </div>

        {/* Info Grid */}
        <div className="bg-white rounded-[32px] border border-black/[0.03] shadow-sm divide-y divide-black/[0.02]">
          <div className="p-6 space-y-2">
            <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-1">Nombre Público</label>
            <input 
              type="text" 
              defaultValue="Juan Capitán"
              className="w-full bg-transparent border-none p-0 text-[17px] font-bold text-black outline-none focus:ring-0" 
            />
          </div>
          <div className="p-6 space-y-2">
            <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
            <input 
              type="email" 
              readOnly
              defaultValue="juan@mivank.com"
              className="w-full bg-transparent border-none p-0 text-[17px] font-bold text-black/40 outline-none focus:ring-0" 
            />
          </div>
          <div className="p-6 space-y-2">
            <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-1">Teléfono Enlazado</label>
            <input 
              type="tel" 
              defaultValue="+57 300 123 4567"
              className="w-full bg-transparent border-none p-0 text-[17px] font-bold text-black outline-none focus:ring-0" 
            />
          </div>
        </div>

        <button className="w-full h-16 bg-ios-blue text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl shadow-ios-blue/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
          <Check weight="bold" size={20} />
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
