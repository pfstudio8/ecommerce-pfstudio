"use client";

import { useState } from "react";
import { Eye, ShoppingCart, Check, Heart, Star } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useFavoritesStore } from "@/store/favorites";
import { useAuthStore } from "@/store/auth";
import { sileo } from "sileo";

export interface ProductStock {
    size: string;
    stock_quantity: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    images: string[];
    isNew?: boolean;
    department?: string;
    product_stock?: ProductStock[];
    stock?: number;
    reviews?: { rating: number }[];
}

interface ProductCardProps {
    product: Product;
    onQuickView: (product: Product) => void;
    onAddToCart: (product: Product, size: string) => void;
}

export default function ProductCard({ product, onQuickView, onAddToCart }: ProductCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isAdded, setIsAdded] = useState(false);

    const sizes = ["S", "M", "L", "XL"];

    const isFavorite = useFavoritesStore(state => state.favoriteIds.includes(product.id));
    const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
    const setAuthModalOpen = useAuthStore(state => state.setModalOpen);
    const user = useAuthStore(state => state.user);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!user) {
            sileo.info({ title: "Debes iniciar sesión para agregar a favoritos" });
            setAuthModalOpen(true);
            return;
        }
        
        await toggleFavorite(product.id);
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Por favor selecciona una talla");
            return;
        }
        setIsAdded(true);
        onAddToCart(product, selectedSize);
        setTimeout(() => {
            setIsAdded(false);
            setSelectedSize(null);
        }, 500);
    };

    const handleWhatsAppOrder = () => {
        if (!selectedSize) {
            alert("Por favor selecciona una talla para pedir por WhatsApp");
            return;
        }
        const mensaje = encodeURIComponent(`Hola PFSTUDIO! Me interesa el producto: ${product.name} en talle ${selectedSize}`);
        window.open(`https://wa.me/5493704245651?text=${mensaje}`, '_blank');
    };

    return (
        <motion.article
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group flex flex-col bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg overflow-hidden relative shadow-sm hover:shadow-xl"
        >

            {/* Quick View Button (Premium Feature) */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(product);
                }}
                className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-black/90 p-2 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-[var(--color-main)] hover:text-white dark:hover:text-white text-gray-700 dark:text-gray-300"
                title="Vista Rápida"
            >
                <Eye className="w-5 h-5" />
            </button>

            {/* Favorite (Wishlist) Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFavoriteClick();
                }}
                className={`absolute top-4 left-4 z-20 bg-white/90 dark:bg-black/90 p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110 ${
                    isFavorite 
                        ? "text-red-500 opacity-100" 
                        : "text-gray-400 dark:text-gray-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-red-500"
                }`}
                title="Añadir a Favoritos"
            >
                <Heart className={`w-5 h-5 transition-all ${isFavorite ? "fill-current scale-110" : ""}`} />
            </button>

            {/* Product Image Slider */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-zinc-800">
                {product.isNew && (
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-[var(--color-main)] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded">
                        Nuevo
                    </span>
                )}

                {/* Images are mapped with a wrapper div to sustain the slider layout and Next.js fill prop */}
                <Link href={`/producto/${product.id}`} className="block h-full w-full">
                    <div
                        className="flex transition-transform duration-200 ease-in-out h-full w-full"
                        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                    >
                        {product.images.map((img, idx) => (
                            <div key={idx} className="relative w-full h-full flex-shrink-0">
                                <Image
                                    src={img}
                                    alt={`${product.name} - Vista ${idx + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </Link>

                {product.images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/90 hover:scale-110 shadow-lg"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/90 hover:scale-110 shadow-lg"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </>
                )}
            </div>

            {/* Product Info */}
            <div className="p-5 flex flex-col flex-grow">
                <Link href={`/producto/${product.id}`} className="w-fit hover:opacity-80 transition-opacity">
                    <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)] mb-1">
                        {product.name}
                    </h3>
                </Link>
                
                {/* Reviews Summary */}
                {product.reviews && product.reviews.length > 0 && (
                    <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {(product.reviews.reduce((acc, curr) => acc + curr.rating, 0) / product.reviews.length).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                            ({product.reviews.length})
                        </span>
                    </div>
                )}
                
                <p className="text-lg text-[var(--color-main)] font-semibold mb-4 mt-1">
                    ${product.price.toLocaleString("es-AR")}
                </p>

                {/* Size Selector */}
                <div className="flex gap-2 mb-4 mt-auto">
                    {sizes.map((size) => {
                        let sizeStock = 0;
                        if (product.product_stock && product.product_stock.length > 0) {
                            const found = product.product_stock.find(s => s.size === size);
                            sizeStock = found ? found.stock_quantity : 0;
                        } else {
                            sizeStock = product.stock ?? 1;
                        }
                        
                        const isOutOfStock = sizeStock <= 0;

                        return (
                            <button
                                key={size}
                                type="button"
                                disabled={isOutOfStock}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!isOutOfStock) setSelectedSize(size);
                                }}
                                title={isOutOfStock ? "Agotado" : "Disponible"}
                                className={`w-10 h-10 rounded border flex items-center justify-center text-sm font-medium transition-colors relative overflow-hidden ${selectedSize === size
                                    ? "border-[var(--color-main)] bg-[var(--color-main)] text-white"
                                    : isOutOfStock
                                        ? "border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-gray-600 bg-transparent opacity-60"
                                        : "border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-[var(--color-main)] active:bg-gray-100 dark:active:bg-zinc-800"
                                    }`}
                            >
                                {size}
                                {isOutOfStock && (
                                    <svg className="absolute inset-0 w-full h-full text-gray-300 dark:text-gray-600/50 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="4" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Low Stock Warning */}
                <AnimatePresence>
                    {(() => {
                        let sizeStock = 0;
                        if (!selectedSize) {
                            sizeStock = product.product_stock?.reduce((acc, curr) => acc + curr.stock_quantity, 0) ?? product.stock ?? 0;
                        } else {
                            const found = product.product_stock?.find(s => s.size === selectedSize);
                            sizeStock = found ? found.stock_quantity : (product.stock ?? 0);
                        }
                        
                        // Show warning if stock is between 1 and 3 (inclusive)
                        if (sizeStock > 0 && sizeStock <= 3) {
                            return (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md border border-red-100 dark:border-red-900/50"
                                >
                                    <motion.span 
                                        animate={{ scale: [1, 1.2, 1] }} 
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="text-lg"
                                    >
                                        🔥
                                    </motion.span>
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        ¡Últimas {sizeStock} unidades!
                                    </span>
                                </motion.div>
                            );
                        }
                        return null;
                    })()}
                </AnimatePresence>

                <div className="flex flex-col gap-2.5 mt-4">
                    {/* Add to Cart Button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        className={`w-full py-2.5 sm:py-3 rounded font-semibold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 hover:shadow-lg uppercase tracking-wider text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${
                            isAdded 
                            ? "bg-green-500 text-white hover:bg-green-600 hover:shadow-green-500/20" 
                            : "bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--color-main)] hover:text-white hover:shadow-[var(--color-main)]/20"
                        }`}
                        disabled={!selectedSize && !isAdded}
                    >
                        <AnimatePresence mode="wait">
                            {isAdded ? (
                                <motion.div key="added" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                                    <Check className="w-4 h-4 shrink-0" />
                                    <span>¡Agregado!</span>
                                </motion.div>
                            ) : (
                                <motion.div key="add" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{selectedSize ? "Agregar Producto" : "Selecciona Talla"}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* WhatsApp Order Button */}
                    <button
                        onClick={handleWhatsAppOrder}
                        className="w-full py-2.5 sm:py-3 border-2 border-green-600 text-green-600 rounded font-semibold flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-all uppercase tracking-wider text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-green-600"
                        disabled={!selectedSize}
                    >
                        <FaWhatsapp className="w-5 h-5 shrink-0" />
                        <span className="truncate">{selectedSize ? "Pedir por Whatsapp" : "Selecciona Talla"}</span>
                    </button>
                </div>
            </div>
        </motion.article>
    );
}
