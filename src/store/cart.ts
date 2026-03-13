import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/components/ProductCard';

export interface CartItem {
    product: Product;
    size: string;
    quantity: number;
}

export interface CartStore {
    items: CartItem[];
    addItem: (product: Product, size: string) => void;
    removeItem: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    isCartOpen: boolean;
    setCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isCartOpen: false,

            setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

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
                        // Update quantity if item exists and within limit
                        const newItems = [...state.items];
                        const newQty = newItems[existingItemIndex].quantity + 1;
                        if (newQty > maxStock) {
                            alert(`Solo hay ${maxStock} unidades disponibles en talla ${size}.`);
                            return { items: state.items };
                        }
                        newItems[existingItemIndex].quantity = newQty;
                        return { items: newItems };
                    } else {
                        // Add new item if within limit
                        if (maxStock < 1) {
                            alert(`No hay stock disponible para talla ${size}.`);
                            return { items: state.items };
                        }
                        return { items: [...state.items, { product, size, quantity: 1 }] };
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

            updateQuantity: (productId, size, quantity) => {
                if (quantity < 1) return;
                set((state) => {
                    const itemToUpdate = state.items.find((item) => item.product.id === productId && item.size === size);
                    if (!itemToUpdate) return { items: state.items };

                    const maxStock = (() => {
                        const product = itemToUpdate.product;
                        if (product.product_stock && product.product_stock.length > 0) {
                            const found = product.product_stock.find(s => s.size === size);
                            return found ? found.stock_quantity : 0;
                        }
                        return product.stock ?? 1;
                    })();

                    if (quantity > maxStock) {
                        alert(`Solo hay ${maxStock} unidades disponibles en talla ${size}.`);
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

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
            }
        }),
        {
            name: 'pfstudio-cart', // key in localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);
