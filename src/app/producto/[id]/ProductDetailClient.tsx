"use client";

import { useState } from "react";
import { ShoppingCart, Truck, ShieldCheck, RefreshCcw, ArrowLeft } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useCartStore } from "@/store/cart";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    images: string[];
    isNew?: boolean;
}

export default function ProductDetailClient({
    product,
    relatedProducts,
}: {
    product: Product;
    relatedProducts: Product[];
}) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const addItem = useCartStore((state) => state.addItem);

    const sizes = ["S", "M", "L", "XL"];

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Por favor selecciona una talla");
            return;
        }
        addItem(product, selectedSize);
        // We could trigger a success toast here if imported from sileo
        alert(`¡Agregado al carrito: ${product.name} talla ${selectedSize}!`);
        window.dispatchEvent(new Event('cart-updated')); // Optional event if needed
    };

    const handleWhatsAppOrder = () => {
        if (!selectedSize) {
            alert("Por favor selecciona una talla para pedir por WhatsApp");
            return;
        }
        const mensaje = encodeURIComponent(
            `Hola PFSTUDIO! Vengo desde la web. Me interesa comprar: ${product.name} en talle ${selectedSize}. ¿Tienen stock?`
        );
        window.open(`https://wa.me/5493704245651?text=${mensaje}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">

                {/* Breadcrumbs returning to Home */}
                <div className="mb-6">
                    <Link
                        href="/#productos"
                        className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[var(--color-main)] transition-colors uppercase tracking-wider gap-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver a la Tienda
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Left: Images Desktop & Mobile */}
                    <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
                        {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
                        {product.images.length > 1 && (
                            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-24 flex-shrink-0">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative w-20 md:w-full aspect-[3/4] rounded border overflow-hidden transition-all ${currentImageIndex === idx
                                                ? "border-[var(--color-main)] shadow-md"
                                                : "border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Image */}
                        <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-zinc-900 rounded-xl overflow-hidden flex-1 group">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImageIndex}
                                    src={product.images[currentImageIndex]}
                                    alt={product.name}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            {product.isNew && (
                                <span className="absolute top-4 left-4 z-10 bg-[var(--color-main)] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded">
                                    Nuevo
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    {product.category}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] mb-4 leading-none">
                                {product.name}
                            </h1>

                            <p className="text-3xl font-light text-[var(--color-main)] mb-8">
                                ${product.price.toLocaleString("es-AR")}
                            </p>

                            <div className="mb-8 prose prose-gray dark:prose-invert">
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                    Prenda confeccionada con los mejores materiales. 100% Algodón Premium de alta densidad
                                    (Heavyweight). Diseñada para un uso diario asegurando máxima comodidad y un calce perfecto
                                    para cualquier ocasión.
                                </p>
                            </div>

                            {/* Size Selector */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Selecciona tu Talla
                                    </span>
                                    <button className="text-xs text-gray-500 underline hover:text-[var(--color-main)] transition-colors">
                                        Guía de Tallas
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`py-4 rounded border text-sm font-bold transition-all ${selectedSize === size
                                                    ? "border-[var(--color-main)] bg-[var(--color-main)] text-white shadow-lg transform -translate-y-1"
                                                    : "border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-200 hover:border-[var(--color-main)]"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-4 mb-10">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedSize}
                                    className="w-full py-5 bg-[var(--foreground)] text-[var(--background)] rounded font-bold flex items-center justify-center gap-3 hover:bg-[var(--color-main)] hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-main)]/30 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {selectedSize ? "Agregar a la Bolsa" : "Selecciona Talla"}
                                </button>

                                <button
                                    onClick={handleWhatsAppOrder}
                                    disabled={!selectedSize}
                                    className="w-full py-4 border-2 border-green-600 text-green-600 rounded font-bold flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-600/30 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                >
                                    <FaWhatsapp className="w-5 h-5" />
                                    {selectedSize ? "Comprar por WhatsApp (Directo)" : "Selecciona Talla"}
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-gray-100 dark:border-zinc-800">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <Truck className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
                                        Envíos a todo el País
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
                                        Compra Segura
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <RefreshCcw className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
                                        Cambios y Devoluciones
                                    </span>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-32 border-t border-gray-100 dark:border-zinc-800 pt-16"
                    >
                        <h3 className="text-2xl font-bold tracking-tight text-center mb-12 uppercase text-[var(--foreground)]">
                            Completa tu estilo
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {relatedProducts.map((rp) => (
                                <ProductCard
                                    key={rp.id}
                                    product={rp}
                                    onQuickView={() => {
                                        // Simple reload to new product
                                        window.location.href = `/producto/${rp.id}`;
                                    }}
                                    onAddToCart={(p, size) => {
                                        addItem(p, size);
                                        alert(`Agregado: ${p.name} talle ${size}`);
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
