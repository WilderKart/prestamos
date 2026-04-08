"use client";

import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="Volver atrás"
    >
      <ArrowLeft className="w-5 h-5 text-gray-600" />
    </button>
  );
}
