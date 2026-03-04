"use client";

import { useState } from "react";
import { Eye, ShoppingCart } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    images: string[];
    isNew?: boolean;
}

interface ProductCardProps {
    product: Product;
    onQuickView: (product: Product) => void;
    onAddToCart: (product: Product, size: string) => void;
}

export default function ProductCard({ product, onQuickView, onAddToCart }: ProductCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const sizes = ["S", "M", "L", "XL"];

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
        onAddToCart(product, selectedSize);
        setSelectedSize(null);
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
                onClick={() => onQuickView(product)}
                className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-black/90 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[var(--color-main)] hover:text-white dark:hover:text-white text-gray-700 dark:text-gray-300"
                title="Vista Rápida"
            >
                <Eye className="w-5 h-5" />
            </button>

            {/* Product Image Slider */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-zinc-800">
                {product.isNew && (
                    <span className="absolute top-4 left-4 z-10 bg-[var(--color-main)] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded">
                        Nuevo
                    </span>
                )}

                {/* Images are mapped with a wrapper div to sustain the slider layout and Next.js fill prop */}
                <Link href={`/producto/${product.id}`} className="block h-full w-full">
                    <div
                        className="flex transition-transform duration-500 ease-in-out h-full w-full"
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
                <p className="text-lg text-[var(--color-main)] font-semibold mb-4">
                    ${product.price.toLocaleString("es-AR")}
                </p>

                {/* Size Selector */}
                <div className="flex gap-2 mb-4 mt-auto">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-10 h-10 rounded border flex items-center justify-center text-sm font-medium transition-colors ${selectedSize === size
                                ? "border-[var(--color-main)] bg-[var(--color-main)] text-white"
                                : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-[var(--color-main)]"
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] rounded font-semibold flex items-center justify-center gap-2 hover:bg-[var(--color-main)] hover:text-white transition-all transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--color-main)]/20 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    disabled={!selectedSize}
                >
                    <ShoppingCart className="w-4 h-4" />
                    {selectedSize ? "Agregar a la Bolsa" : "Selecciona Talla"}
                </button>

                {/* WhatsApp Order Button */}
                <button
                    onClick={handleWhatsAppOrder}
                    className="w-full py-3 mt-3 border border-green-600 text-green-600 rounded font-semibold flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-colors uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedSize}
                >
                    <FaWhatsapp className="w-5 h-5" />
                    {selectedSize ? "Pedir por WhatsApp" : "Selecciona Talla"}
                </button>
            </div>
        </motion.article>
    );
}
