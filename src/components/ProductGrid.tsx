"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard, { Product } from "./ProductCard";
import QuickViewModal from "./QuickViewModal";
import { useCartStore, CartStore } from "@/store/cart";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { sileo } from "sileo";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Filter, ChevronDown, ChevronUp } from "lucide-react";

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
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const addItem = useCartStore((state: CartStore) => state.addItem);

    const toggleExpandCategory = (catKey: string) => {
        setExpandedCategories(prev => {
            const isExpanding = !prev[catKey];
            return { ...prev, [catKey]: isExpanding };
        });
    };

    const handleCollapseAllWithDelay = () => {
        const el = document.getElementById("productos");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
        setTimeout(() => {
            setExpandedCategories({});
            if (urlCategory || urlDept || urlSearch) {
                window.history.replaceState({}, '', '/#productos');
            }
            setFilter("Todas");
            setDepartmentFilter(null);
        }, 400);
    };

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

    // Base products filtered globally by search, department and size
    const baseProducts = products.filter(p => {
        if (urlSearch) {
            return p.name.toLowerCase().includes(urlSearch.toLowerCase());
        }
        if (departmentFilter) {
            // @ts-ignore
            if (!p.department || p.department.toLowerCase() !== departmentFilter.toLowerCase()) return false;
        }
        if (sizeFilter && sizeFilter !== "Todos") {
            const hasStockForSize = p.product_stock?.some(s => s.size === sizeFilter && s.stock_quantity > 0);
            if (!hasStockForSize) return false;
        }
        return true;
    });

    // Remeras module: filtered by cut category (Clásicas, Boxy Fit, Oversize)
    const sortProducts = (list: Product[]) => {
        return [...list].sort((a, b) => {
            if (sortBy === "price_asc") return a.price - b.price;
            if (sortBy === "price_desc") return b.price - a.price;
            return 0;
        });
    };

    const remeras = sortProducts(baseProducts.filter(p => 
        ['Clásicas', 'Boxy Fit', 'Oversize'].includes(p.category) && 
        (currentFilter === "Todas" || currentFilter === "Remeras" || p.category === currentFilter)
    ));

    const camisetas = sortProducts(baseProducts.filter(p => 
        p.category === 'Camisetas' && 
        (currentFilter === "Todas" || currentFilter === "Camisetas")
    ));

    const gorras = sortProducts(baseProducts.filter(p => 
        p.category === 'Gorras' && 
        (currentFilter === "Todas" || currentFilter === "Gorras")
    ));

    const botineros = sortProducts(baseProducts.filter(p => 
        p.category === 'Botineros' && 
        (currentFilter === "Todas" || currentFilter === "Botineros")
    ));

    const accesorios = sortProducts(baseProducts.filter(p => 
        ['Llaveros', 'Vasos', 'Tazas', 'Encendedores', 'Accesorios'].includes(p.category) && 
        (currentFilter === "Todas" || currentFilter === "Accesorios" || p.category === currentFilter)
    ));

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
                            {baseProducts.length} producto{baseProducts.length !== 1 ? 's' : ''}
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

                                            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                                                <h4 className="font-semibold text-sm mb-4 text-[var(--foreground)] uppercase tracking-wider text-gray-500">Talle</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {["Todos", "S", "M", "L", "XL", "XXL"].map(size => (
                                                        <button
                                                            key={size}
                                                            onClick={() => {
                                                                setSizeFilter(size);
                                                                setIsFilterMenuOpen(false);
                                                            }}
                                                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                                                                sizeFilter === size
                                                                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg"
                                                                    : "bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500 hover:text-white"
                                                            }`}
                                                        >
                                                            {size}
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
                                {[1, 2, 3, 4].map((n) => (
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
                        ) : baseProducts.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 font-medium tracking-wide">
                                No se encontraron productos para mostrar.
                            </div>
                        ) : (
                            <div className="space-y-24">
                                {/* 1. REMERAS SECTION */}
                                {remeras.length > 0 && (
                                    <div id="section-remeras" className="space-y-8">
                                        <div className="border-b border-white/5 pb-4 flex justify-between items-end">
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-3">
                                                    Remeras & Prendas
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">Oversize, Boxy Fit y cortes clásicos de alta calidad</p>
                                            </div>
                                            <span className="text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-gray-400 font-bold uppercase tracking-widest">{remeras.length} prendas</span>
                                        </div>
                                        <motion.div
                                            key={`remeras-${currentFilter}-${expandedCategories["remeras"]}`}
                                            variants={containerVariants}
                                            initial="hidden"
                                            whileInView="show"
                                            viewport={{ once: true }}
                                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12"
                                        >
                                            {(expandedCategories["remeras"] || currentFilter !== "Todas" ? remeras : remeras.slice(0, 4)).map(product => (
                                                <motion.div key={product.id} variants={itemVariants}>
                                                    <ProductCard
                                                        product={product}
                                                        onQuickView={handleQuickView}
                                                        onAddToCart={handleAddToCart}
                                                    />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                        {currentFilter === "Todas" && !expandedCategories["remeras"] && remeras.length > 4 && (
                                            <div className="flex justify-center pt-4">
                                                <button
                                                    onClick={() => toggleExpandCategory("remeras")}
                                                    className="px-6 py-3 border border-white/10 hover:border-main/50 hover:bg-main/10 transition-all duration-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer shadow-sm"
                                                >
                                                    <span>VER MÁS ({remeras.length})</span>
                                                    <ChevronDown className="w-4 h-4 text-main" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 2. CAMISETAS SECTION */}
                                {camisetas.length > 0 && (
                                    <div id="section-camisetas" className="space-y-8">
                                        <div className="border-b border-white/5 pb-4 flex justify-between items-end">
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[var(--foreground)]">
                                                    Camisetas de Fútbol
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">Calidad premium de tus equipos favoritos para lucir con estilo</p>
                                            </div>
                                            <span className="text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-gray-400 font-bold uppercase tracking-widest">{camisetas.length} camisetas</span>
                                        </div>
                                        <motion.div
                                            key={`camisetas-${currentFilter}-${expandedCategories["camisetas"]}`}
                                            variants={containerVariants}
                                            initial="hidden"
                                            whileInView="show"
                                            viewport={{ once: true }}
                                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12"
                                        >
                                            {(expandedCategories["camisetas"] || currentFilter !== "Todas" ? camisetas : camisetas.slice(0, 4)).map(product => (
                                                <motion.div key={product.id} variants={itemVariants}>
                                                    <ProductCard
                                                        product={product}
                                                        onQuickView={handleQuickView}
                                                        onAddToCart={handleAddToCart}
                                                    />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                        {currentFilter === "Todas" && !expandedCategories["camisetas"] && camisetas.length > 4 && (
                                            <div className="flex justify-center pt-4">
                                                <button
                                                    onClick={() => toggleExpandCategory("camisetas")}
                                                    className="px-6 py-3 border border-white/10 hover:border-main/50 hover:bg-main/10 transition-all duration-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer shadow-sm"
                                                >
                                                    <span>VER MÁS ({camisetas.length})</span>
                                                    <ChevronDown className="w-4 h-4 text-main" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 3. GORRAS SECTION */}
                                {gorras.length > 0 && (
                                    <div id="section-gorras" className="space-y-8">
                                        <div className="border-b border-white/5 pb-4 flex justify-between items-end">
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[var(--foreground)]">
                                                    Gorras Exclusivas
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">Estilo premium y ajuste perfecto para cualquier ocasión</p>
                                            </div>
                                            <span className="text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-gray-400 font-bold uppercase tracking-widest">{gorras.length} gorras</span>
                                        </div>
                                        <motion.div
                                            key={`gorras-${currentFilter}-${expandedCategories["gorras"]}`}
                                            variants={containerVariants}
                                            initial="hidden"
                                            whileInView="show"
                                            viewport={{ once: true }}
                                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12"
                                        >
                                            {(expandedCategories["gorras"] || currentFilter !== "Todas" ? gorras : gorras.slice(0, 4)).map(product => (
                                                <motion.div key={product.id} variants={itemVariants}>
                                                    <ProductCard
                                                        product={product}
                                                        onQuickView={handleQuickView}
                                                        onAddToCart={handleAddToCart}
                                                    />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                        {currentFilter === "Todas" && !expandedCategories["gorras"] && gorras.length > 4 && (
                                            <div className="flex justify-center pt-4">
                                                <button
                                                    onClick={() => toggleExpandCategory("gorras")}
                                                    className="px-6 py-3 border border-white/10 hover:border-main/50 hover:bg-main/10 transition-all duration-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer shadow-sm"
                                                >
                                                    <span>VER MÁS ({gorras.length})</span>
                                                    <ChevronDown className="w-4 h-4 text-main" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 4. BOTINEROS SECTION */}
                                {botineros.length > 0 && (
                                    <div id="section-botineros" className="space-y-8">
                                        <div className="border-b border-white/5 pb-4 flex justify-between items-end">
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[var(--foreground)]">
                                                    Botineros Deportivos
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">Llevá tus zapatillas y botines con la máxima comodidad</p>
                                            </div>
                                            <span className="text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-gray-400 font-bold uppercase tracking-widest">{botineros.length} botineros</span>
                                        </div>
                                        <motion.div
                                            key={`botineros-${currentFilter}-${expandedCategories["botineros"]}`}
                                            variants={containerVariants}
                                            initial="hidden"
                                            whileInView="show"
                                            viewport={{ once: true }}
                                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12"
                                        >
                                            {(expandedCategories["botineros"] || currentFilter !== "Todas" ? botineros : botineros.slice(0, 4)).map(product => (
                                                <motion.div key={product.id} variants={itemVariants}>
                                                    <ProductCard
                                                        product={product}
                                                        onQuickView={handleQuickView}
                                                        onAddToCart={handleAddToCart}
                                                    />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                        {currentFilter === "Todas" && !expandedCategories["botineros"] && botineros.length > 4 && (
                                            <div className="flex justify-center pt-4">
                                                <button
                                                    onClick={() => toggleExpandCategory("botineros")}
                                                    className="px-6 py-3 border border-white/10 hover:border-main/50 hover:bg-main/10 transition-all duration-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer shadow-sm"
                                                >
                                                    <span>VER MÁS ({botineros.length})</span>
                                                    <ChevronDown className="w-4 h-4 text-main" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 5. ACCESORIOS SECTION */}
                                {accesorios.length > 0 && (
                                    <div id="section-accesorios" className="space-y-8">
                                        <div className="border-b border-white/5 pb-4 flex justify-between items-end">
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[var(--foreground)]">
                                                    Tazas, Llaveros & Accesorios
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">Tazas personalizadas, encendedores de colección y detalles únicos</p>
                                            </div>
                                            <span className="text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-gray-400 font-bold uppercase tracking-widest">{accesorios.length} accesorios</span>
                                        </div>
                                        <motion.div
                                            key={`accesorios-${currentFilter}-${expandedCategories["accesorios"]}`}
                                            variants={containerVariants}
                                            initial="hidden"
                                            whileInView="show"
                                            viewport={{ once: true }}
                                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12"
                                        >
                                            {(expandedCategories["accesorios"] || currentFilter !== "Todas" ? accesorios : accesorios.slice(0, 4)).map(product => (
                                                <motion.div key={product.id} variants={itemVariants}>
                                                    <ProductCard
                                                        product={product}
                                                        onQuickView={handleQuickView}
                                                        onAddToCart={handleAddToCart}
                                                    />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                        {currentFilter === "Todas" && !expandedCategories["accesorios"] && accesorios.length > 4 && (
                                            <div className="flex justify-center pt-4">
                                                <button
                                                    onClick={() => toggleExpandCategory("accesorios")}
                                                    className="px-6 py-3 border border-white/10 hover:border-main/50 hover:bg-main/10 transition-all duration-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer shadow-sm"
                                                >
                                                    <span>VER MÁS ({accesorios.length})</span>
                                                    <ChevronDown className="w-4 h-4 text-main" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Single Bottom Collapse / Reset Button */}
                                {(Object.values(expandedCategories).some(Boolean) || currentFilter !== "Todas") && (
                                    <div className="flex justify-center pt-8 border-t border-white/10">
                                        <button
                                            onClick={handleCollapseAllWithDelay}
                                            className="px-8 py-3.5 bg-main/15 border-2 border-main/40 hover:border-main hover:bg-main/30 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 shadow-lg shadow-main/10 transition-all cursor-pointer hover:scale-105"
                                        >
                                            <span>VER MENOS</span>
                                            <ChevronUp className="w-4 h-4 text-main" />
                                        </button>
                                    </div>
                                )}
                            </div>
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
