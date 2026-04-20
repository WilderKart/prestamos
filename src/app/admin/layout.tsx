export const dynamic = 'force-dynamic';

import { requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  SignOut,
  ShieldCheck,
  CaretLeft,
  UserCircle
} from "@phosphor-icons/react/dist/ssr";
import RealtimeSubscriber from "@/components/RealtimeSubscriber";
import BackButton from "./BackButton";
import { logout } from "@/app/actions/logout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

  return (
    <div className="min-h-screen bg-ios-bg flex flex-col selection:bg-ios-blue selection:text-white">
      <RealtimeSubscriber role="ADMIN" />
      
      {/* Premium iOS Header */}
      <header className="ios-glass h-20 px-6 flex items-center justify-between sticky top-0 z-[100] border-b border-black/[0.03]">
        <div className="flex items-center gap-4">
          <div className="active:scale-95 transition-transform">
             <BackButton />
          </div>
          <div className="h-8 w-[1px] bg-black/5 mx-1" />
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-ios-blue rounded-xl flex items-center justify-center shadow-lg shadow-ios-blue/20">
                <ShieldCheck weight="fill" size={24} className="text-white" />
             </div>
             <div className="hidden sm:block space-y-0.5">
                <h1 className="text-[17px] font-[1000] text-black tracking-tight leading-none">Mivank Executive</h1>
                <p className="text-[10px] font-black uppercase text-ios-blue tracking-[0.2em] opacity-60">Admin Protocol</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-black/[0.03] rounded-2xl border border-white">
             <div className="text-right">
                <p className="text-[11px] font-black text-black leading-none">{sessionUser.nombre}</p>
                <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">Master Root</p>
             </div>
             <UserCircle weight="fill" size={28} className="text-black/10" />
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="w-12 h-12 bg-ios-pink/10 text-ios-pink rounded-2xl flex items-center justify-center shadow-inner hover:bg-ios-pink hover:text-white transition-all active:scale-90 group"
              title="Cerrar Sistema"
            >
              <SignOut weight="bold" size={24} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto p-4 sm:p-8 md:p-12 pb-32">
          {children}
        </div>
      </main>
    </div>
  );
}
