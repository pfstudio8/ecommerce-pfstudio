import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from "sonner";
import { Product } from "@/types/product";

export interface CartItem {
    product: Product;
    size: string;
    quantity: number;
    availableStock?: number;
    isOutOfStock?: boolean;
    warning?: string;
}

export interface CartStore {
    items: CartItem[];
    isCartOpen: boolean;
    isValidating: boolean;
    validationWarnings: string[];
    setCartOpen: (isOpen: boolean) => void;
    clearWarnings: () => void;
    addItem: (product: Product, size: string) => void;
    removeItem: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    updateSize: (productId: string, oldSize: string, newSize: string) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    validateWithServer: () => Promise<{ success: boolean; warnings: string[]; hasAdjustments: boolean }>;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isCartOpen: false,
            isValidating: false,
            validationWarnings: [],

            setCartOpen: (isOpen) => {
                set({ isCartOpen: isOpen });
                if (isOpen && get().items.length > 0) {
                    get().validateWithServer();
                }
            },

            clearWarnings: () => set({ validationWarnings: [] }),

            addItem: (product, size) => {
                set((state) => {
                    const maxStock = (() => {
                        if (product.product_stock && product.product_stock.length > 0) {
                            const found = product.product_stock.find(s => s.size === size);
                            return found ? found.stock_quantity : 0;
                        }
                        return product.stock ?? 1;
                    })();

                    const existingItemIndex = state.items.findIndex(
                        (item) => item.product.id === product.id && item.size === size
                    );

                    if (existingItemIndex >= 0) {
                        const newItems = [...state.items];
                        const newQty = newItems[existingItemIndex].quantity + 1;
                        if (newQty > maxStock) {
                            toast.error(`Solo hay ${maxStock} unidades disponibles en talla ${size}.`);
                            return { items: state.items };
                        }
                        const displayName = product.name.replace("Sublimación - ", "Personalizado: ").replace(" (1 Cara)", "").replace(" (2 Caras)", "");
                        newItems[existingItemIndex].quantity = newQty;
                        toast.success(`¡Sumaste otro ${displayName}${size && size !== 'Único' && size !== 'Standard' && !displayName.includes(size) ? ' (' + size + ')' : ''} al carrito!`);
                        return { items: newItems };
                    } else {
                        if (maxStock < 1) {
                            toast.error(`No hay stock disponible para talla ${size}.`);
                            return { items: state.items };
                        }
                        const displayName = product.name.replace("Sublimación - ", "Personalizado: ").replace(" (1 Cara)", "").replace(" (2 Caras)", "");
                        toast.success(`¡Agregaste ${displayName}${size && size !== 'Único' && size !== 'Standard' && !displayName.includes(size) ? ' (' + size + ')' : ''} al carrito!`);
                        return { items: [...state.items, { product, size, quantity: 1, availableStock: maxStock }] };
                    }
                });
            },

            removeItem: (productId, size) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => !(item.product.id === productId && item.size === size)
                    )
                }));
            },

            updateSize: (productId, oldSize, newSize) => {
                if (oldSize === newSize) return;
                set((state) => {
                    const itemToUpdateIndex = state.items.findIndex(
                        (item) => item.product.id === productId && item.size === oldSize
                    );
                    if (itemToUpdateIndex === -1) return { items: state.items };

                    const existingItemIndex = state.items.findIndex(
                        (item) => item.product.id === productId && item.size === newSize
                    );

                    const itemToUpdate = state.items[itemToUpdateIndex];
                    const maxStock = (() => {
                        const product = itemToUpdate.product;
                        if (product.product_stock && product.product_stock.length > 0) {
                            const found = product.product_stock.find(s => s.size === newSize);
                            return found ? found.stock_quantity : 0;
                        }
                        return product.stock ?? 1;
                    })();

                    if (existingItemIndex >= 0 && existingItemIndex !== itemToUpdateIndex) {
                        const newQuantity = state.items[existingItemIndex].quantity + itemToUpdate.quantity;
                        if (newQuantity > maxStock) {
                            toast.error(`Solo hay ${maxStock} unidades disponibles en la nueva variante.`);
                            return { items: state.items };
                        }
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity = newQuantity;
                        newItems[existingItemIndex].availableStock = maxStock;
                        newItems.splice(itemToUpdateIndex, 1);
                        return { items: newItems };
                    } else {
                        if (itemToUpdate.quantity > maxStock) {
                            toast.error(`Solo hay ${maxStock} unidades disponibles en la nueva variante.`);
                            return { items: state.items };
                        }
                        const newItems = [...state.items];
                        newItems[itemToUpdateIndex].size = newSize;
                        newItems[itemToUpdateIndex].availableStock = maxStock;
                        return { items: newItems };
                    }
                });
            },

            updateQuantity: (productId, size, quantity) => {
                if (quantity < 1) return;
                set((state) => {
                    const itemToUpdate = state.items.find((item) => item.product.id === productId && item.size === size);
                    if (!itemToUpdate) return { items: state.items };

                    const maxStock = (() => {
                        if (itemToUpdate.availableStock !== undefined) return itemToUpdate.availableStock;
                        const product = itemToUpdate.product;
                        if (product.product_stock && product.product_stock.length > 0) {
                            const found = product.product_stock.find(s => s.size === size);
                            return found ? found.stock_quantity : 0;
                        }
                        return product.stock ?? 1;
                    })();

                    if (quantity > maxStock) {
                        toast.error(`Solo hay ${maxStock} unidades disponibles en talla ${size}.`);
                        return { items: state.items };
                    }

                    return {
                        items: state.items.map((item) =>
                            item.product.id === productId && item.size === size
                                ? { ...item, quantity }
                                : item
                        )
                    };
                });
            },

            clearCart: () => set({ items: [], validationWarnings: [] }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    if (item.isOutOfStock) return total;
                    return total + (item.product.price * item.quantity);
                }, 0);
            },

            validateWithServer: async () => {
                const currentItems = get().items;
                if (currentItems.length === 0) {
                    return { success: true, warnings: [], hasAdjustments: false };
                }

                set({ isValidating: true });
                try {
                    const res = await fetch('/api/cart/validate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            items: currentItems.map(i => ({
                                productId: i.product.id,
                                size: i.size,
                                quantity: i.quantity,
                                price: i.product.price
                            }))
                        })
                    });

                    if (!res.ok) {
                        throw new Error("No se pudo validar el carrito con el servidor");
                    }

                    const data = await res.json();
                    const validatedItems: CartItem[] = (data.items || []).map((vItem: any) => ({
                        product: vItem.product,
                        size: vItem.size,
                        quantity: vItem.quantity,
                        availableStock: vItem.availableStock,
                        isOutOfStock: vItem.isOutOfStock,
                        warning: vItem.warning
                    }));

                    set({
                        items: validatedItems,
                        validationWarnings: data.warnings || [],
                        isValidating: false
                    });

                    return {
                        success: true,
                        warnings: data.warnings || [],
                        hasAdjustments: data.hasAdjustments || false
                    };
                } catch (err: any) {
                    console.warn("Error validando carrito con el servidor:", err);
                    set({ isValidating: false });
                    return { success: false, warnings: [], hasAdjustments: false };
                }
            }
        }),
        {
            name: 'pfstudio-cart', // key in localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);
