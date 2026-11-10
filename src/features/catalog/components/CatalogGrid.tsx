"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CatalogProductCard from "./CatalogProductCard";
import { Product } from "@/types/product";
import { Search, ArrowUpDown, RefreshCw, X, Layers } from "lucide-react";
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
                const { data: dbCategories } = await supabase
                    .from('categories')
                    .select('name')
                    .order('name');

                const { data: dbProductCats } = await supabase
                    .from('products')
                    .select('category')
                    .eq('active', true);

                const catSet = new Set<string>();
                (dbCategories || []).forEach(c => { if (c.name) catSet.add(c.name); });
                (dbProductCats || []).forEach(p => { if (p.category) catSet.add(p.category); });

                const loadedCategories = ["Todas", ...Array.from(catSet).sort()];
                setCategories(loadedCategories);

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

            if (searchQuery.trim()) {
                query = query.or(`name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`);
            }

            if (filterCategory !== "Todas") {
                query = query.ilike('category', `%${filterCategory}%`);
            }

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

    const hasActiveFilters = filterCategory !== "Todas" || filterSize !== "Todos" || searchQuery.trim() !== "";

    return (
        <section className="py-8 md:py-12 bg-surface">
            <div className="w-full px-margin md:px-gutter-desktop max-w-7xl mx-auto flex flex-col md:flex-row gap-10">

                {/* Filtros */}
                <aside className="w-full md:w-60 shrink-0 flex flex-col gap-8">
                    {/* Buscador */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-primary" />
                            Buscar
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Remera, gorra, taza..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2.5 bg-surface-container rounded-full text-sm text-on-surface focus:ring-2 focus:ring-primary/30 outline-none transition-shadow placeholder:text-outline"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categorías */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                Categorías
                            </h3>
                        </div>
                        <div className="flex flex-wrap md:flex-col gap-2 md:gap-1 md:max-h-72 md:overflow-y-auto pr-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={cn(
                                        "text-left px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
                                        filterCategory === cat
                                            ? "bg-primary text-on-primary"
                                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Talles */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                            <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                            Talles
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {availableSizes.map(sizeVal => (
                                <button
                                    key={sizeVal}
                                    onClick={() => setFilterSize(sizeVal)}
                                    className={cn(
                                        "min-w-9 h-9 px-2.5 rounded-full text-xs font-bold transition-colors",
                                        filterSize === sizeVal
                                            ? "bg-primary text-on-primary"
                                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                                    )}
                                >
                                    {sizeVal}
                                </button>
                            ))}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            Limpiar filtros
                        </button>
                    )}
                </aside>

                {/* Grilla de productos */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Barra superior */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-lg font-extrabold text-on-surface">
                                {filterCategory === "Todas" ? "Todos los productos" : filterCategory}
                            </h2>
                            <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                                {products.length}{totalCount > products.length ? ` de ${totalCount}` : ''}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <label htmlFor="sort-select" className="text-xs text-on-surface-variant font-semibold">Ordenar</label>
                            <select
                                id="sort-select"
                                value={sortBy}
                                onChange={(e: any) => setSortBy(e.target.value)}
                                className="px-3.5 py-2 bg-surface-container rounded-full text-xs font-semibold text-on-surface outline-none cursor-pointer focus:ring-2 focus:ring-primary/30"
                            >
                                <option value="featured">Destacados</option>
                                <option value="price_asc">Menor precio</option>
                                <option value="price_desc">Mayor precio</option>
                                <option value="newest">Más recientes</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-surface-container-lowest rounded-2xl overflow-hidden h-96 flex flex-col animate-pulse">
                                    <div className="aspect-4/5 bg-surface-container w-full"></div>
                                    <div className="p-4 flex flex-col gap-3 flex-1">
                                        <div className="h-3 bg-surface-container rounded w-1/3"></div>
                                        <div className="h-5 bg-surface-container rounded w-3/4"></div>
                                        <div className="mt-auto h-9 bg-surface-container rounded-full w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {products.map(product => (
                                    <CatalogProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="mt-6 flex justify-center">
                                    <button 
                                        onClick={loadMore}
                                        disabled={isLoadingMore}
                                        className="px-8 py-3 bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface rounded-full text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isLoadingMore ? (
                                            <>Cargando...</>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-4 h-4" />
                                                Cargar más productos
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center bg-surface-container-low rounded-2xl flex flex-col items-center justify-center p-8 space-y-3">
                            <span className="material-symbols-outlined text-4xl text-outline opacity-40">inventory_2</span>
                            <h3 className="text-lg font-bold text-on-surface">No se encontraron productos</h3>
                            <p className="text-xs text-outline max-w-sm mx-auto">
                                No hay productos activos que coincidan con los filtros seleccionados. Intenta cambiar de categoría o buscar otro término.
                            </p>
                            <button 
                                onClick={handleClearFilters}
                                className="mt-2 px-6 py-2.5 bg-primary text-on-primary rounded-full text-xs font-bold hover:bg-primary-container transition-colors"
                            >
                                Limpiar filtros
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
