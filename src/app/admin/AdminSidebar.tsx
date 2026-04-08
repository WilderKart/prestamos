"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  UserCircle2, 
  Wallet, 
  Receipt, 
  RefreshCcw, 
  Settings, 
  ScrollText 
} from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/capitanes", label: "Capitanes", icon: UserSquare2 },
  { href: "/admin/clientes", label: "Clientes", icon: UserCircle2 },
  { href: "/admin/prestamos", label: "Préstamos", icon: Wallet },
  { href: "/admin/pagos", label: "Pagos", icon: Receipt },
  { href: "/admin/retanqueos", label: "Retanqueos", icon: RefreshCcw },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
  { href: "/admin/logs", label: "Logs Auditoría", icon: ScrollText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
      <div className="mb-4 mt-2 px-3">
        <p className="text-[10px] font-bold text-mivank-text-muted uppercase tracking-widest">CMS Master</p>
      </div>
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all group ${
              isActive
                ? "bg-mivank-accent/10 text-mivank-accent"
                : "text-mivank-text-secondary hover:text-mivank-text hover:bg-mivank-elevated"
            }`}
          >
            <Icon className={`w-4.5 h-4.5 transition-colors ${
              isActive ? "text-mivank-accent" : "text-mivank-text-muted group-hover:text-mivank-text"
            }`} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
