import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/store/auth';

export interface FavoritesStore {
    favoriteIds: string[];
    isLoading: boolean;
    isFavoritesOpen: boolean;
    setFavoritesOpen: (open: boolean) => void;
    fetchFavorites: () => Promise<void>;
    toggleFavorite: (productId: string) => Promise<boolean>;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
    favoriteIds: [],
    isLoading: false,
    isFavoritesOpen: false,
    setFavoritesOpen: (open: boolean) => set({ isFavoritesOpen: open }),
    fetchFavorites: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) {
            set({ favoriteIds: [] });
            return;
        }
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('product_id')
                .eq('user_id', user.id);
            if (!error && data) {
                set({ favoriteIds: data.map(f => f.product_id) });
            }
        } finally {
            set({ isLoading: false });
        }
    },
    toggleFavorite: async (productId: string) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) {
            return false;
        }
        
        const isFavorite = get().favoriteIds.includes(productId);
        
        if (isFavorite) {
            // Optimistic UI Removal
            set({ favoriteIds: get().favoriteIds.filter(id => id !== productId) });
            await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId);
        } else {
            // Optimistic UI Addition
            set({ favoriteIds: [...get().favoriteIds, productId] });
            await supabase
                .from('favorites')
                .insert({ user_id: user.id, product_id: productId });
        }
        return true;
    }
}));

