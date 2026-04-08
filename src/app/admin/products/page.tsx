"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit, Trash2, Loader2, Package, Filter, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
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
            // We fetch all products first to calculate global stats, then apply filters in memory for display, 
            // OR we can fetch them all and just filter the array state.
            // Since this is an admin dashboard showing stats, let's fetch all and filter in memory to keep the stats accurate.
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
        return <div className="flex justify-center items-center py-40 min-h-[50vh]"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Editorial Header Section */}
            <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 font-sans">Inventory Ledger</h1>
                    <p className="text-gray-400 font-medium">Curating {stats.total} active products across your catalog.</p>
                </div>
                <Link
                    href="/admin/products/create"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:opacity-90 transition-all scale-100 hover:scale-[1.02] active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Product
                </Link>
            </section>

            {/* Bento Stats (Jewel Components) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-600 p-6 rounded-xl relative overflow-hidden border border-white/5 group">
                    <div className="relative z-10">
                        <span className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1 block">Total Valuation</span>
                        <div className="text-3xl font-black text-white">${stats.valuation.toLocaleString("es-AR")}</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <DollarSign className="w-32 h-32 text-black" />
                    </div>
                </div>
                <div className="bg-emerald-500 p-6 rounded-xl relative overflow-hidden border border-white/5 group">
                    <div className="relative z-10">
                        <span className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1 block">In Stock Ratio</span>
                        <div className="text-3xl font-black text-white">{stats.inStockRatio.toFixed(1)}%</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <CheckCircle className="w-32 h-32 text-black" />
                    </div>
                </div>
                <div className="bg-red-500 p-6 rounded-xl relative overflow-hidden border border-white/5 group">
                    <div className="relative z-10">
                        <span className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1 block">Critical Alerts</span>
                        <div className="text-3xl font-black text-white">{stats.criticalAlerts} Items</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <AlertCircle className="w-32 h-32 text-black" />
                    </div>
                </div>
            </div>

            {/* Main Products Ledger (Table) */}
            <div className="bg-[#0c0e15] border border-[#1e212b] rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between bg-[#141722] gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-2 text-white font-bold text-sm shrink-0">
                            <Filter className="w-4 h-4" />
                            Filters
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => router.push('/admin/products')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors",
                                    !filterOption ? "bg-white/10 text-white" : "bg-[#1e212b] text-gray-400 hover:text-white"
                                )}
                            >
                                All Products
                            </button>
                            <button 
                                onClick={() => router.push('/admin/products?filter=in_stock')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors",
                                    filterOption === 'in_stock' ? "bg-emerald-500/20 text-emerald-400" : "bg-[#1e212b] text-emerald-500/70 hover:bg-emerald-500/10"
                                )}
                            >
                                In Stock
                            </button>
                            <button 
                                onClick={() => router.push('/admin/products?filter=low_stock')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors",
                                    filterOption === 'low_stock' ? "bg-red-500/20 text-red-500" : "bg-[#1e212b] text-red-500/70 hover:bg-red-500/10"
                                )}
                            >
                                Low Inventory
                            </button>
                        </div>
                    </div>
                    <div className="text-gray-400 text-xs font-medium">Showing {products.length} of {stats.total}</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] bg-[#0c0e15] border-b border-[#1e212b]">
                                <th className="px-8 py-4">Product Identity</th>
                                <th className="px-8 py-4">Category</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Stock</th>
                                <th className="px-8 py-4 text-right">MSRP</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e212b]">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-500">
                                        <Package className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                                        <p className="font-medium text-gray-400">No products match this filter.</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const isLowStock = (product.stock || 0) < 5;
                                    const outOfStock = (product.stock || 0) === 0;

                                    return (
                                        <tr key={product.id} className="group hover:bg-[#141722] transition-colors duration-200">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-[#1e212b] border border-[#2a2e3b] overflow-hidden shrink-0 flex items-center justify-center">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white line-clamp-1" title={product.name}>{product.name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">SKU: {product.id.split('-')[0].toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-gray-300 bg-[#1e212b] px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        outOfStock ? "bg-red-600" : isLowStock ? "bg-red-400" : "bg-emerald-500"
                                                    )}></span>
                                                    <span className={cn(
                                                        "text-xs font-bold",
                                                        outOfStock ? "text-red-600" : isLowStock ? "text-red-400" : "text-emerald-500"
                                                    )}>
                                                        {outOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-medium text-white">{product.stock || 0} units</td>
                                            <td className="px-8 py-5 text-right font-bold text-white">${product.price.toLocaleString("es-AR")}</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <Link 
                                                        href={`/admin/products/${product.id}`}
                                                        className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                                                        title="Edit Product"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
