"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CatalogProductCard from "./CatalogProductCard";
import { Product } from "@/types/product";

function CatalogGridContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlCategory = searchParams.get('cat');
    const urlSearch = searchParams.get('search');

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>(urlCategory || "Todas");
    const [filterSize, setFilterSize] = useState<string>("Todos");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const PAGE_SIZE = 12;

    // Categories available in the store
    const categories = ["Todas", "Oversize", "Boxy Fit", "Clásicas", "Buzos", "Pantalones", "Shorts", "Gorras", "Llaveros", "Tazas", "Vasos", "Accesorios"];
    const sizes = ["Todos", "S", "M", "L", "XL", "XXL"];
    
    const categoryTypes: Record<string, string[]> = {
        "Gorras": ["Todos", "Trucker", "Curva"],
        "Vasos": ["Todos", "Térmico", "Vidrio", "Acrílico", "Chopp"],
        "Llaveros": ["Todos", "Círculo", "Corazón", "Camiseta", "Credencial Reforzada"],
        "Tazas": ["Todos", "Mágicas", "Cerámica", "Chopp Cervecero"],
        "Accesorios": ["Todos", "Mochila", "Riñonera", "Billetera", "Morral"],
    };
    const isApparel = (cat: string) => !Object.keys(categoryTypes).includes(cat);

    const fetchProducts = async (pageNum: number, isLoadMore = false) => {
        if (isLoadMore) setIsLoadingMore(true);
        else setIsLoading(true);

        try {
            let query = supabase
                .from('products')
                .select('*, product_stock(size, stock_quantity)', { count: 'exact' });

            if (urlSearch) {
                query = query.ilike('name', `%${urlSearch}%`);
            }

            if (filterCategory !== "Todas") {
                if (filterCategory === "Accesorios") {
                    query = query.in('category', ['Llaveros', 'Vasos', 'Tazas', 'Encendedores', 'Accesorios']);
                } else {
                    query = query.ilike('category', `%${filterCategory}%`);
                }
            }

            const from = (pageNum - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            
            const { data, count, error } = await query.range(from, to).order('id');

            if (error) throw error;
            if (data) {
                let fetchedProducts = data as Product[];

                // frontend filter for size or type
                if (filterSize !== "Todos") {
                    if (isApparel(filterCategory) || filterCategory === "Todas") {
                        fetchedProducts = fetchedProducts.filter(p => 
                            p.product_stock?.some(s => s.size === filterSize && s.stock_quantity > 0)
                        );
                    } else {
                        // For non apparel, filter by description (type)
                        fetchedProducts = fetchedProducts.filter(p => 
                            p.description?.toLowerCase().includes(filterSize.toLowerCase())
                        );
                    }
                }

                if (isLoadMore) {
                    setProducts(prev => [...prev, ...fetchedProducts]);
                } else {
                    setProducts(fetchedProducts);
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
    }, [filterCategory, filterSize, urlSearch]);

    useEffect(() => {
        if (urlCategory && categories.includes(urlCategory)) {
            setFilterCategory(urlCategory);
        }
    }, [urlCategory]);

    const handleCategoryChange = (cat: string) => {
        setFilterCategory(cat);
        router.push(cat === "Todas" ? "/catalog" : `/catalog?cat=${cat}`);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, true);
    };

    return (
        <section className="py-space-xl bg-surface">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto flex flex-col md:flex-row gap-space-xl">
                
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-space-lg">
                    {/* Category Filter */}
                    <div>
                        <h3 className="text-headline-sm font-headline-sm text-on-surface mb-3">Categorías</h3>
                        <div className="flex flex-col gap-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`text-left px-3 py-2 rounded-lg text-body-md font-body-md transition-colors ${
                                        filterCategory === cat
                                        ? "bg-primary-fixed text-on-primary-fixed font-semibold"
                                        : "text-on-surface hover:bg-surface-container"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size / Type Filter */}
                    <div>
                        <h3 className="text-headline-sm font-headline-sm text-on-surface mb-3">
                            {isApparel(filterCategory) || filterCategory === "Todas" ? "Talles" : "Tipo"}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(isApparel(filterCategory) || filterCategory === "Todas" ? sizes : categoryTypes[filterCategory] || ["Todos"]).map(filterVal => (
                                <button
                                    key={filterVal}
                                    onClick={() => setFilterSize(filterVal)}
                                    className={`px-3 h-10 rounded-lg text-label-md font-label-md flex items-center justify-center transition-colors ${
                                        filterSize === filterVal
                                        ? "bg-primary text-on-primary font-bold shadow-sm"
                                        : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container hover:border-primary/50"
                                    }`}
                                >
                                    {filterVal}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Product Grid */}
                <div className="flex-1 flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant">
                        <h2 className="text-headline-md font-headline-md text-on-surface">
                            {filterCategory === "Todas" ? "Todos los Productos" : filterCategory}
                        </h2>
                        <span className="text-body-sm text-on-surface-variant font-medium bg-surface-container px-3 py-1 rounded-full">
                            {products.length} {totalCount > products.length ? `de ${totalCount}` : ''} productos
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter-desktop mt-4">
                            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                                <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden h-100 flex flex-col animate-pulse">
                                    <div className="aspect-4/5 bg-surface-container-high w-full"></div>
                                    <div className="p-4 flex flex-col gap-3 flex-1">
                                        <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
                                        <div className="h-5 bg-surface-container-high rounded w-3/4"></div>
                                        <div className="mt-auto h-8 bg-surface-container-high rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter-desktop mt-4">
                                {products.map(product => (
                                    <CatalogProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            
                            {hasMore && (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={loadMore}
                                        disabled={isLoadingMore}
                                        className="px-8 py-3 bg-surface-container-highest text-on-surface rounded-full font-bold hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isLoadingMore ? "Cargando..." : "Cargar Más"}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center bg-surface-container-low rounded-xl border border-outline-variant border-dashed mt-4 flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-outline mb-3">inventory_2</span>
                            <h3 className="text-headline-sm font-headline-sm text-on-surface">No se encontraron productos</h3>
                            <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
                                Intenta seleccionar otra categoría o talle para ver más opciones disponibles en nuestro catálogo.
                            </p>
                            <button 
                                onClick={() => { setFilterCategory("Todas"); setFilterSize("Todos"); router.push('/catalog'); }}
                                className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-full text-label-md font-label-md font-bold hover:bg-primary/90 transition-colors"
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
        <Suspense fallback={<div className="py-20 text-center text-on-surface">Cargando catálogo...</div>}>
            <CatalogGridContent />
        </Suspense>
    );
}
