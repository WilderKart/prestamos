"use client";

import { useActionState, useState, useCallback, useRef } from "react";
import { crearCliente, uploadDocumento } from "./actions";
import {
  UserPlus,
  Loader2,
  X,
  User,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  Shield,
  Upload,
  CheckCircle2,
  ChevronRight,
  FileText,
  AlertCircle
} from "lucide-react";
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
    <div className="flex items-center gap-3 pt-6 pb-2">
      <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{title}</h3>
    </div>
  );
}

function InputField({
  label, name, type = "text", placeholder, required = false, disabled = false
}: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-gray-400 underline decoration-accent-yellow/30 underline-offset-4 uppercase ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-2xl border-none bg-gray-50 px-4 py-3.5 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-yellow outline-none transition-all disabled:opacity-50"
      />
    </div>
  );
}

export default function ClientFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(crearCliente, initialState);
  const [documentoUrl, setDocumentoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // File Upload Logic
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
    } else if (result.error) {
      alert(result.error);
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    maxFiles: 1,
    multiple: false
  });

  if (state?.success && isOpen) {
    setIsOpen(false);
    state.success = false;
    formRef.current?.reset();
    setDocumentoUrl("");
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-pill bg-accent-yellow text-black flex items-center gap-2 hover:scale-105 active:scale-95 shadow-[0_10px_20px_-5px_#FFD60A]"
      >
        <UserPlus className="w-5 h-5" />
        NUEVO CLIENTE
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20"
            >
              {/* Header */}
              <div className="bg-[#111111] text-white px-8 py-6 flex items-center justify-between shrink-0 rounded-b-[32px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-yellow flex items-center justify-center text-black">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Registro de Cliente</h2>
                    <p className="text-[10px] font-bold text-accent-yellow tracking-[3px] uppercase opacity-80">Expansión Mivank</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form Content */}
              <form ref={formRef} action={formAction} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                {state?.error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-black rounded-2xl flex items-center gap-2 animate-fade-up">
                    <AlertCircle className="w-4 h-4" />
                    {state.error.toUpperCase()}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* PERSONALES */}
                  <div className="md:col-span-2">
                    <SectionHeader icon={User} title="Datos Personales" color="bg-blue-50 text-blue-600" />
                  </div>
                  <InputField label="Nombre Completo" name="nombre" placeholder="Ej. Juan Pérez" required disabled={isPending} />
                  <InputField label="Cédula" name="cedula" placeholder="12345678" required disabled={isPending} />
                  <InputField label="Email" name="email" type="email" placeholder="correo@email.com" disabled={isPending} />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Celular" name="telefono" placeholder="300..." disabled={isPending} />
                    <InputField label="Fijo" name="telefono_fijo" placeholder="601..." disabled={isPending} />
                  </div>

                  {/* CONTACTO */}
                  <div className="md:col-span-2">
                    <SectionHeader icon={MapPin} title="Residencia" color="bg-pink-50 text-pink-600" />
                  </div>
                  <div className="md:col-span-2">
                    <InputField label="Dirección Exacta" name="direccion" placeholder="Cra 10 #20-30, Barrio..." disabled={isPending} />
                  </div>

                  {/* LABORAL */}
                  <div className="md:col-span-2">
                    <SectionHeader icon={Briefcase} title="Información Laboral" color="bg-orange-50 text-orange-600" />
                  </div>
                  <InputField label="Actividad Económica" name="actividad_economica" placeholder="Comerciante..." disabled={isPending} />
                  <InputField label="Empresa / Lugar" name="lugar_trabajo" placeholder="Empresa XYZ" disabled={isPending} />
                  <div className="md:col-span-2">
                    <InputField label="Dirección Trabajo" name="direccion_trabajo" placeholder="Sector..." disabled={isPending} />
                  </div>

                  {/* FINANCIERO */}
                  <div className="md:col-span-2">
                    <SectionHeader icon={CreditCard} title="Datos de Pago" color="bg-green-50 text-green-600" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 uppercase ml-1">Método</label>
                    <select
                      name="metodo_pago_principal"
                      required
                      className="w-full rounded-2xl border-none bg-gray-50 px-4 py-3.5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-accent-yellow outline-none appearance-none"
                    >
                      <option value="">Seleccionar...</option>
                      {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <InputField label="Número de Cuenta" name="numero_cuenta" placeholder="000-000-000" required disabled={isPending} />

                  {/* DOCUMENTO CLIENTE */}
                  <div className="md:col-span-2">
                    <SectionHeader icon={Upload} title="Cédula de Ciudadanía" color="bg-purple-50 text-purple-600" />
                    <div {...getRootProps()} className={`mt-2 border-2 border-dashed rounded-[32px] p-8 text-center transition-all cursor-pointer ${
                      isDragActive ? "border-accent-yellow bg-accent-yellow/5" : "border-gray-100 hover:border-accent-yellow hover:bg-gray-50"
                    }`}>
                      <input {...getInputProps()} />
                      {documentoUrl ? (
                         <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                            <p className="text-sm font-black text-gray-900">DOCUMENTO LISTO</p>
                            <input type="hidden" name="documento_url" value={documentoUrl} />
                         </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                            {uploading ? <Loader2 className="w-6 h-6 animate-spin text-accent-yellow" /> : <FileText className="w-6 h-6 text-gray-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">SUBIR ARCHIVO</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">PDF o Imagen (Máx 5MB)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FIADOR DINÁMICO */}
                  <div className="md:col-span-2">
                    <FiadorSection />
                  </div>
                </div>

                <div className="h-10 shrink-0" />
              </form>

              {/* Footer */}
              <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-4 text-xs font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={isPending || uploading}
                  onClick={() => formRef.current?.requestSubmit()}
                  className="flex-[2] btn-pill bg-[#111111] text-white flex items-center justify-center gap-3 hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5 text-accent-yellow" />}
                  <span className="font-black text-xs tracking-widest uppercase">Guardar Registro</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
