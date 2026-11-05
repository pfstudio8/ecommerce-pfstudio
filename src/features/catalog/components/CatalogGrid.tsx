"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CatalogProductCard from "./CatalogProductCard";
import { Product } from "@/types/product";
import { Search, Filter, ArrowUpDown, RefreshCw, X, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

function CatalogGridContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlCategory = searchParams.get('cat');
    const urlSearch = searchParams.get('search');

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>(["Todas"]);
    const [availableSizes, setAvailableSizes] = useState<string[]>(["Todos"]);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Filters & Sorting state
    const [filterCategory, setFilterCategory] = useState<string>(urlCategory || "Todas");
    const [filterSize, setFilterSize] = useState<string>("Todos");
    const [searchQuery, setSearchQuery] = useState<string>(urlSearch || "");
    const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "newest">("featured");

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const PAGE_SIZE = 12;

    // Keep search and category filters in sync with URL searchParams
    useEffect(() => {
        if (urlSearch !== null) {
            setSearchQuery(urlSearch);
        }
    }, [urlSearch]);

    useEffect(() => {
        if (urlCategory !== null) {
            setFilterCategory(urlCategory);
        }
    }, [urlCategory]);

    // 1. Load dynamic categories & sizes from DB
    useEffect(() => {
        const loadCategoriesAndSizes = async () => {
            try {
                // Fetch categories from categories table
                const { data: dbCategories } = await supabase
                    .from('categories')
                    .select('name')
                    .order('name');

                // Also fetch distinct categories from active products
                const { data: dbProductCats } = await supabase
                    .from('products')
                    .select('category')
                    .eq('active', true);

                const catSet = new Set<string>();
                (dbCategories || []).forEach(c => { if (c.name) catSet.add(c.name); });
                (dbProductCats || []).forEach(p => { if (p.category) catSet.add(p.category); });

                const loadedCategories = ["Todas", ...Array.from(catSet).sort()];
                setCategories(loadedCategories);

                // Fetch sizes from product_stock
                const { data: dbSizes } = await supabase
                    .from('product_stock')
                    .select('size');

                const sizeSet = new Set<string>();
                (dbSizes || []).forEach(s => { if (s.size) sizeSet.add(s.size); });

                if (sizeSet.size > 0) {
                    setAvailableSizes(["Todos", ...Array.from(sizeSet).sort()]);
                } else {
                    setAvailableSizes(["Todos", "S", "M", "L", "XL", "XXL", "Único"]);
                }
            } catch (err) {
                console.warn("Error cargando categorías de la base:", err);
            }
        };

        loadCategoriesAndSizes();
    }, []);

    // 2. Fetch products with active filters
    const fetchProducts = async (pageNum: number, isLoadMore = false) => {
        if (isLoadMore) setIsLoadingMore(true);
        else setIsLoading(true);

        try {
            let query = supabase
                .from('products')
                .select('*, product_stock(size, stock_quantity)', { count: 'exact' })
                .eq('active', true);

            // Search filter
            if (searchQuery.trim()) {
                query = query.or(`name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`);
            }

            // Category filter
            if (filterCategory !== "Todas") {
                query = query.ilike('category', `%${filterCategory}%`);
            }

            // Sorting
            if (sortBy === 'price_asc') {
                query = query.order('price', { ascending: true });
            } else if (sortBy === 'price_desc') {
                query = query.order('price', { ascending: false });
            } else if (sortBy === 'newest') {
                query = query.order('created_at', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const from = (pageNum - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, count, error } = await query.range(from, to);

            if (error) throw error;

            if (data) {
                let fetched = data as Product[];

                // Filter by size in frontend if selected
                if (filterSize !== "Todos") {
                    fetched = fetched.filter(p =>
                        p.product_stock?.some(s => s.size === filterSize && s.stock_quantity > 0)
                    );
                }

                if (isLoadMore) {
                    setProducts(prev => [...prev, ...fetched]);
                } else {
                    setProducts(fetched);
                }

                if (count !== null) {
                    setTotalCount(count);
                    setHasMore(from + PAGE_SIZE < count);
                }
            }
        } catch (error) {
            console.error('Error fetching catalog products:', error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchProducts(1, false);
    }, [filterCategory, filterSize, searchQuery, sortBy]);

    useEffect(() => {
        if (urlCategory && urlCategory !== filterCategory) {
            setFilterCategory(urlCategory);
        }
    }, [urlCategory]);

    const handleCategoryChange = (cat: string) => {
        setFilterCategory(cat);
        router.push(cat === "Todas" ? "/catalog" : `/catalog?cat=${encodeURIComponent(cat)}`);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, true);
    };

    const handleClearFilters = () => {
        setFilterCategory("Todas");
        setFilterSize("Todos");
        setSearchQuery("");
        setSortBy("featured");
        router.push('/catalog');
    };

    return (
        <section className="py-8 bg-surface">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
                    {/* Search inside catalog */}
                    <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-primary" />
                            Buscar en catálogo
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Remera, gorra, taza..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3.5 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                Categorías
                            </h3>
                            <span className="text-[10px] text-outline font-mono">({categories.length - 1})</span>
                        </div>
                        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={cn(
                                        "text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between",
                                        filterCategory === cat
                                            ? "bg-primary text-on-primary font-bold shadow-sm"
                                            : "text-on-surface hover:bg-surface-container"
                                    )}
                                >
                                    <span>{cat}</span>
                                    {filterCategory === cat && <span className="text-[10px] uppercase font-bold">•</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size Filter */}
                    <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5 text-primary" />
                            Talles y Medidas
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {availableSizes.map(sizeVal => (
                                <button
                                    key={sizeVal}
                                    onClick={() => setFilterSize(sizeVal)}
                                    className={cn(
                                        "px-2.5 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all",
                                        filterSize === sizeVal
                                            ? "bg-primary text-on-primary shadow-sm"
                                            : "bg-surface border border-outline-variant text-on-surface hover:border-primary/50"
                                    )}
                                >
                                    {sizeVal}
                                </button>
                            ))}
                        </div>
                    </div>

                    {(filterCategory !== "Todas" || filterSize !== "Todos" || searchQuery.trim() !== "") && (
                        <button
                            onClick={handleClearFilters}
                            className="w-full py-2.5 rounded-xl border border-outline-variant text-xs font-bold uppercase tracking-wider text-outline hover:text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5"
                        >
                            <X className="w-3.5 h-3.5" />
                            Limpiar Filtros
                        </button>
                    )}
                </aside>

                {/* Main Product Grid */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Top bar: title + count + sorting */}
                    <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-extrabold text-on-surface">
                                {filterCategory === "Todas" ? "Todos los Productos" : filterCategory}
                            </h2>
                            <span className="text-xs font-bold text-outline bg-surface px-2.5 py-0.5 rounded-full border border-outline-variant">
                                {products.length} {totalCount > products.length ? `de ${totalCount}` : ''}
                            </span>
                        </div>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-outline font-semibold">Ordenar:</span>
                            <select
                                value={sortBy}
                                onChange={(e: any) => setSortBy(e.target.value)}
                                className="px-3 py-1.5 bg-surface border border-outline-variant rounded-xl text-xs font-semibold text-on-surface outline-none cursor-pointer focus:border-primary"
                            >
                                <option value="featured">Destacados</option>
                                <option value="price_asc">Menor precio</option>
                                <option value="price_desc">Mayor precio</option>
                                <option value="newest">Más recientes</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden h-96 flex flex-col animate-pulse">
                                    <div className="aspect-4/5 bg-surface-container w-full"></div>
                                    <div className="p-4 flex flex-col gap-3 flex-1">
                                        <div className="h-4 bg-surface-container rounded w-1/3"></div>
                                        <div className="h-5 bg-surface-container rounded w-3/4"></div>
                                        <div className="mt-auto h-8 bg-surface-container rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {products.map(product => (
                                    <CatalogProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            
                            {hasMore && (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={loadMore}
                                        disabled={isLoadingMore}
                                        className="px-8 py-3 bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                    >
                                        {isLoadingMore ? "Cargando..." : "Cargar Más Productos"}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center bg-surface-container-low rounded-2xl border border-outline-variant border-dashed flex flex-col items-center justify-center p-8 space-y-3">
                            <span className="material-symbols-outlined text-4xl text-outline opacity-40">inventory_2</span>
                            <h3 className="text-lg font-bold text-on-surface">No se encontraron productos</h3>
                            <p className="text-xs text-outline max-w-sm mx-auto">
                                No hay productos activos que coincidan con los filtros seleccionados. Intenta cambiar de categoría o buscar otro término.
                            </p>
                            <button 
                                onClick={handleClearFilters}
                                className="mt-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-all"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default function CatalogGrid() {
    return (
        <Suspense fallback={<div className="py-20 text-center text-outline">Cargando catálogo...</div>}>
            <CatalogGridContent />
        </Suspense>
    );
}
