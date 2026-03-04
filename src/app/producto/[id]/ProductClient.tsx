"use client";

import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { Product } from "@/components/ProductCard";
import { useState } from "react";
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

interface ProductClientProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
    const addToCart = useCartStore((state) => state.addItem);
    const setCartOpen = useCartStore((state) => state.setCartOpen);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const sizes = ["S", "M", "L", "XL", "XXL"]; // Extended sizes for the product page

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Por favor selecciona una talla");
            return;
        }
        addToCart(product, selectedSize);
        setCartOpen(true);
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
        <div className="min-h-screen bg-[var(--background)] pt-32 pb-24 font-sans text-[var(--foreground)] animate-in fade-in duration-500">
            <div className="container mx-auto px-4 max-w-7xl">

                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--foreground)] mb-8 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a la tienda
                </Link>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Left Column: Image Gallery */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div className="relative aspect-[3/4] w-full bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800">
                            {product.isNew && (
                                <span className="absolute top-6 left-6 z-10 bg-[var(--color-main)] text-white text-sm font-bold px-4 py-1.5 uppercase tracking-widest rounded-md shadow-lg">
                                    Nuevo
                                </span>
                            )}
                            <Image
                                src={product.images[currentImageIndex]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                                className="object-cover"
                            />
                        </div>

                        {/* Thumbnail Grid */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-[var(--color-main)] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <Image src={img} alt={`${product.name} thumb`} fill sizes="10vw" className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Product Details */}
                    <div className="w-full lg:w-1/2 flex flex-col">

                        <div className="mb-4">
                            <span className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
                                {product.category}
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <p className="text-3xl sm:text-4xl font-light text-[var(--color-main)] mb-8">
                            ${product.price.toLocaleString("es-AR")}
                        </p>

                        <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 mb-10 text-base leading-relaxed">
                            <p>
                                Prenda confeccionada con los mejores materiales. 100% Algodón Premium de alta densidad
                                (Heavyweight Cotton). Diseñada para un uso diario asegurando máxima comodidad, caída
                                estructurada y un calce perfecto duradero. Estampados de alta resistencia al lavado.
                            </p>
                        </div>

                        {/* Size Selector */}
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-semibold uppercase tracking-widest text-[var(--foreground)]">Selecciona tu talla</span>
                                <span className="text-sm text-gray-500 underline cursor-pointer hover:text-[var(--foreground)] transition-colors">Guía de tallas</span>
                            </div>
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`flex-1 min-w-[3.5rem] py-3.5 sm:py-4 rounded-xl border-2 text-sm sm:text-base font-bold transition-all ${selectedSize === size
                                            ? "border-[var(--color-main)] bg-[var(--color-main)] text-white shadow-lg shadow-[var(--color-main)]/20 transform -translate-y-1"
                                            : "border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-600"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4 mb-10 border-b border-gray-100 dark:border-zinc-800 pb-10">
                            <button
                                onClick={handleAddToCart}
                                disabled={!selectedSize}
                                className="w-full py-5 sm:py-6 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[var(--color-main)] hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-main)]/30 uppercase tracking-[0.15em] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                                {selectedSize ? "Agregar a la Bolsa" : "Selecciona Talla"}
                            </button>

                            <button
                                onClick={handleWhatsAppOrder}
                                disabled={!selectedSize}
                                className="w-full py-4 border-2 border-[#25D366] text-[#25D366] bg-[#25D366]/5 dark:bg-[#25D366]/10 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#25D366] hover:text-white transition-all uppercase tracking-[0.1em] text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent"
                            >
                                <FaWhatsapp className="w-5 h-5" />
                                Consultar stock o pedir por WhatsApp
                            </button>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-gray-400" /> Compra 100% segura y protegida</li>
                            <li className="flex items-center gap-3"><Truck className="w-5 h-5 text-gray-400" /> Envíos locales rápidos coordinados</li>
                            <li className="flex items-center gap-3"><RotateCcw className="w-5 h-5 text-gray-400" /> Cambios fáciles dentro de los 15 días</li>
                        </ul>

                    </div>
                </div>

                {/* Cross Selling Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 pt-16 border-t border-gray-100 dark:border-zinc-800">
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-10 text-[var(--foreground)] text-center">Completa el look</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            {relatedProducts.map(rp => (
                                <Link
                                    href={`/producto/${rp.id}`}
                                    key={rp.id}
                                    className="group flex flex-col bg-transparent hover:bg-gray-50 dark:hover:bg-zinc-900/50 p-3 sm:p-4 rounded-2xl transition-all"
                                >
                                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-zinc-800 rounded-xl mb-4 border border-gray-100 dark:border-zinc-800">
                                        <Image src={rp.images[0]} alt={rp.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                    </div>
                                    <h4 className="font-bold text-sm sm:text-base text-[var(--foreground)] mb-1 group-hover:text-[var(--color-main)] transition-colors">{rp.name}</h4>
                                    <span className="text-sm font-semibold text-gray-500">${rp.price.toLocaleString("es-AR")}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
