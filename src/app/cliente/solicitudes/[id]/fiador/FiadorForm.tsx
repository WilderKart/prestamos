"use client";

import { useState } from "react";
import { clienteAgregarFiador } from "./actions";
import { UserPlus, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FiadorForm({ solicitudId }: { solicitudId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    telefono: "",
    direccion: "",
    actividad_economica: "",
    ingresos_mensuales: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const ingresos = parseFloat(formData.ingresos_mensuales);
    if (isNaN(ingresos) || ingresos <= 0) {
      setError("Ingresa ingresos mensuales válidos");
      setLoading(false);
      return;
    }

    const result = await clienteAgregarFiador(solicitudId, {
      cedula: formData.cedula,
      nombre: formData.nombre,
      telefono: formData.telefono,
      direccion: formData.direccion,
      actividad_economica: formData.actividad_economica,
      ingresos_mensuales: ingresos,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/cliente/solicitudes");
      }, 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="pb-32">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-12 text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-mivank-text">
            Fiador registrado exitosamente
          </h3>
          <p className="text-mivank-text-muted mt-2">
            Tu capitán ha sido notificado y revisará la información
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-mivank-accent/10 rounded-xl">
            <UserPlus className="w-6 h-6 text-mivank-accent" />
          </div>
          <h1 className="text-2xl font-black text-mivank-text tracking-tight">
            Agregar Fiador
          </h1>
        </div>
        <p className="text-mivank-text-muted">
          Completa la información del fiador para continuar con tu solicitud
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="bg-mivank-card border border-mivank-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-mivank-text mb-4">
            Datos del Fiador
          </h2>

          <div>
            <label className="text-xs font-bold text-mivank-text-muted uppercase tracking-wider mb-2 block">
              Cédula
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className="w-full rounded-xl bg-mivank-elevated border border-mivank-border px-4 py-3 text-sm font-bold text-mivank-text focus:ring-2 focus:ring-mivank-accent/50 outline-none"
              placeholder="Número de cédula"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-mivank-text-muted uppercase tracking-wider mb-2 block">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full rounded-xl bg-mivank-elevated border border-mivank-border px-4 py-3 text-sm font-bold text-mivank-text focus:ring-2 focus:ring-mivank-accent/50 outline-none"
              placeholder="Nombre del fiador"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-mivank-text-muted uppercase tracking-wider mb-2 block">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full rounded-xl bg-mivank-elevated border border-mivank-border px-4 py-3 text-sm font-bold text-mivank-text focus:ring-2 focus:ring-mivank-accent/50 outline-none"
                placeholder="Teléfono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-mivank-text-muted uppercase tracking-wider mb-2 block">
                Ingresos Mensuales
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mivank-text-muted font-bold">
                  $
                </span>
                <input
                  type="number"
                  name="ingresos_mensuales"
                  value={formData.ingresos_mensuales}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-mivank-elevated border border-mivank-border pl-8 pr-4 py-3 text-sm font-bold text-mivank-text focus:ring-2 focus:ring-mivank-accent/50 outline-none"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-mivank-text-muted uppercase tracking-wider mb-2 block">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full rounded-xl bg-mivank-elevated border border-mivank-border px-4 py-3 text-sm font-bold text-mivank-text focus:ring-2 focus:ring-mivank-accent/50 outline-none"
              placeholder="Dirección del fiador"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-mivank-text-muted uppercase tracking-wider mb-2 block">
              Actividad Económica
            </label>
            <input
              type="text"
              name="actividad_economica"
              value={formData.actividad_economica}
              onChange={handleChange}
              className="w-full rounded-xl bg-mivank-elevated border border-mivank-border px-4 py-3 text-sm font-bold text-mivank-text focus:ring-2 focus:ring-mivank-accent/50 outline-none"
              placeholder="Ej: Empleado, Independiente..."
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-mivank-accent text-mivank-bg rounded-xl hover:opacity-90 transition-all disabled:opacity-50 font-black text-sm tracking-wider uppercase"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Registrar Fiador
            </>
          )}
        </button>
      </form>
    </div>
  );
}
