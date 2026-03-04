"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const productId = resolvedParams.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "Clásicas",
        isNew: false,
        stock: "0",
    });

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    name: data.name,
                    price: data.price.toString(),
                    category: data.category,
                    isNew: data.isNew,
                    stock: (data.stock ?? 0).toString(),
                });
                if (data.images && data.images.length > 0) {
                    setImagePreview(data.images[0]);
                }
            }
        } catch (error) {
            console.error(error);
            alert("Error cargando el producto");
            router.push('/admin/products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            let imageUrl = imagePreview; // keep existing if no new file

            // 1. Upload new image if present
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrlData.publicUrl;
            }

            // 2. Update record
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    isNew: formData.isNew,
                    stock: parseInt(formData.stock, 10),
                    images: imageUrl && imageUrl !== imagePreview || imageFile ? [imageUrl] : undefined,
                })
                .eq('id', productId);

            if (updateError) throw updateError;

            router.push("/admin/products");

        } catch (error: any) {
            console.error(error);
            alert("Error al editar: " + (error.message || "Error inesperado"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" /></div>;
    }

    return (
        <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/products"
                    className="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Editar Producto</h1>
                    <p className="text-gray-500 text-sm">Modifica los detalles como el stock o precio.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre del Producto</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:border-[var(--color-main)] transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Precio ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:border-[var(--color-main)] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stock</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="1"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:border-[var(--color-main)] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Categoría</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:border-[var(--color-main)] transition-all"
                                >
                                    <option value="Clásicas">Clásicas</option>
                                    <option value="Boxy Fit">Boxy Fit</option>
                                    <option value="Oversize">Oversize</option>
                                </select>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.isNew}
                                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                className="w-5 h-5 accent-[var(--color-main)] rounded border-gray-300"
                            />
                            <span className="font-semibold text-sm">Marcar como "NUEVO" en la tienda</span>
                        </label>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fotografía Principal (Opcional)</label>
                        <div className="relative border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors group overflow-hidden">
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-semibold flex items-center gap-2">
                                            <Upload className="w-5 h-5" />
                                            Cambiar imagen
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6 text-gray-500">
                                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                                    <p className="font-semibold text-sm">Haz clic para subir imagen</p>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-2">Sube una nueva imagen sólo si deseas reemplazar la actual.</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-[var(--foreground)] text-[var(--background)] px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-main)] hover:text-white transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>

            </form>
        </div>
    );
}
