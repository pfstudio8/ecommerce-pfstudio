"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/features/orders/store/cart";
import { useFavoritesStore } from "@/features/catalog/store/favorites";
import { useProductDrawerStore } from "@/features/catalog/store/productDrawer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Heart, Plus, Sparkles, ExternalLink } from "lucide-react";
import { Product } from "@/types/product";

interface CatalogProductCardProps {
    product: Product;
    index?: number;
}

export default function CatalogProductCard({ product, index = 0 }: CatalogProductCardProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const addItem = useCartStore((state) => state.addItem);
    const openDrawer = useProductDrawerStore((state) => state.openDrawer);
    const { toggleFavorite, favoriteIds } = useFavoritesStore();
    const isFav = favoriteIds.includes(product.id);

    // Dynamic variants directly from database
    const productVariants = product.product_stock && product.product_stock.length > 0
        ? product.product_stock
        : ((product.stock ?? 0) > 0 ? [{ size: "Único", stock_quantity: product.stock ?? 0 }] : []);

    const availableVariants = productVariants.filter(v => (v.stock_quantity ?? 0) > 0);
    const isOutOfStock = productVariants.length === 0 || availableVariants.length === 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedSize && availableVariants.length > 1) {
            // Si tiene varias tallas y no eligió una, abrimos el drawer para personalizarlo
            openDrawer(product);
            return;
        }

        const sizeToAdd = selectedSize || (availableVariants.length > 0 ? availableVariants[0].size : "Único");
        addItem(product, sizeToAdd);
        setSelectedSize(null);
    };

    const handleOpenDrawer = (e: React.MouseEvent) => {
        e.preventDefault();
        openDrawer(product);
    };

    // Calculate total stock for badge
    const totalStock = product.product_stock?.reduce((acc, curr) => acc + curr.stock_quantity, 0) ?? product.stock ?? 0;

    // Determine the product tag
    let tag = null;
    if (isOutOfStock) {
        tag = (
            <span className="px-2.5 py-1 rounded-full text-[10px] bg-error text-on-error font-bold uppercase tracking-wider shadow-sm">
                Agotado
            </span>
        );
    } else if (totalStock > 0 && totalStock <= 3) {
        tag = (
            <span className="px-2.5 py-1 rounded-full text-[10px] bg-[#472825] text-[#FFF4E2] font-bold uppercase tracking-wider shadow-sm">
                ¡Últimas {totalStock}!
            </span>
        );
    } else if (product.isNew) {
        tag = (
            <span className="px-2.5 py-1 rounded-full text-[10px] bg-primary text-on-primary font-bold uppercase tracking-wider shadow-sm">
                Nuevo
            </span>
        );
    } else if (product.category?.toLowerCase().includes("boxy")) {
        tag = (
            <span className="px-2.5 py-1 rounded-full text-[10px] bg-[#454e15] text-[#FFF4E2] font-bold uppercase tracking-wider shadow-sm">
                Boxy Fit
            </span>
        );
    }

    const initialX = (index % 4 === 0) ? -50 : (index % 4 === 1) ? -20 : (index % 4 === 2) ? 20 : 50;

    return (
        <motion.article 
            initial={{ opacity: 0, x: initialX, y: 25 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, delay: (index % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-soft hover:shadow-lift transition-all duration-300 flex flex-col h-full border border-outline-variant/30 relative"
        >
            {/* Image & Quick Actions Area */}
            <div 
                onClick={handleOpenDrawer}
                className="relative aspect-[4/5] bg-surface-container overflow-hidden cursor-pointer block"
                title={`Personalizar ${product.name}`}
            >
                {/* Top Badges */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 items-start">
                    {tag}
                </div>

                {/* Favorite Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleFavorite(product.id);
                        if (!isFav) {
                            toast.success(`Agregaste ${product.name} a favoritos`);
                        }
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full z-20 shadow-sm transition-all hover:scale-110 ${
                        isFav ? 'bg-error/10 text-error' : 'bg-surface/85 backdrop-blur-sm text-on-surface-variant hover:text-error'
                    }`}
                    aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>

                {/* Product Image with Hover Zoom */}
                <Image 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    alt={product.name} 
                    src={product.images?.[0] || product.image_url || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop'}
                />

                {/* Nook-style Quick Customize Pill on Hover (Desktop) / Permanent Badge (Mobile) */}
                <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 sm:block hidden">
                    <button
                        type="button"
                        onClick={handleOpenDrawer}
                        className="w-full py-2.5 px-4 rounded-full bg-surface/90 backdrop-blur-md text-on-surface font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md hover:bg-primary hover:text-on-primary transition-all"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-primary group-hover:text-on-primary transition-colors" />
                        <span>Personalizar / Talles</span>
                    </button>
                </div>
            </div>

            {/* Content & Metadata */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                            {product.category || "General"}
                        </span>
                        <Link 
                            href={`/product/${product.id}`}
                            className="text-outline hover:text-primary transition-colors p-1"
                            title="Ver detalles completos del producto"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenDrawer}
                        className="text-left w-full mt-1"
                    >
                        <h3 className="text-sm font-bold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                    </button>
                </div>

                {/* Available Variants preview */}
                <div>
                    {isOutOfStock ? (
                        <p className="text-xs text-error font-bold">Sin stock disponible</p>
                    ) : productVariants.length > 1 ? (
                        <div className="flex flex-wrap items-center gap-1">
                            {productVariants.slice(0, 5).map(variant => {
                                const isAvailable = (variant.stock_quantity ?? 0) > 0;
                                const isSelected = selectedSize === variant.size;

                                if (!isAvailable) {
                                    return (
                                        <span 
                                            key={variant.size} 
                                            title={`Talle ${variant.size} agotado`}
                                            className="min-w-7 h-7 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center text-outline/35 line-through cursor-not-allowed select-none"
                                        >
                                            {variant.size}
                                        </span>
                                    );
                                }

                                return (
                                    <button 
                                        key={variant.size}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSize(variant.size);
                                        }}
                                        className={`min-w-7 h-7 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center transition-colors ${
                                            isSelected 
                                            ? "bg-primary text-on-primary shadow-xs" 
                                            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                                        }`}
                                    >
                                        {variant.size}
                                    </button>
                                );
                            })}
                            {productVariants.length > 5 && (
                                <span className="text-[10px] text-outline font-semibold pl-1">
                                    +{productVariants.length - 5}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs text-on-surface-variant font-medium">
                            Talle único
                        </span>
                    )}
                </div>

                {/* Price & Action Row */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-outline-variant/30">
                    <div>
                        <span className="text-base font-black text-on-surface">
                            ${product.price.toLocaleString('es-AR')}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={handleOpenDrawer}
                            className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1"
                            title="Personalizar diseño en panel lateral"
                        >
                            <Sparkles className="w-3 h-3 text-primary group-hover:text-on-primary" />
                            <span className="hidden xs:inline">Pedir</span>
                        </button>

                        <button 
                            type="button"
                            disabled={isOutOfStock}
                            onClick={handleAddToCart}
                            aria-label={`Agregar ${product.name} al carrito`}
                            className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus:outline-none shrink-0" 
                            title={isOutOfStock ? "Producto agotado" : "Agregar directo al carrito"}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
