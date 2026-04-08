"use client";

import { useState, useEffect } from "react";
import ProductCard, { Product } from "./ProductCard";
import QuickViewModal from "./QuickViewModal";
import { useCartStore, CartStore } from "@/store/cart";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { sileo } from "sileo";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Filter } from "lucide-react";

export function ProductGrid() {
    const searchParams = useSearchParams();
    const urlCategory = searchParams.get('cat');
    const urlDept = searchParams.get('dept');
    const urlSearch = searchParams.get('search');

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("Todas");
    const [departmentFilter, setDepartmentFilter] = useState<string | null>(urlDept || null);
    const [sizeFilter, setSizeFilter] = useState("Todos");
    const [sortBy, setSortBy] = useState("destacados");
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const addItem = useCartStore((state: CartStore) => state.addItem);

    // Fetch products from Supabase
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, product_stock(size, stock_quantity), reviews(rating)');

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

    useEffect(() => {
        if (urlDept) setDepartmentFilter(urlDept === "Todas" ? null : urlDept);
    }, [urlDept]);

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
        // Filter by Cut Category (Clásicas, Boxy Fit, Oversize)
        if (currentFilter !== "Todas" && p.category !== currentFilter) {
            return false;
        }

        // Filter by Department (Hombres, Mujeres, Niños)
        // Note: we do an optional check in case older products don't have the column yet
        if (departmentFilter) {
            // @ts-ignore
            if (!p.department || p.department.toLowerCase() !== departmentFilter.toLowerCase()) return false;
        }

        return true;
    }).sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        return 0; // destacados
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <section className="pb-24 bg-[var(--background)] overflow-hidden" id="productos">
            <div className="container mx-auto px-6 md:px-8 max-w-[1400px]">

                <div className="flex flex-col gap-8">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center mb-4 mt-8">
                        <button
                            onClick={() => setIsFilterMenuOpen(true)}
                            className="px-6 py-3 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 font-bold uppercase tracking-wider text-sm shadow-sm"
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                        </button>
                        <div className="text-sm font-medium tracking-wider text-gray-500 uppercase">
                            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Filter Drawer Overlay */}
                    <AnimatePresence>
                        {isFilterMenuOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsFilterMenuOpen(false)}
                                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                                ></motion.div>

                                <motion.aside
                                    initial={{ x: "-100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "-100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-zinc-950 shadow-2xl z-50 overflow-y-auto flex flex-col"
                                >
                                    <div className="p-6 h-full flex flex-col">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="font-bold text-xl text-[var(--foreground)] flex items-center gap-2">
                                                <Filter className="w-5 h-5" /> Filtros
                                            </h3>
                                            <button
                                                onClick={() => setIsFilterMenuOpen(false)}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex-1 space-y-8">
                                            <div>
                                                <h4 className="font-semibold text-sm mb-4 text-[var(--foreground)] uppercase tracking-wider text-gray-500">Corte</h4>
                                                <div className="space-y-2">
                                                    {["Todas", "Oversize", "Boxy Fit", "Clásicas"].map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => {
                                                                if (urlCategory || urlSearch) window.history.replaceState({}, '', '/');
                                                                setFilter(cat);
                                                                setIsFilterMenuOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${currentFilter === cat
                                                                ? "bg-[var(--foreground)] text-[var(--background)]"
                                                                : "bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
                                                                }`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentFilter === cat ? "bg-white/20 dark:bg-black/20" : "bg-white dark:bg-zinc-800 shadow-sm"
                                                                }`}>
                                                                {cat === "Todas" && <span className="text-sm">⊞</span>}
                                                                {cat === "Oversize" && <span className="text-sm font-bold opacity-70">O</span>}
                                                                {cat === "Boxy Fit" && <span className="text-sm font-bold opacity-70">B</span>}
                                                                {cat === "Clásicas" && <span className="text-sm font-bold opacity-70">C</span>}
                                                            </div>
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                                                <h4 className="font-semibold text-sm mb-4 text-[var(--foreground)] uppercase tracking-wider text-gray-500">Secciones</h4>
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => {
                                                            if (urlDept || urlCategory || urlSearch) window.history.replaceState({}, '', '/');
                                                            setDepartmentFilter(null);
                                                            setIsFilterMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${!departmentFilter
                                                            ? "bg-zinc-100 dark:bg-zinc-800 text-[var(--foreground)] font-bold"
                                                            : "bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/50 hover:text-gray-900 dark:hover:text-gray-300 border border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-400 font-medium"
                                                            }`}
                                                    >
                                                        Todos
                                                    </button>
                                                    {["Hombres", "Mujeres", "Niños"].map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => {
                                                                if (urlDept || urlCategory || urlSearch) window.history.replaceState({}, '', '/');
                                                                setDepartmentFilter(cat);
                                                                setIsFilterMenuOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex justify-between items-center ${departmentFilter === cat
                                                                ? "bg-zinc-100 dark:bg-zinc-800 text-[var(--foreground)] font-bold"
                                                                : "bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/50 hover:text-gray-900 dark:hover:text-gray-300 border border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-400 font-medium"
                                                                }`}
                                                        >
                                                            {cat}
                                                            {departmentFilter === cat && <span className="text-[var(--foreground)] font-bold">✓</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Main Content Area */}
                    <div className="flex-1 w-full max-w-[1400px] mx-auto">
                        {/* Grid Container */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                    <div key={n} className="group flex flex-col bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg overflow-hidden relative shadow-sm h-full">
                                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-zinc-800 animate-pulse"></div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <div className="h-6 bg-gray-200 dark:bg-zinc-800/80 rounded w-3/4 animate-pulse mb-3"></div>
                                            <div className="h-5 bg-gray-200 dark:bg-zinc-800/80 rounded w-1/3 animate-pulse mb-6"></div>
                                            
                                            <div className="flex gap-2 mb-4 mt-auto">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} className="w-10 h-10 rounded border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 animate-pulse"></div>
                                                ))}
                                            </div>
                                            
                                            <div className="flex flex-col gap-2.5 mt-4">
                                                <div className="w-full h-10 sm:h-11 bg-gray-200 dark:bg-zinc-800/80 rounded animate-pulse"></div>
                                                <div className="w-full h-10 sm:h-11 border-2 border-gray-100 dark:border-zinc-800 rounded animate-pulse"></div>
                                            </div>
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
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12"
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
                </div>

                <QuickViewModal
                    isOpen={!!quickViewProduct}
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onAddToCart={handleAddToCart}
                    allProducts={products}
                />
            </div>
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
