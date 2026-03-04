"use client";

import { X, ShoppingCart } from "lucide-react";
import { Product } from "./ProductCard";
import { useState } from "react";
import Image from "next/image";

interface QuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, size: string) => void;
    allProducts?: Product[];
    onSelectRelated?: (product: Product) => void;
}

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart, allProducts, onSelectRelated }: QuickViewModalProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Derived related products
    const relatedProducts = allProducts && product
        ? allProducts
            .filter((p) => p.id !== product.id && p.category === product.category)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
        : [];

    if (!isOpen || !product) return null;

    const sizes = ["S", "M", "L", "XL"];

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Por favor selecciona una talla");
            return;
        }
        onAddToCart(product, selectedSize);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity duration-300"
                onClick={onClose}
            >
                {/* Modal Container */}
                <div
                    className="bg-[var(--background)] w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative animate-slideInRight"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 p-2 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-[var(--foreground)]" />
                    </button>

                    {/* Image Slider */}
                    <div className="w-full md:w-1/2 h-64 md:h-auto min-h-[400px] relative bg-gray-100 dark:bg-zinc-800">
                        <div
                            className="flex transition-transform duration-500 ease-in-out h-full"
                            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                        >
                            {product?.images.map((img, index) => (
                                <div key={index} className="relative w-full h-full flex-shrink-0 snap-center">
                                    <Image
                                        src={img}
                                        alt={`${product.name} vista ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Slider Controls */}
                        {product.images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {product.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all ${currentImageIndex === idx ? "bg-[var(--foreground)] w-6" : "bg-black/30 dark:bg-white/30"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
                        <div className="mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                {product.category}
                            </span>
                        </div>

                        <h2 className="text-4xl font-black tracking-tight text-[var(--foreground)] mb-4 leading-none">
                            {product.name}
                        </h2>

                        <p className="text-3xl font-light text-[var(--color-main)] mb-8">
                            ${product.price.toLocaleString("es-AR")}
                        </p>

                        <div className="mb-8">
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Prenda confeccionada con los mejores materiales. 100% Algodón Premium de alta densidad. Diseñada para un uso diario asegurando máxima comodidad y un calce perfecto.
                            </p>
                        </div>

                        {/* Size Selector */}
                        <div className="mb-8 mt-auto">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">Talla</span>
                                <span className="text-xs text-gray-500 underline cursor-pointer">Guía de tallas</span>
                            </div>
                            <div className="flex gap-3">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`flex-1 py-3 rounded border text-sm font-bold transition-all ${selectedSize === size
                                            ? "border-[var(--color-main)] bg-[var(--color-main)] text-white shadow-md transform -translate-y-0.5"
                                            : "border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-gray-200 hover:border-[var(--color-main)]"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded font-bold flex items-center justify-center gap-3 hover:bg-[var(--color-main)] hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-main)]/30 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            disabled={!selectedSize}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {selectedSize ? "Agregar a la Bolsa" : "Selecciona Talla"}
                        </button>

                        {/* Cross Selling */}
                        {relatedProducts.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-[var(--foreground)]">Completa el look</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {relatedProducts.map(rp => (
                                        <div
                                            key={rp.id}
                                            onClick={() => onSelectRelated && onSelectRelated(rp)}
                                            className="group cursor-pointer flex flex-col items-center bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-2 rounded-lg hover:border-[var(--color-main)] transition-colors"
                                        >
                                            <div className="relative w-full aspect-[3/4] overflow-hidden bg-white dark:bg-zinc-800 rounded mb-2">
                                                <Image src={rp.images[0]} alt={rp.name} fill sizes="150px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <span className="text-xs font-semibold truncate w-full text-center text-[var(--foreground)] mb-1">{rp.name}</span>
                                            <span className="text-xs font-bold text-[var(--color-main)]">${rp.price.toLocaleString("es-AR")}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
