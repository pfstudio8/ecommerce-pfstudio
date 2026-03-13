"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Plus, Loader2, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
    description: string;
    created_at: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setCategories(data);
            } else if (error) {
                console.warn("Categories table might not exist yet:", error.message);
            }
        } catch (err) {
            console.error("Error fetching categories", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"?`)) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (!error) {
                setCategories(categories.filter(c => c.id !== id));
            } else {
                alert("No se pudo eliminar la categoría. " + error.message);
            }
        } catch (err) {
            console.error("Error deleting category", err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Categorías</h1>
                    <p className="text-sm text-gray-400">Administra las colecciones de tu tienda.</p>
                </div>
                <Link
                    href="/admin/categories/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Categoría
                </Link>
            </div>

            <div className="bg-[#0c0e15] rounded-2xl border border-[#1e212b] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/5 dark:bg-zinc-900/30 border-b border-[#1e212b]">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e212b]">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-16 text-center text-gray-500">
                                        <Package className="w-12 h-12 mx-auto text-gray-500/50 mb-3" />
                                        <p>No hay categorías creadas aún.</p>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-[#141722] transition-colors">
                                        <td className="py-4 px-6 text-[var(--foreground)] font-medium">
                                            {category.name}
                                        </td>
                                        <td className="py-4 px-6 text-gray-400 text-sm">
                                            {category.description || '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => alert('Edición de categorías próximamente')}
                                                    className="p-2 text-gray-400 hover:text-blue-500 bg-[#1e212b] rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id, category.name)}
                                                    className="p-2 text-gray-400 hover:text-red-500 bg-[#1e212b] rounded-lg transition-colors"
                                                    title="Eliminar"
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
