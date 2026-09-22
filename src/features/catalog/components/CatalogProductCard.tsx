"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/features/orders/store/cart";
import { useFavoritesStore } from "@/features/catalog/store/favorites";
import { toast } from "sonner";
import { Product } from "@/types/product";

interface CatalogProductCardProps {
    product: Product;
}

export default function CatalogProductCard({ product }: CatalogProductCardProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const addItem = useCartStore((state) => state.addItem);

    // Filter available sizes (where stock > 0) or fallback to static sizes if no detailed stock
    const availableSizes = ["S", "M", "L", "XL", "XXL"].filter(size => {
        if (!product.product_stock || product.product_stock.length === 0) return true;
        const stockData = product.product_stock.find(s => s.size === size);
        return stockData && stockData.stock_quantity > 0;
    });

    const isOutOfStock = availableSizes.length === 0 && (product.stock === 0);

    const handleAddToCart = () => {
        if (!selectedSize && availableSizes.length > 0) {
            toast.warning("Por favor selecciona un talle");
            return;
        }
        
        // Use selected size or default to "Único" if no sizes are applicable
        const sizeToAdd = selectedSize || (availableSizes.length > 0 ? availableSizes[0] : "Único");
        addItem(product, sizeToAdd);
        setSelectedSize(null);
    };

    // Calculate total stock for badge
    const totalStock = product.product_stock?.reduce((acc, curr) => acc + curr.stock_quantity, 0) ?? product.stock ?? 10;
    
    // Determine the product tag
    let tag = null;
    if (totalStock > 0 && totalStock <= 3) {
        tag = (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-label-sm font-label-sm bg-error text-on-error font-bold z-10">
                ¡ÚLTIMAS {totalStock}!
            </span>
        );
    } else if (product.isNew) {
        tag = (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-label-sm font-label-sm bg-primary-container text-on-primary font-bold z-10">
                NUEVO
            </span>
        );
    }

    const { toggleFavorite, favoriteIds } = useFavoritesStore();
    const isFav = favoriteIds.includes(product.id);

    return (
        <article className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col group hover:border-primary transition-colors h-full focus-within:ring-2 focus-within:ring-primary relative">
            <Link href={`/product/${product.id}`} className="relative aspect-4/5 bg-surface-container-high overflow-hidden block">
                {tag}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(product.id);
                        if (!isFav) {
                            toast.success(`Agregaste ${product.name} a favoritos`);
                        }
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full z-20 shadow-sm transition-all hover:scale-110 ${isFav ? 'bg-error/10 text-error' : 'bg-surface/80 text-outline hover:text-error'}`}
                    aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                    <span className={`material-symbols-outlined text-headline-sm ${isFav ? 'material-symbols-fill' : ''}`}>favorite</span>
                </button>
                <Image 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                    alt={product.name} 
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop'}
                />
            </Link>
            <div className="p-space-md flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-label-sm font-label-sm text-secondary uppercase font-semibold">{product.category}</span>
                        {product.department && (
                            <span className="text-label-sm font-label-sm text-outline">{product.department}</span>
                        )}
                    </div>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="text-headline-sm font-headline-sm text-on-surface mt-1 line-clamp-2 hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                </div>
                
                <div className="my-space-sm flex-1">
                    {availableSizes.length > 0 ? (
                        <>
                            <p className="text-label-sm font-label-sm text-outline mb-1">Talles Disponibles:</p>
                            <div className="flex flex-wrap items-center gap-1">
                                {["S", "M", "L", "XL", "XXL"].map(size => {
                                    const isAvailable = availableSizes.includes(size);
                                    if (!isAvailable) {
                                        return (
                                            <span key={size} className="w-8 h-8 rounded border border-outline-variant/30 text-body-sm font-body-sm font-bold flex items-center justify-center text-outline/30 relative overflow-hidden">
                                                {size}
                                                <div className="absolute inset-0 w-full h-full border-t border-outline-variant/30 rotate-45 transform origin-center"></div>
                                            </span>
                                        );
                                    }
                                    return (
                                        <button 
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-8 h-8 rounded text-body-sm font-body-sm flex items-center justify-center cursor-pointer transition-colors ${
                                                selectedSize === size 
                                                ? "border-2 border-primary bg-primary-fixed/20 font-bold text-primary" 
                                                : "border border-outline-variant text-on-surface hover:border-primary/50 font-bold"
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <p className="text-label-sm font-label-sm text-error mt-4 font-medium">Agotado</p>
                    )}
                </div>
                
                <div className="pt-space-sm border-t border-outline-variant flex items-center justify-between mt-2">
                    <span className="text-headline-md font-headline-md font-bold text-primary">
                        ${product.price.toLocaleString('es-AR')} <span className="text-label-sm font-label-sm font-normal text-outline">ARS</span>
                    </span>
                    <button 
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                        aria-label={`Agregar ${product.name} al carrito`}
                        className="p-2 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus:outline-none" 
                        title="Agregar al carrito"
                    >
                        <span aria-hidden="true" className="material-symbols-outlined text-headline-sm material-symbols-fill">add_shopping_cart</span>
                    </button>
                </div>
            </div>
        </article>
    );
}
