import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
    isModalOpen: boolean;
    user: User | null;
    isInitialized: boolean;
    setModalOpen: (isOpen: boolean) => void;
    setUser: (user: User | null) => void;
    setInitialized: (isInitialized: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isModalOpen: false,
    user: null,
    isInitialized: false,
    setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
    setUser: (user) => set({ user }),
    setInitialized: (isInitialized) => set({ isInitialized }),
    logout: () => set({ user: null }),
}));
