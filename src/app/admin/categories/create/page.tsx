"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCategory() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error: insertError } = await supabase
                .from('categories')
                .insert([
                    {
                        name: formData.name,
                        description: formData.description,
                    }
                ]);

            if (insertError) {
                throw new Error(insertError.message);
            }

            router.push("/admin/categories");

        } catch (error: any) {
            console.error(error);
            alert("Error al guardar: " + (error.message || "Ocurrió un error inesperado"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/categories"
                    className="p-2.5 bg-[#1c1d18] border border-[#2d2e26] rounded-xl hover:bg-[#252620] text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-(--foreground) mb-1 font-sans">Nueva Categoría</h1>
                    <p className="text-gray-400 text-sm">Crea una agrupación para tus productos.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#1c1d18]/60 backdrop-blur-md border border-[#2d2e26] rounded-2xl p-6 md:p-8 shadow-lg space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Nombre de la Categoría</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:outline-none focus:border-main focus:ring-1 focus:ring-main transition-all text-white"
                            placeholder="Ej: Remeras de Algodón"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Descripción (Opcional)</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:outline-none focus:border-main focus:ring-1 focus:ring-main transition-all text-white resize-none"
                            placeholder="Una breve descripción opcional..."
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-[#2d2e26] flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-main text-black px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,168,122,0.2)] transition-all disabled:opacity-50 text-sm uppercase tracking-wider"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {isLoading ? "Guardando..." : "Crear Categoría"}
                    </button>
                </div>
            </form>
        </div>
    );
}
