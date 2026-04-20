import { create } from 'zustand';

export interface Notification {
  id: string;
  empresa_id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  leida: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  setNotifications: (data) =>
    set({
      notifications: data,
      unreadCount: data.filter((n) => !n.leida).length,
      loading: false,
    }),

  addNotification: (n) =>
    set((state) => {
      // Evitar duplicados en tiempo real (por reconexiones)
      if (state.notifications.some((existing) => existing.id === n.id)) {
        return state;
      }
      const updated = [n, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((x) => !x.leida).length,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((x) => !x.leida).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, leida: true })),
      unreadCount: 0,
    })),

  setLoading: (loading) => set({ loading }),
}));
