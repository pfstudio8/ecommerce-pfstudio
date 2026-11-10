import { create } from 'zustand';
import { Product } from '@/types/product';

export interface ProductDrawerStore {
    isOpen: boolean;
    product: Product | null;
    openDrawer: (product: Product) => void;
    closeDrawer: () => void;
}

export const useProductDrawerStore = create<ProductDrawerStore>((set) => ({
    isOpen: false,
    product: null,
    openDrawer: (product: Product) => set({ isOpen: true, product }),
    closeDrawer: () => set({ isOpen: false }),
}));

