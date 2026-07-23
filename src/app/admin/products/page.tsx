"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit, Trash2, Loader2, Package, Filter, DollarSign, CheckCircle, AlertCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
            const { data, error } = await supabase.from('products').select('*');

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
            alert('Error al eliminar el producto.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-40 min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-main" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Editorial Header Section */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242520] pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2 font-sans">Gestión de Productos</h1>
                    <p className="text-gray-400 font-medium">Administra tus {stats.total} productos activos en el catálogo.</p>
                </div>
                <Link
                    href="/admin/products/create"
                    className="flex items-center gap-2 bg-main text-black px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(0,168,122,0.2)] hover:bg-emerald-400 transition-all scale-100 hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-wider"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Producto
                </Link>
            </section>

            {/* Bento Stats (Jewel Components) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Valuation */}
                <div className="bg-[#1c1d18]/60 backdrop-blur-md border border-[#2d2e26] p-6 rounded-2xl relative overflow-hidden group hover:border-main/40 transition-all duration-300 shadow-lg">
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-main/10 border border-main/20 flex items-center justify-center text-main mb-4">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1 block">Valoración del Inventario</span>
                        <div className="text-3xl font-black text-white font-sans">${stats.valuation.toLocaleString("es-AR")}</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <DollarSign className="w-32 h-32 text-main" />
                    </div>
                </div>

                {/* In Stock Ratio */}
                <div className="bg-[#1c1d18]/60 backdrop-blur-md border border-[#2d2e26] p-6 rounded-2xl relative overflow-hidden group hover:border-main/40 transition-all duration-300 shadow-lg">
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-4">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1 block">Ratio de Disponibilidad</span>
                        <div className="text-3xl font-black text-white font-sans">{stats.inStockRatio.toFixed(1)}%</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <CheckCircle className="w-32 h-32 text-emerald-400" />
                    </div>
                </div>

                {/* Critical Alerts */}
                <div className={cn(
                    "p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-lg border",
                    stats.criticalAlerts > 0
                        ? "bg-[#241818]/60 border-red-500/20 hover:border-red-500/40"
                        : "bg-[#1c1d18]/60 border-[#2d2e26] hover:border-[#2d2e26]/80"
                )}>
                    <div className="relative z-10">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center mb-4",
                            stats.criticalAlerts > 0
                                ? "bg-red-500/10 border border-red-500/25 text-red-400"
                                : "bg-gray-500/10 border border-gray-500/20 text-gray-400"
                        )}>
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <span className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1 block">Alertas Críticas</span>
                        <div className={cn(
                            "text-3xl font-black font-sans",
                            stats.criticalAlerts > 0 ? "text-red-400" : "text-white"
                        )}>{stats.criticalAlerts} Productos</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <AlertCircle className={cn("w-32 h-32", stats.criticalAlerts > 0 ? "text-red-400" : "text-gray-400")} />
                    </div>
                </div>
            </div>

            {/* Main Products Ledger (Table) */}
            <div className="bg-[#1c1d18]/60 backdrop-blur-md border border-[#2d2e26] rounded-2xl overflow-hidden shadow-lg">
                <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between bg-[#12130f]/80 border-b border-[#2d2e26] gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-2 text-white font-bold text-sm shrink-0">
                            <Filter className="w-4 h-4 text-main" />
                            Filtros
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => router.push('/admin/products')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors border",
                                    !filterOption 
                                        ? "bg-main/10 text-main border-main/20" 
                                        : "bg-[#252620] text-gray-400 border-transparent hover:text-white"
                                )}
                            >
                                Todos los Productos
                            </button>
                            <button 
                                onClick={() => router.push('/admin/products?filter=in_stock')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors border",
                                    filterOption === 'in_stock' 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                        : "bg-[#252620] text-emerald-500/70 border-transparent hover:bg-emerald-500/5"
                                )}
                            >
                                En Stock
                            </button>
                            <button 
                                onClick={() => router.push('/admin/products?filter=low_stock')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors border",
                                    filterOption === 'low_stock' 
                                        ? "bg-red-500/10 text-red-400 border-red-500/20" 
                                        : "bg-[#252620] text-red-500/70 border-transparent hover:bg-red-500/5"
                                )}
                            >
                                Bajo Stock
                            </button>
                        </div>
                    </div>
                    <div className="text-gray-400 text-xs font-medium">Mostrando {products.length} de {stats.total} productos</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-200">
                        <thead>
                            <tr className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] bg-[#12130f]/40 border-b border-[#2d2e26]">
                                <th className="px-8 py-4">Producto</th>
                                <th className="px-8 py-4">Categoría</th>
                                <th className="px-8 py-4">Estado</th>
                                <th className="px-8 py-4">Stock</th>
                                <th className="px-8 py-4 text-right">Precio</th>
                                <th className="px-8 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d2e26]">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-500 bg-[#12130f]/10">
                                        <Package className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                                        <p className="font-medium text-gray-400 text-sm">No hay productos que coincidan con este filtro.</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const isLowStock = (product.stock || 0) < 5;
                                    const outOfStock = (product.stock || 0) === 0;

                                    return (
                                        <tr key={product.id} className="group hover:bg-[#252620]/30 transition-colors duration-200">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-[#252620] border border-[#2d2e26] overflow-hidden shrink-0 flex items-center justify-center group-hover:border-main/30 transition-colors">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-white transition-colors" title={product.name}>{product.name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">SKU: {product.id.split('-')[0].toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-black text-gray-300 bg-[#252620] border border-[#2d2e26] px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "w-2 h-2 rounded-full animate-pulse",
                                                        outOfStock ? "bg-red-500" : isLowStock ? "bg-amber-400" : "bg-main"
                                                    )}></span>
                                                    <span className={cn(
                                                        "text-xs font-black uppercase tracking-wider",
                                                        outOfStock ? "text-red-500" : isLowStock ? "text-amber-400" : "text-main"
                                                    )}>
                                                        {outOfStock ? "Sin Stock" : isLowStock ? "Bajo Stock" : "Disponible"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold text-white">{product.stock || 0} unidades</td>
                                            <td className="px-8 py-5 text-right font-black text-foreground group-hover:text-white transition-colors">${product.price.toLocaleString("es-AR")}</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
                                                    <Link 
                                                        href={`/admin/products/${product.id}`}
                                                        className="p-2 hover:bg-main/20 text-main border border-transparent hover:border-main/20 rounded-lg transition-colors"
                                                        title="Editar Producto"
                                                    >
                                                        <Edit className="w-4.5 h-4.5" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 hover:bg-red-500/20 text-red-400 border border-transparent hover:border-red-500/20 rounded-lg transition-colors"
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
