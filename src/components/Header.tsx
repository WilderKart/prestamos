'use client';

import React from 'react';
import { Bell, User, Search, LogOut } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";

export default function Header() {
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="header-chation flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#F5C518] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
          <span className="text-black font-black text-xl italic leading-none">M</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold tracking-tight text-white">Mivank</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-none">Capital Group</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
          <Search size={18} />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#F5C518] rounded-full border border-black group-hover:scale-125 transition-transform"></span>
        </button>
        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-[#ef4444] group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-[#ef4444]/30">
            <User size={16} className="text-gray-500 group-hover:text-[#ef4444]" />
          </div>
          <LogOut size={16} className="hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
