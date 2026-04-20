"use client";

import { useEffect, useState, useRef } from "react";
import IosModal from "@/components/ui/IosModal";
import { getSignedComprobanteUrl } from "./desembolsoActions";
import { formatCurrency } from "@/utils/format";
import { toPng } from "html-to-image";
import { 
  DownloadSimple, 
  ShareNetwork,
  CircleNotch, 
  WarningCircle,
  Clock,
  User,
  CreditCard,
  FileImage,
  CheckCircle,
  ShieldCheck,
} from "@phosphor-icons/react";

export default function ComprobanteModal({
  isOpen,
  onClose,
  desembolso,
  clienteNombre,
  monto,
}: {
  isOpen: boolean;
  onClose: () => void;
  desembolso: any | null;
  clienteNombre: string;
  monto: number;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [base64Evidence, setBase64Evidence] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert signed URL to base64 to avoid CORS issues with html-to-image
  const convertToBase64 = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Error converting to base64:", err);
      return null;
    }
  };

  useEffect(() => {
    if (isOpen && desembolso?.comprobante_url) {
      setLoading(true);
      setError(null);
      getSignedComprobanteUrl(desembolso.comprobante_url).then(async (res) => {
        if (res.signedUrl) {
          const b64 = await convertToBase64(res.signedUrl);
          setBase64Evidence(b64);
        } else {
          setError(res.error || "Error al obtener el acceso seguro.");
        }
        setLoading(false);
      });
    } else if (!isOpen) {
      setBase64Evidence(null);
      setLoading(false);
      setProcessing(false);
      setError(null);
    }
  }, [isOpen, desembolso?.comprobante_url]);

  const generateImage = async () => {
    if (!receiptRef.current) return null;
    setProcessing(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        pixelRatio: 3,
        quality: 1,
        backgroundColor: "#ffffff",
        style: {
           transform: 'scale(1)',
           transformOrigin: 'top left'
        }
      });
      return dataUrl;
    } catch (err) {
      console.error("Error generating image:", err);
      setError("No se pudo generar el comprobante visual.");
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = `comprobante_mivank_${desembolso?.id?.slice(0, 8) || 'doc'}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "comprobante.png", { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Comprobante de Pago Mivank",
          text: `Comprobante de desembolso por ${formatCurrency(monto)} a ${clienteNombre}`,
          files: [file],
        });
      } else {
        // Fallback to download if sharing not supported
        handleDownload();
      }
    } catch (err) {
      console.error("Error sharing:", err);
      handleDownload(); // Fallback
    }
  };

  return (
    <IosModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Comprobante"
    >
      <div className="space-y-8 pb-10">
        
        {/* Receipt Area (Captured by html-to-image) */}
        <div className="flex justify-center">
            <div 
              ref={receiptRef}
              className="w-full max-w-[360px] bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/[0.02] relative overflow-hidden"
            >
              {/* Receipt Header */}
              <div className="flex flex-col items-center text-center space-y-4 mb-8">
                 <div className="w-16 h-16 bg-ios-green rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-ios-green/20">
                    <CheckCircle weight="fill" size={32} />
                 </div>
                 <div className="space-y-1">
                    <h2 className="text-xl font-[1000] text-black tracking-tighter leading-none">Desembolso Exitoso</h2>
                    <p className="text-[10px] font-black text-ios-green uppercase tracking-[0.2em] mt-1">Comprobante Oficial</p>
                 </div>
              </div>

              {/* Main Amount */}
              <div className="bg-black/[0.02] rounded-[32px] p-6 text-center mb-8 border border-black/[0.01]">
                 <p className="text-[10px] font-black text-black/20 uppercase mb-1 leading-none">Monto Entregado</p>
                 <p className="text-4xl font-[1000] text-black tracking-tighter leading-none pt-2">
                    {formatCurrency(monto)}
                 </p>
              </div>

              {/* Details grid */}
              <div className="space-y-6 mb-8 px-2">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-[9px] font-black text-black/20 uppercase mb-0.5 leading-none">Beneficiario</p>
                       <p className="text-[13px] font-[800] text-black uppercase leading-tight">{clienteNombre}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-black/20 uppercase mb-0.5 leading-none">Fecha</p>
                       <p className="text-[13px] font-bold text-black/60 leading-tight">
                          {desembolso?.fecha_desembolso ? new Date(desembolso.fecha_desembolso).toLocaleDateString("es").toUpperCase() : "N/A"}
                       </p>
                    </div>
                 </div>

                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-[9px] font-black text-black/20 uppercase mb-0.5 leading-none">Método de Pago</p>
                       <p className="text-[13px] font-bold text-black/60 leading-tight">{desembolso?.metodo_desembolso || "N/A"}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-black/20 uppercase mb-0.5 leading-none">Estado</p>
                       <p className="text-[13px] font-[900] text-ios-green uppercase tracking-tighter leading-tight">Confirmado</p>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-black/[0.03]">
                    <p className="text-[9px] font-black text-black/20 uppercase mb-1 leading-none">ID de Transacción</p>
                    <p className="text-[11px] font-mono text-black/40 break-all leading-tight">{desembolso?.id || "PENDIENTE"}</p>
                 </div>
              </div>

              {/* Evidence Preview inside Receipt */}
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-black/[0.02] border border-black/[0.03] flex items-center justify-center">
                 {loading ? (
                    <CircleNotch size={24} className="animate-spin text-black/10" />
                 ) : base64Evidence ? (
                    <img src={base64Evidence} className="w-full h-full object-cover opacity-90" />
                 ) : (
                    <FileImage size={32} className="text-black/5" />
                 )}
              </div>

              {/* Antifraud Footer */}
              <div className="mt-10 pt-6 border-t border-black/[0.03] flex items-center justify-center gap-2">
                 <ShieldCheck weight="fill" size={14} className="text-black/10" />
                 <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em] leading-none">Generado por Mivank Financial</p>
              </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
           <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={loading || processing}
                className="flex-1 h-16 bg-black text-white rounded-[28px] flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-30"
              >
                {processing ? (
                   <CircleNotch size={20} className="animate-spin" />
                ) : (
                   <DownloadSimple weight="bold" size={20} />
                )}
                Descargar
              </button>
              <button
                onClick={handleShare}
                disabled={loading || processing}
                className="flex-1 h-16 bg-ios-blue text-white rounded-[28px] flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-30"
              >
                <ShareNetwork weight="bold" size={20} />
                Compartir
              </button>
           </div>
           
           <button 
             onClick={onClose}
             className="w-full h-14 bg-black/[0.03] text-black/30 rounded-[24px] font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all"
           >
             Cerrar
           </button>
        </div>

        {/* Global Error Feedback */}
        {error && (
           <div className="p-5 bg-ios-pink/5 rounded-3xl flex items-center gap-4 text-ios-pink border border-ios-pink/10 animate-fade-in">
              <WarningCircle weight="fill" size={24} />
              <p className="text-xs font-bold leading-tight">{error}</p>
           </div>
        )}
      </div>
    </IosModal>
  );
}
