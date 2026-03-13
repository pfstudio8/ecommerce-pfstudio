"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import ProductCard, { Product } from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import { useCartStore } from "@/store/cart";
import { sileo } from "sileo";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFavoritesStore } from "@/store/favorites";

export default function FavoritosPage() {
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const user = useAuthStore((state) => state.user);
    const setModalOpen = useAuthStore((state) => state.setModalOpen);
    const addItem = useCartStore((state) => state.addItem);
    const favoriteIds = useFavoritesStore(state => state.favoriteIds);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (!isInitialized) return;

        const fetchFavoriteProducts = async () => {
            if (!user?.email) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch the products related to the favorites
                const { data, error } = await supabase
                    .from('favorites')
                    .select('products(*, product_stock(size, stock_quantity))')
                    .eq('user_email', user.email);

                if (error) throw error;

                if (data) {
                    const fetchedProducts = data.map((fav: any) => fav.products).filter(p => p !== null) as Product[];
                    setProducts(fetchedProducts);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavoriteProducts();
    }, [isInitialized, user]);

    // Update local products list if favoriteIds changes globally (e.g., removing a favorite)
    useEffect(() => {
        if (!isLoading) {
            setProducts(prev => prev.filter(p => favoriteIds.includes(p.id)));
        }
    }, [favoriteIds, isLoading]);

    const handleQuickView = (product: Product) => {
        setQuickViewProduct(product);
    };

    const handleAddToCart = (product: Product, size: string) => {
        addItem(product, size);
        sileo.success({ title: `¡Agregado al carrito: ${product.name}!` });
    };

    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-[var(--color-main)] mb-4" />
                <p className="text-gray-500 font-medium tracking-wide">Cargando tus favoritos...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-full mb-6">
                    <Heart className="w-16 h-16 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4 tracking-tight">Tus Favoritos</h1>
                <p className="text-gray-500 max-w-md mb-8">
                    Inicia sesión para guardar tus prendas favoritas y tenerlas siempre a mano.
                </p>
                <button
                    onClick={() => setModalOpen(true)}
                    className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded font-bold uppercase tracking-widest hover:bg-[var(--color-main)] hover:text-white transition-colors"
                >
                    Iniciar Sesión
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-16 bg-[var(--background)]">
            <div className="container mx-auto px-6 md:px-4">
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Heart className="w-8 h-8 text-red-500 fill-current" />
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">Mis Favoritos</h1>
                    </div>
                    <div className="w-16 h-1 bg-[var(--color-main)] mb-2"></div>
                    <p className="text-gray-500 text-sm sm:text-base">Los productos que te enamoraron, listos para tu carrito.</p>
                </motion.div>

                {products.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <Heart className="w-20 h-20 text-gray-200 dark:text-gray-800 mb-6" />
                        <h2 className="text-2xl font-bold mb-3 text-[var(--foreground)]">Aún no tienes favoritos</h2>
                        <p className="text-gray-500 mb-8 max-w-sm">Explora nuestra tienda y presiona el corazón en las prendas que más te gusten.</p>
                        <Link 
                            href="/#productos"
                            className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wider rounded hover:bg-[var(--color-main)] hover:text-white transition-colors"
                        >
                            Ver Productos
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12 max-w-[1400px] mx-auto"
                    >
                        <AnimatePresence>
                            {products.map(product => (
                                <motion.div 
                                    key={product.id} 
                                    layout
                                    variants={{
                                        hidden: { opacity: 0, y: 30 },
                                        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                                    }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                >
                                    <ProductCard
                                        product={product}
                                        onQuickView={handleQuickView}
                                        onAddToCart={handleAddToCart}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                <QuickViewModal
                    isOpen={!!quickViewProduct}
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onAddToCart={handleAddToCart}
                    allProducts={products}
                />
            </div>
        </main>
    );
}
