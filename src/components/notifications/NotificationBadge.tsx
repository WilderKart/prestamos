"use client";

import { useNotificationStore } from "@/store/useNotificationStore";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBadge() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <AnimatePresence>
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-ios-pink rounded-full border-2 border-white shadow-lg flex items-center justify-center px-1 z-20"
        >
          <span className="text-[10px] font-black text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
