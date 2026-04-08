import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import RealtimeSubscriber from "@/components/RealtimeSubscriber";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await requireAuth("ADMIN");
  } catch {
    redirect("/login");
  }

  async function logout() {
    "use server";
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-[family-name:var(--font-inter)]">
      <RealtimeSubscriber role="ADMIN" />
      
      {/* Header con botón atrás y cerrar sesión */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.history.back()} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver atrás"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Panel Admin</h1>
        </div>
        
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </form>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden max-w-[1600px] w-full mx-auto pb-32 md:pb-12">
        {children}
      </main>
    </div>
  );
}
