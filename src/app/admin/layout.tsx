import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import RealtimeSubscriber from "@/components/RealtimeSubscriber";
import { Wallet, LogOut, Menu, X } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: roleData, error } = await supabase.rpc("get_user_role");
  const roleStr = typeof roleData === 'string' ? roleData : roleData?.[0]?.get_user_role;
  const parsedRole = roleStr?.toUpperCase();

  if (error || parsedRole !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-[family-name:var(--font-inter)]">
      <RealtimeSubscriber role="ADMIN" />
      
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden max-w-[1600px] w-full mx-auto pb-32 md:pb-12">
        {children}
      </main>
    </div>
  );
}
