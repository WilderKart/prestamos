"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Receipt, Settings, Search, LogOut, LucideIcon, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

const IconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Receipt,
  Search,
  FileText,
};

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export default function BottomNav({ items = [] }: { items?: NavItem[] }) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111111] px-4 pt-2 pb-6 flex items-center justify-around gap-2 z-50 border-t border-white/5">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = IconMap[item.icon] || LayoutDashboard;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative group flex flex-col items-center gap-0.5 py-1 px-3 outline-none"
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent-yellow rounded-full z-0"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon 
              className={`w-5 h-5 relative z-10 transition-colors duration-300 ${
                isActive ? "text-accent-yellow" : "text-gray-400 group-hover:text-white"
              }`} 
            />
            <span className={`text-[10px] font-medium relative z-10 transition-colors duration-300 ${
              isActive ? "text-accent-yellow" : "text-gray-500 group-hover:text-gray-300"
            }`}>{item.name}</span>
          </Link>
        );
      })}
      
      <button 
        onClick={handleLogout}
        className="p-2 text-gray-400 hover:text-red-400 transition-colors outline-none"
      >
        <LogOut className="w-6 h-6" />
      </button>
      
      <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center ml-2 cursor-pointer hover:bg-zinc-700 transition-all">
        <Settings className="w-5 h-5 text-gray-400" />
      </div>
    </nav>
  );
}
