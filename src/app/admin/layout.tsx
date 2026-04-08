export const dynamic = 'force-dynamic';

import { requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import RealtimeSubscriber from "@/components/RealtimeSubscriber";
import BackButton from "./BackButton";
import { logout } from "@/app/actions/logout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAuth("ADMIN");
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-[family-name:var(--font-inter)]">
      <RealtimeSubscriber role="ADMIN" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <BackButton />
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
