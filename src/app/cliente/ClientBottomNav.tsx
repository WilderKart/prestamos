"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";

export default function ClientBottomNav({ navLinks }: { navLinks: any[] }) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-6 pb-8 pointer-events-none">
      <div className="ios-glass border-none h-20 w-full rounded-[32px] shadow-2xl shadow-black/10 flex items-center justify-around px-2 pointer-events-auto border-t border-white/20">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl relative transition-all active:scale-90 ${
                isActive ? "text-ios-blue" : "text-black/30"
              }`}
            >
              <Icon weight={isActive ? "fill" : "bold"} size={26} />
              {link.badge && link.badge > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-ios-pink rounded-full text-[8px] text-white flex items-center justify-center font-black shadow-[0_0_6px_rgba(255,45,85,0.5)]">
                  {link.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-ios-blue rounded-full" />
              )}
            </Link>
          );
        })}
        <form
          action={async () => {
             // We can't use "use server" here directly in a client component file easily without a separate action file
             // So we'll just use a button that triggers a signout via a client-side call or redirect to a signout route
             window.location.href = "/login"; // Temporal until integrated properly or just keep it as is if it was a server action
          }}
        >
          <button type="submit" className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-ios-pink active:scale-90 transition-all opacity-40">
            <SignOut weight="bold" size={24} />
          </button>
        </form>
      </div>
    </nav>
  );
}
