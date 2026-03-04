"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit, Trash2, Loader2, Package } from "lucide-react";
import Link from "next/link";
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
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.warn("Tabla 'products' puede no existir aún:", error.message);
                return;
            }
            setProducts(data || []);
        } catch (error: any) {
            console.warn('Error cargando productos:', error?.message || error);
            // Si la tabla no existe aún, devolvemos un log silencioso para no romper la demo
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error eliminando producto:', error);
            alert('Error al eliminar el producto.');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Productos</h1>
                    <p className="text-gray-500 text-sm">Gestiona el inventario de tu tienda</p>
                </div>
                <Link
                    href="/admin/products/create"
                    className="bg-[var(--foreground)] text-[var(--background)] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[var(--color-main)] hover:text-white transition-all shadow-md hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-gray-500">
                                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p>No hay productos creados aún.</p>
                                        <p className="text-xs text-gray-400 mt-1">Si la tabla 'products' de Supabase no existe, este listado estará vacío.</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden relative shrink-0">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-sm">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium">${product.price.toLocaleString()}</td>
                                        <td className="py-4 px-6 text-sm text-gray-500 uppercase tracking-wide text-xs">{product.category}</td>
                                        <td className="py-4 px-6 text-sm">
                                            <span className={cn(
                                                "font-bold",
                                                product.stock > 10 ? "text-emerald-500" : product.stock > 0 ? "text-amber-500" : "text-red-500"
                                            )}>
                                                {product.stock ?? 0}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {product.isNew ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 flex-shrink-0">
                                                    NUEVO
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300 flex-shrink-0">
                                                    NORMAL
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-500 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg shadow-sm transition-colors" title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg shadow-sm transition-colors" title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
