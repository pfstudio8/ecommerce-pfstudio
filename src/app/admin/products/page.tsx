"use client";
import { FourSquare } from "react-loading-indicators";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit, Trash2, Loader2, Package, Filter, DollarSign, CheckCircle, AlertCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    images: string[];
    isNew: boolean;
    stock: number;
};

export default function AdminProducts() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const filterOption = searchParams.get("filter");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ valuation: 0, inStockRatio: 0, criticalAlerts: 0, total: 0 });

    useEffect(() => {
        fetchProducts();
    }, [filterOption]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('products').select('*').limit(20);

            if (error) {
                console.warn("Error obteniendo productos:", error.message);
                return;
            }

            const allData = data || [];
            
            // Calculate Stats
            const valuation = allData.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
            const inStock = allData.filter(p => (p.stock || 0) > 0).length;
            const inStockRatio = allData.length > 0 ? (inStock / allData.length) * 100 : 0;
            const criticalAlerts = allData.filter(p => (p.stock || 0) < 5).length;

            setStats({ valuation, inStockRatio, criticalAlerts, total: allData.length });

            // Apply filter manually
            let displayData = allData;
            if (filterOption === 'low_stock') {
                displayData = allData.filter(p => (p.stock || 0) < 5);
            } else if (filterOption === 'in_stock') {
                displayData = allData.filter(p => (p.stock || 0) > 0);
            }

            setProducts(displayData);
        } catch (error: any) {
            console.warn('Error cargando productos:', error?.message || error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            fetchProducts(); // Refetch to update stats and list
        } catch (error) {
            console.error('Error eliminando producto:', error);
            toast.error('Error al eliminar el producto.');
        }
    };


    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Editorial Header Section */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-sans">Gestión de Productos</h1>
                    <p className="text-outline font-medium">Administra tus {stats.total} productos activos en el catálogo.</p>
                </div>
                <Link
                    href="/admin/products/create"
                    className="flex items-center gap-2 bg-tertiary-container text-on-tertiary-container px-6 py-3 rounded-xl font-bold shadow-lg transition-all text-sm uppercase tracking-wider"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Producto
                </Link>
            </section>

            {/* Bento Stats (Jewel Components) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Valuation */}
                <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant p-6 rounded-2xl relative overflow-hidden group hover:border-primary transition-all duration-300 shadow-lg">
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-primary-container border border-primary flex items-center justify-center text-on-primary-container mb-4">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1 block">Valoración del Inventario</span>
                        <div className="text-3xl font-black text-on-surface font-sans">${stats.valuation.toLocaleString("es-AR")}</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <DollarSign className="w-32 h-32 text-primary" />
                    </div>
                </div>

                {/* In Stock Ratio */}
                <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant p-6 rounded-2xl relative overflow-hidden group hover:border-primary transition-all duration-300 shadow-lg">
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 mb-4">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1 block">Ratio de Disponibilidad</span>
                        <div className="text-3xl font-black text-on-surface font-sans">{stats.inStockRatio.toFixed(1)}%</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <CheckCircle className="w-32 h-32 text-orange-400" />
                    </div>
                </div>

                {/* Critical Alerts */}
                <div className={cn(
                    "p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-lg border",
                    stats.criticalAlerts > 0
                        ? "bg-error-container/60 border-error/20 hover:border-error/40"
                        : "bg-surface-container-low border-outline-variant hover:border-outline-variant/80"
                )}>
                    <div className="relative z-10">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center mb-4",
                            stats.criticalAlerts > 0
                                ? "bg-red-500/10 border border-red-500/25 text-red-400"
                                : "bg-gray-500/10 border border-gray-500/20 text-outline"
                        )}>
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1 block">Alertas Críticas</span>
                        <div className={cn(
                            "text-3xl font-black font-sans",
                            stats.criticalAlerts > 0 ? "text-red-400" : "text-on-surface"
                        )}>{stats.criticalAlerts} Productos</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <AlertCircle className={cn("w-32 h-32", stats.criticalAlerts > 0 ? "text-red-400" : "text-outline")} />
                    </div>
                </div>
            </div>

            {/* Main Products Ledger (Table) */}
            <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant rounded-2xl overflow-hidden shadow-lg">
                <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between bg-surface border-b border-outline-variant gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-2 text-on-surface font-bold text-sm shrink-0">
                            <Filter className="w-4 h-4 text-primary" />
                            Filtros
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => router.push('/admin/products')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors border",
                                    !filterOption 
                                        ? "bg-primary-container text-on-primary-container border-primary" 
                                        : "bg-surface-container-highest text-outline border-transparent hover:text-on-surface"
                                )}
                            >
                                Todos los Productos
                            </button>
                            <button 
                                onClick={() => router.push('/admin/products?filter=in_stock')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors border",
                                    filterOption === 'in_stock' 
                                        ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
                                        : "bg-surface-container-highest text-primary/70 border-transparent hover:bg-primary/5"
                                )}
                            >
                                En Stock
                            </button>
                            <button 
                                onClick={() => router.push('/admin/products?filter=low_stock')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors border",
                                    filterOption === 'low_stock' 
                                        ? "bg-red-500/10 text-red-400 border-error/20" 
                                        : "bg-surface-container-highest text-error/70 border-transparent hover:bg-error/5"
                                )}
                            >
                                Bajo Stock
                            </button>
                        </div>
                    </div>
                    <div className="text-outline text-xs font-medium">Mostrando {products.length} de {stats.total} productos</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-200">
                        <thead>
                            <tr className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] bg-surface border-b border-outline-variant">
                                <th className="px-8 py-4">Producto</th>
                                <th className="px-8 py-4 hidden md:table-cell">Categoría</th>
                                <th className="px-8 py-4 hidden md:table-cell">Estado</th>
                                <th className="px-8 py-4 hidden md:table-cell">Stock</th>
                                <th className="px-8 py-4 text-right">Precio</th>
                                <th className="px-8 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d2e26]">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-outline bg-surface">
                                        <Package className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                                        <p className="font-medium text-outline text-sm">No hay productos que coincidan con este filtro.</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const isLowStock = (product.stock || 0) < 5;
                                    const outOfStock = (product.stock || 0) === 0;

                                    return (
                                        <tr key={product.id} className="group hover:bg-surface-container-highest/30 transition-colors duration-200">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center group-hover:border-primary transition-colors">
                                                        {product.images && product.images.length > 0 ? (
                                                            <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover" />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-on-surface transition-colors" title={product.name}>{product.name}</div>
                                                        <div className="text-xs text-outline mt-0.5">SKU: {product.id.split('-')[0].toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 hidden md:table-cell">
                                                <span className="text-[10px] font-black text-on-surface-variant bg-surface-container-highest border border-outline-variant px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                                            </td>
                                            <td className="px-8 py-5 hidden md:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "w-2 h-2 rounded-full animate-pulse",
                                                        outOfStock ? "bg-red-500" : isLowStock ? "bg-amber-400" : "bg-tertiary-container"
                                                    )}></span>
                                                    <span className={cn(
                                                        "text-xs font-black uppercase tracking-wider",
                                                        outOfStock ? "text-red-500" : isLowStock ? "text-amber-400" : "text-primary"
                                                    )}>
                                                        {outOfStock ? "Sin Stock" : isLowStock ? "Bajo Stock" : "Disponible"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold text-on-surface hidden md:table-cell">{product.stock || 0} unidades</td>
                                            <td className="px-8 py-5 text-right font-black text-on-surface group-hover:text-on-surface transition-colors">${product.price.toLocaleString("es-AR")}</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
                                                    <Link 
                                                        href={`/admin/products/${product.id}`}
                                                        className="p-2 hover:bg-primary-container text-on-primary-container border border-transparent hover:border-primary rounded-lg transition-colors"
                                                        title="Editar Producto"
                                                    >
                                                        <Edit className="w-4.5 h-4.5" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 hover:bg-red-500/20 text-red-400 border border-transparent hover:border-error/20 rounded-lg transition-colors"
                                                        title="Eliminar Producto"
                                                    >
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
