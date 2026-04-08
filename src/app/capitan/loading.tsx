import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-2xl transform -rotate-6">
            <Loader2 className="w-8 h-8 text-[#F5C518] animate-spin" strokeWidth={3} />
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#F5C518] rounded-full border-4 border-white shadow-lg animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Mivank Global</p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Sincronizando activos...</p>
        </div>
      </div>
    </div>
  );
}
