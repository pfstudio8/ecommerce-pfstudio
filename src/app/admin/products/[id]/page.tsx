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

    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "Clásicas",
        department: "Hombres",
        isNew: false,
    });

    const [stockSizes, setStockSizes] = useState<Record<string, number>>({
        S: 0,
        M: 0,
        L: 0,
        XL: 0
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
                    department: data.department || "Hombres",
                    isNew: data.isNew,
                });
                if (data.images && data.images.length > 0) {
                    setExistingImages(data.images);
                }

                // Fetch sizes if any
                const { data: stockData } = await supabase
                    .from('product_stock')
                    .select('*')
                    .eq('product_id', productId);

                if (stockData && stockData.length > 0) {
                    const loadedStock: Record<string, number> = { S: 0, M: 0, L: 0, XL: 0 };
                    stockData.forEach((s: any) => {
                        if (['S', 'M', 'L', 'XL'].includes(s.size)) {
                            loadedStock[s.size] = s.stock_quantity;
                        }
                    });
                    setStockSizes(loadedStock);
                } else {
                    // Si no tiene stock migrado, asume el stock total de la prenda en M (o dejalo vacio)
                    setStockSizes(prev => ({ ...prev, M: data.stock || 0 }));
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
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            setNewImageFiles(prev => [...prev, ...filesArray]);

            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setNewImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            let finalImageUrls = [...existingImages];

            // 1. Upload new image if present
            if (newImageFiles.length > 0) {
                for (const file of newImageFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (uploadError) throw uploadError;

                    const { data: publicUrlData } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(fileName);

                    finalImageUrls.push(publicUrlData.publicUrl);
                }
            }

            // Calculate legacy total
            const totalStock = Object.values(stockSizes).reduce((acc, curr) => acc + curr, 0);

            // 2. Update parent record
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    department: formData.department,
                    isNew: formData.isNew,
                    stock: totalStock,
                    images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
                })
                .eq('id', productId);

            if (updateError) throw updateError;

            // 3. Upsert specific sizes to product_stock
            const stockEntries = Object.entries(stockSizes).map(([size, quantity]) => ({
                product_id: productId,
                size: size,
                stock_quantity: quantity,
                sku: `PF-${productId.substring(0, 5)}-${size}`
            }));

            const { error: stockError } = await supabase
                .from('product_stock')
                .upsert(stockEntries, { onConflict: 'product_id, size' });

            if (stockError) {
                console.error("Error upserting product_stock:", stockError);
            }

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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Corte</label>
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

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Departamento</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:border-[var(--color-main)] transition-all"
                                >
                                    <option value="Hombres">Hombres</option>
                                    <option value="Mujeres">Mujeres</option>
                                    <option value="Niños">Niños</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 border border-gray-100 dark:border-zinc-800 p-5 rounded-xl bg-gray-50/50 dark:bg-zinc-950/50">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-zinc-800 pb-3">Stock por Tallas</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {['S', 'M', 'L', 'XL'].map((size) => (
                                    <div key={size} className="flex flex-col gap-2 relative">
                                        <span className="text-xs font-bold text-gray-500 w-full text-center">{size}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stockSizes[size]}
                                            onChange={(e) => setStockSizes({ ...stockSizes, [size]: parseInt(e.target.value) || 0 })}
                                            className="w-full text-center px-2 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:border-[var(--color-main)] transition-all font-bold text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
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
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fotografías del Producto (Frente, Espalda, etc.)</label>

                        {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {/* Existing Images */}
                                {existingImages.map((img, index) => (
                                    <div key={`existing-${index}`} className="relative aspect-square border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden group">
                                        <img src={img} alt="Existing" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                ))}

                                {/* New Image Previews */}
                                {newImagePreviews.map((preview, index) => (
                                    <div key={`new-${index}`} className="relative aspect-square border-2 border-[var(--color-main)] border-dashed rounded-lg overflow-hidden group">
                                        <img src={preview} alt="New Preview" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 left-2 bg-[var(--color-main)] text-white text-[10px] font-bold px-2 py-0.5 rounded">NUEVA</div>
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl h-32 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                            <div className="text-center text-gray-500 pointer-events-none">
                                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                <p className="font-semibold text-sm">Añadir más fotos</p>
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
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
