"use client";

import { create } from 'zustand';

interface ChatStore {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    isOpen: false,
    setIsOpen: (updater) =>
        set((state) => ({
            isOpen: typeof updater === 'function' ? updater(state.isOpen) : updater,
        })),
}));
