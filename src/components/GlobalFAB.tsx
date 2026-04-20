"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { 
  Plus, 
  X, 
  UserPlus, 
  UsersThree, 
  CurrencyDollar,
  HandCoins
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import QuickSearchModal from "./QuickSearchModal";
import PaymentModal from "./PaymentModal";
import ClientFormModal from "@/app/capitan/clientes/ClientFormModal";
import CobradorFormModal from "@/app/capitan/cobradores/CobradorFormModal";

export default function GlobalFAB() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Modals visibility states
  const [showSearch, setShowSearch] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showCobradorForm, setShowCobradorForm] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Determine actions based on path
  const isClientsPage = pathname?.includes("/capitan/clientes");
  const isCobradoresPage = pathname?.includes("/capitan/cobradores");
  const isDashboard = pathname === "/capitan";

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setShowSearch(false);
    setShowPayment(true);
  };

  const actions = [
    {
      id: "pago",
      label: "Registrar Pago",
      icon: HandCoins,
      color: "bg-ios-blue",
      onClick: () => { setShowSearch(true); setIsOpen(false); },
      visible: isDashboard || (!isClientsPage && !isCobradoresPage)
    },
    {
      id: "cliente",
      label: "Crear Cliente",
      icon: UserPlus,
      color: "bg-ios-green",
      onClick: () => { setShowClientForm(true); setIsOpen(false); },
      visible: isDashboard || isClientsPage || (!isCobradoresPage)
    },
    {
      id: "cobrador",
      label: "Crear Cobrador",
      icon: UsersThree,
      color: "bg-ios-purple",
      onClick: () => { setShowCobradorForm(true); setIsOpen(false); },
      visible: isDashboard || isCobradoresPage || (!isClientsPage)
    }
  ].filter(a => a.visible);

  return (
    <>
      <div className="fixed bottom-32 right-6 md:bottom-10 md:right-10 z-[150] flex flex-col items-end gap-3">
        {/* Speed Dial Menu */}
        <AnimatePresence>
          {isOpen && (
            <div className="flex flex-col items-end gap-3 mb-3">
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 group"
                >
                  <span className="bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {action.label}
                  </span>
                  <button
                    onClick={action.onClick}
                    className={`${action.color} text-white w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all`}
                  >
                    <action.icon weight="fill" size={24} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Main Trigger Button */}
        <motion.button
          onClick={toggleMenu}
          whileTap={{ scale: 0.9 }}
          className={`${isOpen ? 'bg-black' : 'bg-ios-blue'} text-white w-14 h-14 md:w-16 md:h-16 rounded-[24px] shadow-2xl flex items-center justify-center transition-all z-20`}
        >
          {isOpen ? <X weight="bold" size={24} /> : <Plus weight="bold" size={24} />}
        </motion.button>
      </div>

      {/* Modals integrated here for a centralized operational experience */}
      <QuickSearchModal 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
        onSelect={handleSelectClient} 
      />
      
      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        client={selectedClient} 
      />

      <ClientFormModal 
        isOpen={showClientForm} 
        onClose={() => setShowClientForm(false)} 
      />

      <CobradorFormModal 
        isOpen={showCobradorForm} 
        onClose={() => setShowCobradorForm(false)} 
      />
    </>
  );
}
