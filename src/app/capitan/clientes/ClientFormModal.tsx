"use client";

import { useActionState, useState, useCallback, useRef, useEffect } from "react";
import { usePersistentForm } from "@/hooks/usePersistentForm";
import { crearCliente, uploadDocumento } from "./actions";
import {
  UserPlus,
  CircleNotch,
  X,
  User,
  Phone,
  MapPin,
  NavigationArrow,
  Briefcase,
  CreditCard,
  CloudArrowUp,
  CheckCircle,
  CaretRight,
  FileText,
  WarningCircle,
  Plus
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import FiadorSection from "./FiadorSection";
import { useDropzone } from "react-dropzone";

const initialState: any = {
  error: "",
  success: false,
};

const METODOS_PAGO = [
  { value: "NEQUI", label: "Nequi" },
  { value: "DAVIPLATA", label: "Daviplata" },
  { value: "BANCO", label: "Transferencia Bancaria" },
];

function SectionHeader({ icon: Icon, title, color }: { icon: any; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 pt-6 pb-2 border-b border-black/[0.03] mb-4">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shadow-sm`}>
        <Icon weight="fill" size={20} />
      </div>
      <h3 className="text-[13px] font-[800] text-black uppercase tracking-[2px]">{title}</h3>
    </div>
  );
}

function InputField({
  label, name, type = "text", placeholder, required = false, disabled = false, value = "", onChange
}: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean; disabled?: boolean; value?: string; onChange?: (e: any) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-[700] text-ios-gray/60 uppercase ml-1 tracking-wider">
        {label} {required && <span className="text-ios-pink">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-[18px] border-none bg-ios-bg px-4 py-4 text-[15px] font-semibold text-black placeholder:text-ios-gray/40 focus:ring-2 focus:ring-ios-blue/20 outline-none transition-all disabled:opacity-50"
      />
    </div>
  );
}

export default function ClientFormModal({ 
  isOpen: externalOpen, 
  onClose: externalClose 
}: { 
  isOpen?: boolean; 
  onClose?: () => void; 
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOpen !== undefined ? (val: boolean) => !val && externalClose?.() : setInternalOpen;

  const [state, formAction, isPending] = useActionState(crearCliente, initialState);
  const [documentoUrl, setDocumentoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { data: draft, setFieldValue, clearDraft } = usePersistentForm("crear-cliente", {
    nombre: "",
    cedula: "",
    email: "",
    telefono: "",
    telefono_fijo: "",
    direccion: "",
    actividad_economica: "",
    lugar_trabajo: "",
    direccion_trabajo: "",
    metodo_pago_principal: "",
    numero_cuenta: "",
    documento_url: "",
    lat: "",
    lng: "",
  });

  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFieldValue("lat", position.coords.latitude.toString());
        setFieldValue("lng", position.coords.longitude.toString());
        setLocationStatus("success");
      },
      () => {
        setLocationStatus("error");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFieldValue(e.target.name as any, e.target.value);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", "cedula_cliente");

    const result = await uploadDocumento(formData);
    if (result.url) {
      setDocumentoUrl(result.url);
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: 5242880,
  });

  useEffect(() => {
    if (state?.success && isOpen) {
      setIsOpen(false);
      clearDraft();
      setDocumentoUrl("");
    }
  }, [state?.success, isOpen, clearDraft]);

  return (
    <>
      {externalOpen === undefined && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white text-ios-blue px-6 py-4 rounded-[22px] flex items-center gap-3 font-bold text-sm hover:bg-ios-blue hover:text-white transition-all shadow-xl shadow-ios-blue/10 border border-white/20 active:scale-95"
        >
          <Plus weight="bold" size={20} />
          REGISTRAR CLIENTE
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-white border-b border-black/[0.03] px-8 py-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                    <UserPlus weight="fill" size={24} />
                  </div>
                  <div>
                    <h2 className="text-[19px] font-[900] text-black tracking-tight leading-none uppercase">Nuevo Perfil</h2>
                    <p className="text-[11px] font-bold text-ios-gray tracking-[2px] uppercase mt-2">Expansión Mivank</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-ios-bg rounded-full hover:bg-ios-gray/10 transition-colors"
                >
                  <X weight="bold" size={20} className="text-ios-gray" />
                </button>
              </div>

              {/* Form Content */}
              <form ref={formRef} action={formAction} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-hide">
                {state?.error && (
                  <div className="p-4 bg-ios-pink/10 text-ios-pink text-[11px] font-black rounded-[22px] flex items-center gap-2 animate-shake">
                    <WarningCircle weight="fill" size={18} />
                    {state.error.toUpperCase()}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* PERSONALES */}
                  <div className="md:col-span-2">
                    <SectionHeader icon={User} title="Identidad" color="bg-ios-blue/10 text-ios-blue" />
                  </div>
                  <InputField label="Nombre Completo" name="nombre" placeholder="Nombre real del titular" required disabled={isPending} value={draft.nombre} onChange={handleChange} />
                  <InputField label="Cédula" name="cedula" placeholder="Sin puntos ni comas" required disabled={isPending} value={draft.cedula} onChange={handleChange} />
                  <InputField label="Email" name="email" type="email" placeholder="Para notificaciones" disabled={isPending} value={draft.email} onChange={handleChange} />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Celular" name="telefono" placeholder="300-000..." disabled={isPending} value={draft.telefono} onChange={handleChange} />
                    <InputField label="Fijo" name="telefono_fijo" placeholder="Opcional" disabled={isPending} value={draft.telefono_fijo} onChange={handleChange} />
                  </div>

                  {/* CONTACTO */}
                  <div className="md:col-span-2">
                    <SectionHeader icon={MapPin} title="Ubicación" color="bg-ios-purple/10 text-ios-purple" />
                  </div>
                  <InputField label="Dirección Exacta" name="direccion" placeholder="Calle, Carrera, Casa..." disabled={isPending} value={draft.direccion} onChange={handleChange} />
                  <InputField label="Barrio" name="barrio" placeholder="Barrio / Sector" disabled={isPending} value={draft.barrio} onChange={handleChange} />
                  
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-[11px] font-[700] text-ios-gray/60 uppercase ml-1 tracking-wider">Geoposicionamiento</label>
                    <button
                      type="button"
                      onClick={handleCaptureLocation}
                      disabled={locationStatus === "loading"}
                      className={`w-full py-4 rounded-[22px] flex items-center justify-center gap-3 font-bold text-[13px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                        locationStatus === "success" ? "bg-ios-green/10 text-ios-green" :
                        locationStatus === "error" ? "bg-ios-pink/10 text-ios-pink" :
                        "bg-black text-white hover:bg-ios-blue"
                      }`}
                    >
                      {locationStatus === "loading" ? <CircleNotch className="animate-spin" size={20} /> : <NavigationArrow weight="fill" size={20} />}
                      {locationStatus === "success" ? "Ubicación Capturada" : 
                       locationStatus === "error" ? "Error GPS - Reintentar" : 
                       "Capturar Mi Ubicación Actual"}
                    </button>
                    {draft.lat && (
                      <p className="text-[10px] font-black text-ios-green text-center uppercase tracking-widest animate-fade-in">
                        Lat: {parseFloat(draft.lat).toFixed(6)} | Lng: {parseFloat(draft.lng).toFixed(6)}
                      </p>
                    )}
                    <input type="hidden" name="lat" value={draft.lat} />
                    <input type="hidden" name="lng" value={draft.lng} />
                  </div>

                  {/* LABORAL */}
                  <div className="md:col-span-2">
                    <SectionHeader icon={Briefcase} title="Actividad Económica" color="bg-ios-yellow/10 text-ios-yellow" />
                  </div>
                  <InputField label="Actividad" name="actividad_economica" placeholder="Ej. Comerciante" disabled={isPending} value={draft.actividad_economica} onChange={handleChange} />
                  <InputField label="Lugar de Trabajo" name="lugar_trabajo" placeholder="Nombre del negocio" disabled={isPending} value={draft.lugar_trabajo} onChange={handleChange} />

                  {/* FINANCIERO */}
                  <div className="md:col-span-2">
                    <SectionHeader icon={CreditCard} title="Parámetros de Pago" color="bg-ios-green/10 text-ios-green" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-ios-gray/60 uppercase ml-1 tracking-wider">Método Principal</label>
                    <select
                      name="metodo_pago_principal"
                      required
                      className="w-full rounded-[18px] border-none bg-ios-bg px-4 py-4 text-[15px] font-semibold text-black focus:ring-2 focus:ring-ios-blue/20 outline-none appearance-none"
                      value={draft.metodo_pago_principal}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar...</option>
                      {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <InputField label="Cuenta / Referencia" name="numero_cuenta" placeholder="Cuenta de cobro" required disabled={isPending} value={draft.numero_cuenta} onChange={handleChange} />

                  {/* DOCUMENTO CLIENTE */}
                  <div className="md:col-span-2">
                    <SectionHeader icon={CloudArrowUp} title="Validación Documentos" color="bg-black/5 text-black" />
                    <div {...getRootProps()} className={`mt-2 border-2 border-dashed rounded-[32px] p-10 text-center transition-all cursor-pointer ${
                      isDragActive ? "border-ios-blue bg-ios-blue/5" : "border-black/5 hover:border-ios-blue hover:bg-ios-bg"
                    }`}>
                      <input {...getInputProps()} />
                      {documentoUrl ? (
                         <div className="flex flex-col items-center gap-2">
                            <CheckCircle weight="fill" className="w-12 h-12 text-ios-green" />
                            <p className="text-[13px] font-bold text-black uppercase tracking-tight">Cédula Indexada</p>
                            <input type="hidden" name="documento_url" value={documentoUrl} />
                         </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center shadow-inner">
                            {uploading ? <CircleNotch weight="bold" className="w-8 h-8 animate-spin text-ios-blue" /> : <FileText weight="fill" size={32} className="text-ios-gray/40" />}
                          </div>
                          <div>
                            <p className="text-[14px] font-[800] text-black leading-none mb-1">Cargar Cédula</p>
                            <p className="text-[10px] font-bold text-ios-gray uppercase tracking-widest">Digital o Foto (JPG/PDF)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FIADOR DINÁMICO */}
                  <div className="md:col-span-2">
                    <FiadorSection initialFields={state?.fields} />
                  </div>
                </div>

                <div className="h-10 shrink-0" />
              </form>

              {/* Footer */}
              <div className="p-8 border-t border-black/[0.03] bg-ios-bg/50 flex gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-4 text-[12px] font-bold text-ios-gray hover:text-black transition-colors uppercase tracking-[2px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || uploading}
                  onClick={() => formRef.current?.requestSubmit()}
                  className="flex-[2] bg-black text-white py-4 rounded-[22px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/20 disabled:opacity-50 transition-all"
                >
                  {isPending ? <CircleNotch weight="bold" className="w-5 h-5 animate-spin" /> : <CaretRight weight="bold" size={20} />}
                  <span className="font-[800] text-[13px] tracking-widest uppercase">Guardar Registro</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
