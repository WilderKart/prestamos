"use client";

import { usePathname } from "next/navigation";
import { Grid, Bell, MessageSquareText } from "lucide-react";

export default function DynamicHeader({ title }: { title: string }) {
  return (
    <header className="bg-[#111111] text-white h-12 px-4 flex items-center sticky top-0 z-50 w-full">
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer">
          <Grid className="w-5 h-5" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-yellow rounded-lg flex items-center justify-center text-black">
             <MessageSquareText className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight">{title}</span>
        </div>

        <div className="relative cursor-pointer hover:scale-110 transition-transform">
          <div className="p-1.5 bg-zinc-800 rounded-lg">
             <Bell className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
