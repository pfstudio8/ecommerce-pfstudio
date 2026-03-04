"use client";

import { useState, useEffect } from "react";
import ProductCard, { Product } from "./ProductCard";
import QuickViewModal from "./QuickViewModal";
import { useCartStore, CartStore } from "@/store/cart";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { sileo } from "sileo";
import { motion } from "framer-motion";

export function ProductGrid() {
    const searchParams = useSearchParams();
    const urlCategory = searchParams.get('cat');
    const urlSearch = searchParams.get('search');

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("Todas");
    const [sizeFilter, setSizeFilter] = useState("Todos");
    const [sortBy, setSortBy] = useState("destacados");
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const addItem = useCartStore((state: CartStore) => state.addItem);

    // Fetch products from Supabase
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*');

                if (error) throw error;
                if (data) {
                    setProducts(data as Product[]);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Determine current filter derived directly from URL parameters or state
    const currentFilter = urlCategory || filter;

    const handleQuickView = (product: Product) => {
        setQuickViewProduct(product);
    };

    const handleAddToCart = (product: Product, size: string) => {
        addItem(product, size);
        sileo.success({ title: `¡Agregado al carrito: ${product.name}!` });
    };

    const filteredProducts = products.filter(p => {
        // First strictly apply search query if it exists
        if (urlSearch) {
            return p.name.toLowerCase().includes(urlSearch.toLowerCase());
        }
        // Otherwise apply category filter
        if (currentFilter === "Todas") return true;
        return p.category === currentFilter;
    }).sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        return 0; // destacados
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <section className="py-24 bg-[var(--background)] overflow-hidden" id="productos">
            <div className="container mx-auto px-6 md:px-4">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center mb-16"
                >
                    <h2 className="text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
                        Nuestros Diseños
                    </h2>
                    <div className="w-24 h-1 bg-[var(--color-main)] mb-8"></div>

                    {/* Category Filters Mobile/Inline */}
                    <div className="flex flex-wrap justify-center gap-4 lg:hidden">
                        {["Todas", "Oversize", "Boxy Fit", "Clásicas"].map(cat => (
                            <button
                                key={cat}
                                onClick={() => {
                                    // If we had URL categories, remove them when interacting with inline filters
                                    if (urlCategory || urlSearch) {
                                        window.history.replaceState({}, '', '/');
                                    }
                                    setFilter(cat);
                                }}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${currentFilter === cat
                                    ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                                    : "border-gray-300 text-gray-600 dark:border-gray-800 hover:border-gray-800"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Grid Container */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="flex flex-col gap-4 animate-pulse">
                                <div className="aspect-[3/4] bg-gray-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
                                <div className="space-y-2 mt-2">
                                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-full w-3/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-full w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No se encontraron productos para mostrar.
                    </div>
                ) : (
                    <motion.div
                        key={`${currentFilter}-${urlSearch || ''}`}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        {filteredProducts.map(product => (
                            <motion.div key={product.id} variants={itemVariants}>
                                <ProductCard
                                    product={product}
                                    onQuickView={handleQuickView}
                                    onAddToCart={handleAddToCart}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

            </div>

            <QuickViewModal
                isOpen={!!quickViewProduct}
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={handleAddToCart}
                allProducts={products}
            />
        </section>
    );
}

import { Suspense } from 'react';

export default function ProductGridWrapper() {
    return (
        <Suspense fallback={<div className="py-24 text-center">Cargando productos...</div>}>
            <ProductGrid />
        </Suspense>
    );
}
