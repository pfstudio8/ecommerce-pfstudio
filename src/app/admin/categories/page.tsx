"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Loader2, Edit, Trash2, LayoutGrid, Filter, Archive, X, Save } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { sileo } from "sileo";

interface Category {
    id: string;
    name: string;
    description: string;
    created_at: string;
    productCount?: number;
}

const DEFAULT_CATEGORIES = [
    "Clásicas", 
    "Boxy Fit", 
    "Oversize", 
    "Gorras", 
    "Botineros", 
    "Camisetas", 
    "Tazas", 
    "Encendedores", 
    "Llaveros", 
    "Vasos", 
    "Accesorios"
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Edit modal states
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data: dbCategories, error: catError } = await supabase
                .from('categories')
                .select('*')
                .order('created_at', { ascending: false });

            const { data: productsData } = await supabase
                .from('products')
                .select('category');

            const countsMap: Record<string, number> = {};
            if (productsData) {
                productsData.forEach(p => {
                    if (p.category) {
                        countsMap[p.category] = (countsMap[p.category] || 0) + 1;
                    }
                });
            }

            const existingNamesSet = new Set<string>();
            const categoryList: Category[] = [];

            if (!catError && dbCategories) {
                dbCategories.forEach(c => {
                    existingNamesSet.add(c.name.toLowerCase());
                    categoryList.push({
                        ...c,
                        productCount: countsMap[c.name] || 0
                    });
                });
            }

            const allExtraNames = new Set<string>([
                ...DEFAULT_CATEGORIES,
                ...(productsData ? productsData.map(p => p.category).filter(Boolean) : [])
            ]);

            allExtraNames.forEach(name => {
                if (!existingNamesSet.has(name.toLowerCase())) {
                    existingNamesSet.add(name.toLowerCase());
                    categoryList.push({
                        id: `sys-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                        name: name,
                        description: "Categoría activa del catálogo",
                        created_at: new Date().toISOString(),
                        productCount: countsMap[name] || 0
                    });
                }
            });

            setCategories(categoryList);
        } catch (err) {
            console.error("Error fetching categories", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEdit = (category: Category) => {
        setEditingCategory(category);
        setEditName(category.name);
        setEditDescription(category.description || "");
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || !editName.trim()) return;

        setIsSaving(true);
        const oldName = editingCategory.name;
        const newName = editName.trim();
        const newDesc = editDescription.trim();

        try {
            if (editingCategory.id.startsWith('sys-')) {
                // Insert into DB categories table
                const { error: insertErr } = await supabase
                    .from('categories')
                    .insert([{ name: newName, description: newDesc }]);
                
                if (insertErr && !insertErr.message.includes('duplicate')) {
                    throw insertErr;
                }
            } else {
                // Update in categories table
                const { error: updateErr } = await supabase
                    .from('categories')
                    .update({ name: newName, description: newDesc })
                    .eq('id', editingCategory.id);

                if (updateErr) throw updateErr;
            }

            // Sync updated category name in products table if changed
            if (oldName !== newName) {
                await supabase
                    .from('products')
                    .update({ category: newName })
                    .eq('category', oldName);
            }

            sileo.success({ title: "Categoría actualizada", description: `"${newName}"` });
            setEditingCategory(null);
            await fetchCategories();
        } catch (err: any) {
            console.error("Error updating category", err);
            sileo.error({ title: "Error al actualizar", description: err.message || "Intenta de nuevo" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"?`)) return;

        if (id.startsWith('sys-')) {
            setCategories(categories.filter(c => c.id !== id));
            sileo.info({ title: "Categoría eliminada de la vista" });
            return;
        }

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (!error) {
                setCategories(categories.filter(c => c.id !== id));
                sileo.success({ title: "Categoría eliminada con éxito" });
            } else {
                sileo.error({ title: "No se pudo eliminar", description: error.message });
            }
        } catch (err) {
            console.error("Error deleting category", err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-main" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 font-sans">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242520] pb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">Categorías</h2>
                    <p className="text-gray-400 mt-1 text-sm font-medium">Administra y organiza las colecciones y categorías de productos.</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/categories/create"
                        className="px-6 py-2.5 bg-main text-black rounded-xl font-bold text-sm shadow-lg shadow-main/20 hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Categoría
                    </Link>
                </div>
            </header>

            {/* Listado de Categorías */}
            <div className="mt-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 font-sans">
                        <LayoutGrid className="w-5 h-5 text-main" />
                        Listado de Categorías ({categories.length})
                    </h3>
                </div>
                
                <div className="bg-[#1c1d18]/60 backdrop-blur-md rounded-2xl overflow-hidden border border-[#2d2e26] shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#12130f]/60 border-b border-[#2d2e26]">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Nombre de Categoría</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Descripción</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">SKUs / Productos</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2d2e26]">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-500">
                                            <Archive className="w-12 h-12 mx-auto text-gray-500/50 mb-3" />
                                            <p className="text-sm font-medium">No hay categorías creadas aún.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-[#252620]/30 transition-colors group">
                                            <td className="px-6 py-5 font-mono text-xs text-main font-bold">
                                                {category.id.startsWith('sys-') ? category.id.toUpperCase() : category.id.substring(0, 8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-5 font-bold text-foreground group-hover:text-white transition-colors">
                                                {category.name}
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-400">
                                                {category.description || '-'}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-main/10 text-main border border-main/20">
                                                    {category.productCount || 0} SKUs
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
                                                    <button
                                                        onClick={() => handleOpenEdit(category)}
                                                        className="p-2 text-main hover:bg-main/20 border border-transparent hover:border-main/20 rounded-lg transition-colors cursor-pointer"
                                                        title="Editar Categoría"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id, category.name)}
                                                        className="p-2 text-red-400 hover:bg-red-500/20 border border-transparent hover:border-red-500/20 rounded-lg transition-colors cursor-pointer"
                                                        title="Eliminar Categoría"
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

            {/* MODAL DE EDICIÓN DE CATEGORÍA */}
            <AnimatePresence>
                {editingCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingCategory(null)}
                            className="fixed inset-0 bg-black/75 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#1c1d18] border border-[#2d2e26] rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative z-10 text-left overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-[#2d2e26] pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
                                        <Edit className="w-5 h-5 text-main" />
                                        Editar Categoría
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Modifica el nombre y descripción de la categoría.</p>
                                </div>
                                <button
                                    onClick={() => setEditingCategory(null)}
                                    className="p-1.5 hover:bg-[#252620] rounded-xl text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveEdit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Nombre de Categoría</label>
                                    <input
                                        type="text"
                                        required
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:outline-none focus:border-main transition-all text-white text-sm"
                                        placeholder="Ej: Remeras Boxy Fit"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Descripción (Opcional)</label>
                                    <textarea
                                        rows={3}
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:outline-none focus:border-main transition-all text-white text-sm resize-none"
                                        placeholder="Descripción o información adicional..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-[#2d2e26] flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingCategory(null)}
                                        className="px-5 py-2.5 border border-[#2d2e26] text-gray-300 hover:bg-[#252620] rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2.5 bg-main hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider shadow-lg shadow-main/20"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
