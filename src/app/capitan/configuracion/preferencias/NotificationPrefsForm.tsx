"use client";

import { useState } from "react";
import { updateNotificationPrefsAction, NotificationPrefs } from "@/app/actions/user_preferences";
import { 
  Bell, 
  Envelope, 
  DeviceMobile, 
  CircleNotch, 
  CheckCircle 
} from "@phosphor-icons/react";
import { toast } from "react-hot-toast";

export default function NotificationPrefsForm({ 
  initialPrefs 
}: { 
  initialPrefs: NotificationPrefs 
}) {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs);

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await updateNotificationPrefsAction(prefs);
    
    if (result.success) {
      toast.success("Preferencias sincronizadas");
    } else {
      toast.error(result.error || "Fallo en la sincronización");
    }
    setLoading(false);
  };

  const Channels = [
    { id: "in_app", label: "Alertas In-App", desc: "Centro de notificaciones interno", icon: Bell, color: "bg-ios-blue" },
    { id: "email", label: "Correo Electrónico", desc: "Resúmenes operativos diarios", icon: Envelope, color: "bg-ios-purple" },
    { id: "push", label: "Notificaciones Push", desc: "Alertas críticas en lockscreen", icon: DeviceMobile, color: "bg-ios-pink" }
  ];

  return (
    <div className="space-y-6">
      <div className="ios-glass p-8 rounded-[40px] border-none shadow-2xl space-y-6">
        {Channels.map((channel) => {
          const isActive = prefs[channel.id as keyof NotificationPrefs];
          const Icon = channel.icon;

          return (
            <div 
              key={channel.id}
              onClick={() => toggle(channel.id as keyof NotificationPrefs)}
              className="flex items-center justify-between p-5 bg-black/[0.02] rounded-3xl cursor-pointer hover:bg-black/[0.04] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? `${channel.color} text-white shadow-lg` : "bg-black/5 text-black/20"}`}>
                  <Icon weight="fill" size={24} />
                </div>
                <div>
                   <p className="text-[14px] font-[1000] text-black tracking-tight">{channel.label}</p>
                   <p className="text-[10px] font-bold text-ios-gray/40 uppercase tracking-tighter">{channel.desc}</p>
                </div>
              </div>
              
              <div className={`w-14 h-8 rounded-full relative transition-all duration-300 p-1 ${isActive ? "bg-ios-green" : "bg-black/10"}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${isActive ? "translate-x-6" : "translate-x-0"}`} />
              </div>
            </div>
          );
        })}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-4 py-6 bg-black text-white rounded-[28px] text-[13px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <CircleNotch className="animate-spin" size={24} weight="bold" />
          ) : (
            <>
              <CheckCircle weight="fill" size={24} />
              Guardar Preferencias
            </>
          )}
        </button>
      </div>
    </div>
  );
}
