"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit, Trash2, Package, Search, Filter, AlertTriangle, ArrowUpDown, TrendingUp, DollarSign, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    images: string[];
    isNew: boolean;
    stock: number;
    active?: boolean;
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
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn("Error obteniendo productos:", error.message);
                return;
            }

            const allData = (data || []).map((p: any) => ({
                ...p,
                active: p.active !== false
            }));
            
            // Calculate Stats (based on active products)
            const activeOnly = allData.filter(p => p.active);
            const valuation = activeOnly.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
            const inStock = activeOnly.filter(p => (p.stock || 0) > 0).length;
            const inStockRatio = activeOnly.length > 0 ? (inStock / activeOnly.length) * 100 : 0;
            const criticalAlerts = activeOnly.filter(p => (p.stock || 0) < 5).length;

            setStats({ valuation, inStockRatio, criticalAlerts, total: activeOnly.length });

            // Apply filter
            let displayData = allData;
            if (filterOption === 'low_stock') {
                displayData = allData.filter(p => (p.stock || 0) < 5 && p.active);
            } else if (filterOption === 'in_stock') {
                displayData = allData.filter(p => (p.stock || 0) > 0 && p.active);
            } else if (filterOption === 'inactive') {
                displayData = allData.filter(p => !p.active);
            } else if (filterOption === 'active') {
                displayData = allData.filter(p => p.active);
            }

            setProducts(displayData);
        } catch (error: any) {
            console.warn('Error cargando productos:', error?.message || error);
        } finally {
            setIsLoading(false);
        }
    };

    // Baja lógica (soft delete) y reactivación
    const handleToggleActive = async (id: string, currentActive: boolean) => {
        const actionText = currentActive ? "desactivar (baja lógica, no se borrarán pedidos históricos)" : "reactivar";
        if (!window.confirm(`¿Estás seguro de que deseas ${actionText} este producto?`)) return;

        try {
            const { error } = await supabase
                .from('products')
                .update({ active: !currentActive })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Producto ${currentActive ? 'desactivado' : 'reactivado'} correctamente.`);
            fetchProducts();
        } catch (error) {
            console.error('Error al actualizar estado del producto:', error);
            toast.error('Error al actualizar el producto.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Editorial Header Section */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-sans">Gestión de Productos</h1>
                    <p className="text-sm text-outline font-medium">Control integral de inventario por talle y catálogo de artículos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/products/create"
                        className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-md hover:bg-primary-dark transition-all duration-300"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Producto
                    </Link>
                </div>
            </section>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant p-6 rounded-2xl relative overflow-hidden group hover:border-primary transition-all duration-300 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container border border-primary flex items-center justify-center text-on-primary-container">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black tracking-wider text-on-primary-container bg-primary-container border border-primary px-2.5 py-1 rounded-full uppercase">Activos</span>
                    </div>
                    <p className="text-outline text-xs font-bold uppercase tracking-widest">Valuación de Stock</p>
                    <h2 className="text-3xl font-black text-on-surface mt-1 font-sans">${stats.valuation.toLocaleString("es-AR")}</h2>
                </div>

                <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant p-6 rounded-2xl relative overflow-hidden group hover:border-primary transition-all duration-300 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container border border-primary flex items-center justify-center text-on-primary-container">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black tracking-wider text-on-primary-container bg-primary-container border border-primary px-2.5 py-1 rounded-full uppercase">Disponibilidad</span>
                    </div>
                    <p className="text-outline text-xs font-bold uppercase tracking-widest">En Stock</p>
                    <h2 className="text-3xl font-black text-on-surface mt-1 font-sans">{stats.inStockRatio.toFixed(1)}%</h2>
                </div>

                <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant p-6 rounded-2xl relative overflow-hidden group hover:border-primary transition-all duration-300 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container border border-primary flex items-center justify-center text-on-primary-container">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black tracking-wider text-on-primary-container bg-primary-container border border-primary px-2.5 py-1 rounded-full uppercase">Alerta</span>
                    </div>
                    <p className="text-outline text-xs font-bold uppercase tracking-widest">Bajo Stock (&lt; 5)</p>
                    <h2 className="text-3xl font-black text-on-surface mt-1 font-sans">{stats.criticalAlerts}</h2>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => router.push("/admin/products")}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                        !filterOption ? "bg-primary text-on-primary" : "bg-surface-container text-outline hover:text-on-surface"
                    )}
                >
                    Todos
                </button>
                <button
                    onClick={() => router.push("/admin/products?filter=active")}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                        filterOption === 'active' ? "bg-primary text-on-primary" : "bg-surface-container text-outline hover:text-on-surface"
                    )}
                >
                    Activos
                </button>
                <button
                    onClick={() => router.push("/admin/products?filter=in_stock")}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                        filterOption === 'in_stock' ? "bg-primary text-on-primary" : "bg-surface-container text-outline hover:text-on-surface"
                    )}
                >
                    En Stock
                </button>
                <button
                    onClick={() => router.push("/admin/products?filter=low_stock")}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                        filterOption === 'low_stock' ? "bg-primary text-on-primary" : "bg-surface-container text-outline hover:text-on-surface"
                    )}
                >
                    Bajo Stock
                </button>
                <button
                    onClick={() => router.push("/admin/products?filter=inactive")}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                        filterOption === 'inactive' ? "bg-primary text-on-primary" : "bg-surface-container text-outline hover:text-on-surface"
                    )}
                >
                    Inactivos (Baja Lógica)
                </button>
            </div>

            {/* Products Table */}
            <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant bg-surface">
                                <th className="px-8 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Producto</th>
                                <th className="px-8 py-4 text-[10px] font-black text-outline uppercase tracking-widest hidden md:table-cell">Categoría</th>
                                <th className="px-8 py-4 text-[10px] font-black text-outline uppercase tracking-widest hidden md:table-cell">Estado / Stock</th>
                                <th className="px-8 py-4 text-[10px] font-black text-outline uppercase tracking-widest hidden md:table-cell">Cantidad</th>
                                <th className="px-8 py-4 text-[10px] font-black text-outline uppercase tracking-widest text-right">Precio</th>
                                <th className="px-8 py-4 text-[10px] font-black text-outline uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-outline">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-xs uppercase font-bold tracking-widest mt-2">Cargando inventario...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-outline">
                                        No hay productos para mostrar en este filtro.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const isLowStock = (product.stock || 0) > 0 && (product.stock || 0) < 5;
                                    const outOfStock = (product.stock || 0) === 0;
                                    const isActive = product.active !== false;

                                    return (
                                        <tr key={product.id} className={cn(
                                            "group hover:bg-surface-container-highest/30 transition-colors duration-200",
                                            !isActive && "opacity-60 bg-surface-container-lowest/50"
                                        )}>
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
                                                        <div className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-on-surface transition-colors" title={product.name}>
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-outline mt-0.5 flex items-center gap-2">
                                                            <span>SKU: {product.id.split('-')[0].toUpperCase()}</span>
                                                            {!isActive && (
                                                                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded font-bold uppercase">Inactivo</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 hidden md:table-cell">
                                                <span className="text-[10px] font-black text-on-surface-variant bg-surface-container-highest border border-outline-variant px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                                            </td>
                                            <td className="px-8 py-5 hidden md:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        !isActive ? "bg-gray-500" : outOfStock ? "bg-red-500 animate-pulse" : isLowStock ? "bg-amber-400 animate-pulse" : "bg-tertiary-container"
                                                    )}></span>
                                                    <span className={cn(
                                                        "text-xs font-black uppercase tracking-wider",
                                                        !isActive ? "text-outline" : outOfStock ? "text-red-500" : isLowStock ? "text-amber-400" : "text-primary"
                                                    )}>
                                                        {!isActive ? "Inactivo" : outOfStock ? "Sin Stock" : isLowStock ? "Bajo Stock" : "Disponible"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold text-on-surface hidden md:table-cell">{product.stock || 0} unidades</td>
                                            <td className="px-8 py-5 text-right font-black text-on-surface group-hover:text-on-surface transition-colors">${product.price.toLocaleString("es-AR")}</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link 
                                                        href={`/admin/products/${product.id}`}
                                                        className="p-2 hover:bg-primary-container text-on-primary-container border border-transparent hover:border-primary rounded-lg transition-colors"
                                                        title="Editar Producto y Stock por Talle"
                                                    >
                                                        <Edit className="w-4.5 h-4.5" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleToggleActive(product.id, isActive)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors border border-transparent",
                                                            isActive 
                                                                ? "hover:bg-red-500/20 text-red-400 hover:border-error/20" 
                                                                : "hover:bg-green-500/20 text-green-400 hover:border-green-500/20"
                                                        )}
                                                        title={isActive ? "Desactivar Producto (Baja Lógica)" : "Reactivar Producto"}
                                                    >
                                                        {isActive ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
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
