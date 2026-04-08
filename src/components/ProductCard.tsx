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
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative flex flex-col bg-white/5 dark:bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-2xl transition-all duration-300"
        >

            {/* Quick View Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(product);
                }}
                className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md p-2 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-[var(--color-main)] text-white hover:scale-110"
                title="Vista Rápida"
            >
                <Eye className="w-5 h-5" />
            </button>

            {/* Favorite Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFavoriteClick(e);
                }}
                className={`absolute top-14 right-4 z-20 bg-black/60 backdrop-blur-md p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110 ${isFavorite
                    ? "text-red-500 opacity-100"
                    : "text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-red-500"
                    }`}
                title="Añadir a Favoritos"
            >
                <Heart className={`w-5 h-5 transition-all ${isFavorite ? "fill-current scale-110" : ""}`} />
            </button>

            {/* Product Image Slider */}
            <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                {/* Product Tags overlay */}
                {(() => {
                    let sizeStock = 0;
                    if (!selectedSize) {
                        sizeStock = product.product_stock?.reduce((acc, curr) => acc + curr.stock_quantity, 0) ?? product.stock ?? 0;
                    } else {
                        const found = product.product_stock?.find(s => s.size === selectedSize);
                        sizeStock = found ? found.stock_quantity : (product.stock ?? 0);
                    }

                    if (sizeStock > 0 && sizeStock <= 3) {
                        return (
                            <div className="absolute top-4 left-4 z-20">
                                <span className="bg-red-900/80 backdrop-blur-sm text-red-200 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase border border-red-500/30">
                                    ¡ÚLTIMAS {sizeStock}!
                                </span>
                            </div>
                        );
                    } else if (product.isNew) {
                        return (
                            <div className="absolute top-4 left-4 z-20">
                                <span className="bg-[var(--color-main)]/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase border border-[var(--color-main)]">
                                    NUEVO
                                </span>
                            </div>
                        );
                    }
                    return null;
                })()}

                <Link href={`/producto/${product.id}`} className="block h-full w-full">
                    <div
                        className="flex transition-transform duration-500 ease-in-out h-full w-full group-hover:scale-105"
                        style={{ transform: `scale(1) translateX(-${currentImageIndex * 100}%)` }}
                    >
                        {product.images.map((img, idx) => (
                            <div key={idx} className="relative w-full h-full flex-shrink-0">
                                <Image
                                    src={img}
                                    alt={`${product.name} - Vista ${idx + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--color-main)] hover:scale-110 shadow-lg"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--color-main)] hover:scale-110 shadow-lg"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </>
                )}
            </div>

            {/* Product Info Bento Block */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4 gap-4">
                    <div>
                        <Link href={`/producto/${product.id}`} className="w-fit hover:opacity-80 transition-opacity">
                            <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)] mb-1 leading-tight">
                                {product.name.toUpperCase()}
                            </h3>
                        </Link>
                        <p className="text-gray-400 text-sm font-medium">{product.category}</p>
                    </div>
                    <span className="font-black text-xl text-[var(--color-main)] shrink-0">
                        ${product.price.toLocaleString("es-AR")}
                    </span>
                </div>

                {/* Size Selector */}
                <div className="flex gap-2 mb-6 mt-auto">
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
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all relative overflow-hidden ${selectedSize === size
                                    ? "bg-[var(--color-main)] text-white shadow-[0_4px_12px_rgba(0,168,122,0.4)] scale-105"
                                    : isOutOfStock
                                        ? "bg-white/5 border border-white/5 text-gray-600 opacity-50 cursor-not-allowed"
                                        : "bg-white/5 border border-white/10 text-gray-300 hover:bg-[var(--color-main)]/20 hover:border-[var(--color-main)]/50 active:scale-95"
                                    }`}
                            >
                                {size}
                                {isOutOfStock && (
                                    <svg className="absolute inset-0 w-full h-full text-white/5 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="4" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Actions Row */}
                <div className="flex gap-3 mt-auto">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        className={`flex-grow py-3 rounded-lg flex items-center justify-center transition-all font-extrabold text-sm tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${isAdded
                            ? "bg-green-500 text-white shadow-green-500/20"
                            : "bg-gradient-to-r from-[var(--color-main)] to-[#008f65] text-white hover:opacity-90 shadow-[var(--color-main)]/20"
                            }`}
                        disabled={!selectedSize && !isAdded}
                    >
                        <AnimatePresence mode="wait">
                            {isAdded ? (
                                <motion.div key="added" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                                    <Check className="w-4 h-4 shrink-0" />
                                    <span>¡AGREGADO!</span>
                                </motion.div>
                            ) : (
                                <motion.div key="add" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{selectedSize ? "AGREGAR AL CARRITO" : "SELECCIONA TALLA"}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    <button
                        onClick={handleWhatsAppOrder}
                        disabled={!selectedSize}
                        className="px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#006c49]/20 text-[#69f6b8] border border-[#006c49]/40 hover:bg-[#69f6b8] hover:text-[#00452d]"
                        title={selectedSize ? "Pedir por WhatsApp" : "Selecciona talla primero"}
                    >
                        <FaWhatsapp className="w-5 h-5 shrink-0" />
                    </button>
                </div>
            </div>
        </motion.article>
    );
}
