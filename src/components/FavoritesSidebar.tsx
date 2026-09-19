"use client";
import { FourSquare } from "react-loading-indicators";

import { useEffect, useState } from "react";
import { X, Heart, Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useFavoritesStore } from "@/features/catalog/store/favorites";
import { useAuthStore } from "@/features/auth/store/auth";
import { useCartStore } from "@/features/orders/store/cart";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function FavoritesSidebar() {
    const { isFavoritesOpen, setFavoritesOpen, favoriteIds, toggleFavorite } = useFavoritesStore();
    const { user, setModalOpen } = useAuthStore();
    const addItem = useCartStore((state) => state.addItem);

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isFavoritesOpen || !user) return;

        if (favoriteIds.length === 0) {
            setProducts([]);
            return;
        }

        const fetchFavoriteProducts = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, product_stock(size, stock_quantity)')
                    .in('id', favoriteIds);

                if (!error && data) {
                    setProducts(data as Product[]);
                }
            } catch (error) {
                console.error("Error fetching favorite products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavoriteProducts();
    }, [isFavoritesOpen, user, favoriteIds]);

    const handleRemove = async (productId: string) => {
        await toggleFavorite(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast.info("Eliminado de favoritos");
    };

    const handleAddToCart = (product: Product) => {
        const availableStock = product.product_stock?.find(s => s.stock_quantity > 0);
        const defaultSize = availableStock ? availableStock.size : "M";
        addItem(product, defaultSize);
    };
    return (
        <>
            {/* Backdrop Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 backdrop-blur-sm z-60 transition-all duration-300",
                    isFavoritesOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setFavoritesOpen(false)}
            />

            {/* Slide-over Sidebar Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Mis Favoritos"
                className={cn(
                    "fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-zinc-950 text-white z-70 shadow-2xl flex flex-col transition-transform duration-300 ease-out border-l border-white/10",
                    isFavoritesOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        <h2 className="text-lg font-extrabold uppercase tracking-wider text-white">
                            Mis Favoritos ({favoriteIds.length})
                        </h2>
                    </div>
                    <button
                        onClick={() => setFavoritesOpen(false)}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Cerrar favoritos"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {!user ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                            <Heart className="w-16 h-16 text-red-500/50 animate-pulse" />
                            <h3 className="text-xl font-bold uppercase">Guardá tus favoritos</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Iniciá sesión para sincronizar tus prendas preferidas y tenerlas siempre listas.
                            </p>
                            <button
                                onClick={() => {
                                    setFavoritesOpen(false);
                                    setModalOpen(true);
                                }}
                                className="w-full py-3.5 bg-(--color-main) text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <FourSquare color={["#667a1d", "#88a327", "#abcc31", "#bcd759"]} size="medium" text="" />
                            <p className="text-xs uppercase font-bold tracking-wider">Cargando favoritos...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                            <Heart className="w-16 h-16 text-gray-700" />
                            <h3 className="text-lg font-bold uppercase text-white">No tenés favoritos guardados</h3>
                            <p className="text-xs text-gray-400">
                                Explorá el catálogo y tocá el ícono de corazón en las prendas que más te gusten.
                            </p>
                            <button
                                onClick={() => setFavoritesOpen(false)}
                                className="px-6 py-3 border border-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
                            >
                                Explorar Tienda
                            </button>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="p-3 rounded-xl bg-white/3 border border-white/5 flex gap-3 items-center hover:border-white/20 transition-all group"
                                >
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-black shrink-0">
                                        <Image
                                            src={product.images?.[0] || product.image_url || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            sizes="80px"
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/product/${product.id}`}
                                            onClick={() => setFavoritesOpen(false)}
                                            className="font-bold text-sm text-white truncate block hover:text-(--color-main) transition-colors"
                                        >
                                            {product.name}
                                        </Link>
                                        <p className="text-xs text-(--color-main) font-extrabold mt-0.5">
                                            ${product.price.toLocaleString("es-AR")}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="px-3 py-1.5 rounded-lg bg-(--color-main) text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                                            >
                                                <ShoppingBag className="w-3 h-3" /> Agregar
                                            </button>
                                            <button
                                                onClick={() => handleRemove(product.id)}
                                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                                title="Quitar de favoritos"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer Action */}
                {user && products.length > 0 && (
                    <div className="p-4 border-t border-white/10 bg-black/40">
                        <button
                            onClick={() => setFavoritesOpen(false)}
                            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                        >
                            Seguir Comprando
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
