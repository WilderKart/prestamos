"use client";

import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="w-10 h-10 bg-black/[0.03] hover:bg-black/10 rounded-2xl flex items-center justify-center transition-all active:scale-90 group ios-glass border-none"
      title="Volver atrás"
    >
      <CaretLeft 
        weight="bold" 
        size={20} 
        className="text-black/40 group-hover:text-black group-hover:-translate-x-0.5 transition-all" 
      />
    </button>
  );
}
