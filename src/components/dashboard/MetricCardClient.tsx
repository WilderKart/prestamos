"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface MetricCardClientProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function MetricCardClient({ href, children, className = "" }: MetricCardClientProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/5 active:scale-95 ${className}`}
    >
      {children}
    </div>
  );
}
