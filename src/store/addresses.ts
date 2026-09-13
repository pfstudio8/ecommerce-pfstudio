import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './auth';

export interface Address {
    id: string;
    user_id: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    is_default: boolean;
    created_at: string;
}

export interface AddressStore {
    addresses: Address[];
    isLoading: boolean;
    fetchAddresses: () => Promise<void>;
    addAddress: (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'is_default'>) => Promise<boolean>;
    deleteAddress: (id: string) => Promise<boolean>;
    setDefaultAddress: (id: string) => Promise<boolean>;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
    addresses: [],
    isLoading: false,
    fetchAddresses: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return;
        
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });
            
            if (!error && data) {
                set({ addresses: data as Address[] });
            }
        } finally {
            set({ isLoading: false });
        }
    },
    addAddress: async (addressData) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return false;

        const isFirst = get().addresses.length === 0;

        const { error } = await supabase
            .from('addresses')
            .insert({
                user_id: user.id,
                street: addressData.street,
                city: addressData.city,
                state: addressData.state,
                zip_code: addressData.zip_code,
                is_default: isFirst // If it's the first one, make it default automatically
            });

        if (!error) {
            await get().fetchAddresses();
            return true;
        }
        return false;
    },
    deleteAddress: async (id) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return false;

        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (!error) {
            await get().fetchAddresses();
            return true;
        }
        return false;
    },
    setDefaultAddress: async (id) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return false;

        // Transaction-like behavior via Supabase RLS is tricky without an RPC,
        // so we do it in two steps: remove default from all, then set default for the target
        
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id);
            
        const { error } = await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', id)
            .eq('user_id', user.id);

        if (!error) {
            await get().fetchAddresses();
            return true;
        }
        return false;
    }
}));
