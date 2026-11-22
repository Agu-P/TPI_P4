import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { axiosInstance } from '../shared/api/axiosInstance';

export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  disabled: boolean;
  created_at: string;
}

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        await axiosInstance.post('/auth/token', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const res = await axiosInstance.get<Usuario>('/auth/me');
        set({ usuario: res.data, cargando: false });
      },

      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
        } catch {
        } finally {
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const res = await axiosInstance.get<Usuario>('/auth/me');
          set({ usuario: res.data, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => {
        set({ usuario: null, cargando: false });
      },
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);
