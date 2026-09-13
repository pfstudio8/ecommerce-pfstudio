"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateProduct() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const [categories, setCategories] = useState<string[]>(["Clásicas", "Boxy Fit", "Oversize", "Gorras", "Botineros", "Camisetas", "Tazas", "Encendedores", "Llaveros", "Vasos", "Accesorios"]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('name')
                    .order('name');
                if (data && !error) {
                    setCategories(data.map((c: any) => c.name));
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, category: data[0].name }));
                    }
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "Clásicas",
        department: "Hombres",
        isNew: false,
    });

    const [stockSizes, setStockSizes] = useState({
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
        XXL: 0
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...filesArray]);

            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let imageUrls: string[] = [];

            if (imageFiles.length > 0) {
                for (const file of imageFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (uploadError) {
                        throw new Error("Error subiendo imagen: " + uploadError.message);
                    }

                    const { data: publicUrlData } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(fileName);

                    imageUrls.push(publicUrlData.publicUrl);
                }
            }

            const totalStock = Object.values(stockSizes).reduce((acc, curr) => acc + curr, 0);

            const { data: productData, error: insertError } = await supabase
                .from('products')
                .insert([
                    {
                        name: formData.name,
                        price: parseFloat(formData.price),
                        category: formData.category,
                        department: formData.department,
                        isNew: formData.isNew,
                        images: imageUrls,
                        stock: totalStock,
                    }
                ])
                .select('id')
                .single();

            if (insertError || !productData) {
                throw new Error("Asegúrate de que la tabla 'products' existe en tu base de datos de Supabase. Detalles: " + (insertError?.message || "Sin ID retornado"));
            }

            const newProductId = productData.id;
            const stockEntries = Object.entries(stockSizes).map(([size, quantity]) => ({
                product_id: newProductId,
                size: size,
                stock_quantity: quantity,
                sku: `PF-${newProductId.substring(0, 5)}-${size}`
            }));

            const { error: stockError } = await supabase
                .from('product_stock')
                .insert(stockEntries);

            if (stockError) {
                console.error("Error inserting product_stock:", stockError);
            }

            router.push("/admin/products");

        } catch (error: any) {
            console.error(error);
            alert("Error al guardar: " + (error.message || "Ocurrió un error inesperado"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex items-center gap-4 border-b border-[#242520] pb-6">
                <Link
                    href="/admin/products"
                    className="p-2.5 bg-[#1c1d18] border border-[#2d2e26] rounded-xl hover:bg-[#252620] text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-(--foreground) mb-1 font-sans">Añadir Nuevo Producto</h1>
                    <p className="text-gray-400 text-sm">Crea una nueva prenda para tu tienda.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#1c1d18]/60 backdrop-blur-md border border-[#2d2e26] rounded-2xl p-6 md:p-8 shadow-lg space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300">Nombre del Producto</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:outline-none focus:border-main focus:ring-1 focus:ring-main transition-all text-white"
                                placeholder="Ej: Remera Boxy Fit Negra"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-300">Precio ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:outline-none focus:border-main focus:ring-1 focus:ring-main transition-all text-white"
                                    placeholder="25000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-300">Categoría</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:outline-none focus:border-main focus:ring-1 focus:ring-main transition-all text-white"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat} className="bg-[#12130f] text-white">{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-semibold text-gray-300">Departamento</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:outline-none focus:border-main focus:ring-1 focus:ring-main transition-all text-white"
                                >
                                    <option value="Hombres" className="bg-[#12130f] text-white">Hombres</option>
                                    <option value="Mujeres" className="bg-[#12130f] text-white">Mujeres</option>
                                    <option value="Niños" className="bg-[#12130f] text-white">Niños</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 border border-[#2d2e26] p-5 rounded-xl bg-[#12130f]/60">
                            <h3 className="text-sm font-semibold text-gray-300 border-b border-[#2d2e26] pb-3">Stock por Tallas</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                    <div key={size} className="flex flex-col gap-1.5 relative">
                                        <span className="text-[10px] font-bold text-gray-400 w-full text-center uppercase tracking-wider">{size}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stockSizes[size as keyof typeof stockSizes] ?? 0}
                                            onChange={(e) => setStockSizes({ ...stockSizes, [size]: parseInt(e.target.value) || 0 })}
                                            className="w-full text-center px-1 py-2.5 bg-[#1c1d18] border border-[#2d2e26] rounded-lg focus:outline-none focus:border-main transition-all font-bold text-sm text-white"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 p-4 border border-[#2d2e26] bg-[#12130f]/60 rounded-xl cursor-pointer hover:bg-[#12130f] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isNew}
                                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                    className="w-5 h-5 accent-main rounded border-[#2d2e26]"
                                />
                                <span className="font-semibold text-sm text-gray-300">Marcar como "NUEVO" en la tienda</span>
                            </label>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-gray-300 block">Fotografías del Producto (Frente, Espalda, etc.)</label>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square border border-[#2d2e26] rounded-xl overflow-hidden group bg-[#12130f]">
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative border-2 border-dashed border-[#2d2e26] rounded-2xl h-36 flex flex-col items-center justify-center bg-[#12130f] hover:bg-[#252620]/50 transition-colors cursor-pointer group">
                            <div className="text-center text-gray-400 pointer-events-none">
                                <Upload className="w-6 h-6 mx-auto mb-2 text-main transition-transform group-hover:scale-110" />
                                <p className="font-semibold text-sm text-gray-200">Haz clic para añadir fotos</p>
                                <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP hasta 5MB</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required={imagePreviews.length === 0}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-[#2d2e26] flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-main text-black px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-400 transition-all shadow-lg shadow-main/20 active:scale-95 disabled:opacity-50 text-sm uppercase tracking-wider"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {isLoading ? "Guardando..." : "Guardar Producto"}
                    </button>
                </div>

            </form>
        </div>
    );
}
