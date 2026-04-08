"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Plus, Loader2, Edit, Trash2, ArrowRight, Download, TrendingUp, Calendar, Filter, LayoutGrid, MoreVertical, Archive } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
            <div className="flex h-[60vh] justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">Categories</h2>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/categories/create"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Collection
                    </Link>
                </div>
            </header>



            {/* Categories Visual Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Card 1: T-Shirts */}
                <div className="group relative bg-[#0c0e15] border border-[#1e212b] rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-2">
                    <div className="h-40 relative group-hover:scale-105 transition-transform duration-700 bg-gradient-to-br from-emerald-500/80 via-emerald-800/40 to-[#0c0e15]">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e15] via-transparent to-transparent opacity-80"></div>
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
                            <span className="text-[10px] font-bold text-white">1,240 SKUs</span>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Core Line</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1">T-Shirts</h4>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">Premium t-shirts, hoodies, and foundational basics.</p>
                        <button className="text-blue-500 text-[10px] uppercase font-bold flex items-center gap-1 group/btn hover:text-blue-400 transition-colors">
                            Manage Line 
                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Category Card 2: HOODIES */}
                <div className="group relative bg-[#0c0e15] border border-[#1e212b] rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-2">
                    <div className="h-40 relative group-hover:scale-105 transition-transform duration-700 bg-gradient-to-br from-blue-500/80 via-blue-800/40 to-[#0c0e15]">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e15] via-transparent to-transparent opacity-80"></div>
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
                            <span className="text-[10px] font-bold text-white">856 SKUs</span>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Handcrafted</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1">HOODIES</h4>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">Artisanal jeans, jackets, and vintage-wash pieces.</p>
                        <button className="text-blue-500 text-[10px] uppercase font-bold flex items-center gap-1 group/btn hover:text-blue-400 transition-colors">
                            Manage Line 
                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Category Card 3: Accessories */}
                <div className="group relative bg-[#0c0e15] border border-[#1e212b] rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-2">
                    <div className="h-40 relative group-hover:scale-105 transition-transform duration-700 bg-gradient-to-br from-purple-500/80 via-purple-800/40 to-[#0c0e15]">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e15] via-transparent to-transparent opacity-80"></div>
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
                            <span className="text-[10px] font-bold text-white">612 SKUs</span>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Accents</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1">Accessories</h4>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">Italian leather belts, signature hats, and travel bags.</p>
                        <button className="text-blue-500 text-[10px] uppercase font-bold flex items-center gap-1 group/btn hover:text-blue-400 transition-colors">
                            Manage Line 
                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Clothing Inventory Index (Secondary View) */}
            <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-blue-500" />
                        Collection Inventory
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-2 bg-[#0c0e15] border border-[#1e212b] rounded-lg text-gray-400 hover:text-white transition-colors" title="Filtrar">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <div className="bg-[#0c0e15] rounded-xl overflow-hidden border border-[#1e212b] shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/5 dark:bg-zinc-900/30 border-b border-[#1e212b]">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e212b]">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center text-gray-500">
                                            <Archive className="w-12 h-12 mx-auto text-gray-500/50 mb-3" />
                                            <p>No hay categorías creadas aún.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-[#141722] transition-colors group">
                                            <td className="px-6 py-5 font-mono text-xs text-blue-500">
                                                {category.id.substring(0, 8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-5 font-bold text-white">
                                                {category.name}
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-400">
                                                {category.description || '-'}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => alert('Edición de categorías próximamente')}
                                                        className="p-2 text-gray-400 hover:text-blue-500 bg-[#1e212b]/50 hover:bg-[#1e212b] rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id, category.name)}
                                                        className="p-2 text-gray-400 hover:text-red-500 bg-[#1e212b]/50 hover:bg-[#1e212b] rounded-lg transition-colors"
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
        </div>
    );
}
