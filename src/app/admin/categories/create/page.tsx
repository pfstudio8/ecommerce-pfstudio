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
                    className="p-2 bg-[#1e212b] border border-[#2a2e3b] rounded-xl hover:bg-[#2a2e3b] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Nueva Categoría</h1>
                    <p className="text-gray-400 text-sm">Crea una agrupación para tus productos.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#0c0e15] border border-[#1e212b] rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Nombre de la Categoría</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-[#141722] border border-[#1e212b] rounded-xl focus:outline-none focus:ring-2 focus:border-blue-500 transition-all text-white"
                            placeholder="Ej: Remeras de Algodón"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Descripción (Opcional)</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-[#141722] border border-[#1e212b] rounded-xl focus:outline-none focus:ring-2 focus:border-blue-500 transition-all text-white resize-none"
                            placeholder="Una breve descripción opcional..."
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-[#1e212b] flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {isLoading ? "Guardando..." : "Crear Categoría"}
                    </button>
                </div>
            </form>
        </div>
    );
}
