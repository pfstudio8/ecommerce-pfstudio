"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORY_TYPES: Record<string, string[]> = {
    "Llaveros": ["Círculo", "Corazón", "Camiseta", "Credencial Reforzada"],
    "Tazas": ["Mágicas", "Cerámica", "Chopp Cervecero"],
    "Gorras": ["Trucker", "Curva"],
    "Vasos": ["Térmico", "Vidrio", "Acrílico", "Chopp"],
    "Botineros": ["Normal"],
    "Accesorios": ["Mochila", "Riñonera", "Billetera", "Morral"],
    "Clásicas": ["Algodón Peinado", "Spun"],
    "Boxy Fit": ["Algodón Peinado"],
    "Oversize": ["Algodón Peinado"],
    "Buzos": ["Hoodie", "Cuello Redondo"],
    "Shorts": ["Deportivo", "Algodón"],
    "Pantalones": ["Jogger", "Cargo"]
};
export default function CreateProduct() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const [categories, setCategories] = useState<string[]>(["Clásicas", "Boxy Fit", "Oversize", "Buzos", "Pantalones", "Shorts", "Gorras", "Botineros", "Tazas", "Llaveros", "Vasos", "Accesorios"]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('name')
                    .order('name');
                if (data && !error) {
                    const filteredCats = data.map((c: any) => c.name).filter((name: string) => name !== 'Encendedores');
                    setCategories(filteredCats);
                    if (filteredCats.length > 0) {
                        setFormData(prev => ({ ...prev, category: filteredCats[0] }));
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
        description: "",
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
            const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
            const maxSizeBytes = 5 * 1024 * 1024; // 5MB
            
            const validFiles = filesArray.filter(file => {
                if (!validMimeTypes.includes(file.type)) {
                    toast.error(`El archivo ${file.name} no es un formato válido (solo JPG, PNG, WEBP).`);
                    return false;
                }
                if (file.size > maxSizeBytes) {
                    toast.error(`El archivo ${file.name} supera los 5MB.`);
                    return false;
                }
                return true;
            });

            setImageFiles(prev => [...prev, ...validFiles]);

            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
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
                        description: formData.description,
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
            toast.error("Error al guardar: " + (error.message || "Ocurrió un error inesperado"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex items-center gap-4 border-b border-surface-container-highest pb-6">
                <Link
                    href="/admin/products"
                    className="p-2.5 bg-surface-container-low border border-outline-variant rounded-xl hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-1 font-sans">Añadir Nuevo Producto</h1>
                    <p className="text-outline text-sm">Crea una nueva prenda para tu tienda.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface-container-low/60 backdrop-blur-md border border-outline-variant rounded-2xl p-6 md:p-8 shadow-lg space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-on-surface-variant">Nombre del Producto</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container transition-all text-on-surface"
                                placeholder="Ej: Remera Boxy Fit Negra"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant">Precio ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container transition-all text-on-surface"
                                    placeholder="25000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant">Departamento</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container transition-all text-on-surface"
                                >
                                    <option value="Hombres" className="bg-surface-container text-on-surface">Hombres</option>
                                    <option value="Mujeres" className="bg-surface-container text-on-surface">Mujeres</option>
                                    <option value="Niños" className="bg-surface-container text-on-surface">Niños</option>
                                </select>
                            </div>

                            <div className="col-span-1 sm:col-span-2 space-y-3">
                                <label className="text-sm font-semibold text-on-surface-variant">
                                    Seleccionar Categoría y Tipo
                                </label>
                                <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest">
                                    {categories.map((cat) => {
                                        const isSelectedCategory = formData.category === cat;
                                        const types = CATEGORY_TYPES[cat] || [];
                                        
                                        return (
                                            <div key={cat} className="border-b border-outline-variant last:border-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, category: cat, description: "" }))}
                                                    className={cn(
                                                        "w-full px-4 py-3 flex items-center justify-between transition-colors",
                                                        isSelectedCategory ? "bg-primary-container text-on-primary-container" : "hover:bg-surface-container text-on-surface"
                                                    )}
                                                >
                                                    <span className="font-bold text-sm">{cat}</span>
                                                    {types.length > 0 && (
                                                        <span className="material-symbols-outlined transition-transform duration-200" style={{ transform: isSelectedCategory ? "rotate(180deg)" : "rotate(0deg)" }}>
                                                            expand_more
                                                        </span>
                                                    )}
                                                </button>
                                                
                                                {isSelectedCategory && types.length > 0 && (
                                                    <div className="bg-surface-container-low px-4 py-3 space-y-2 border-t border-outline-variant/50 animate-in slide-in-from-top-2 duration-200">
                                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Selecciona el tipo:</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {types.map((type) => (
                                                                <button
                                                                    key={type}
                                                                    type="button"
                                                                    onClick={() => setFormData(prev => ({ ...prev, description: type }))}
                                                                    className={cn(
                                                                        "px-3 py-2 text-sm text-left rounded-lg transition-colors border",
                                                                        formData.description === type 
                                                                            ? "bg-tertiary-container text-on-tertiary-container border-tertiary font-bold" 
                                                                            : "bg-surface-container-lowest text-on-surface border-outline-variant hover:border-tertiary hover:bg-surface-container"
                                                                    )}
                                                                >
                                                                    {type}
                                                                </button>
                                                            ))}
                                                            {/* Custom write-in for unlisted types */}
                                                            <div className="col-span-2 mt-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Otro tipo (escribir aquí)..."
                                                                    value={!types.includes(formData.description) ? formData.description : ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                                    className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all text-on-surface"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 border border-outline-variant p-5 rounded-xl bg-surface-container/60">
                            <h3 className="text-sm font-semibold text-on-surface-variant border-b border-outline-variant pb-3">Stock por Tallas</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                    <div key={size} className="flex flex-col gap-1.5 relative">
                                        <span className="text-[10px] font-bold text-outline w-full text-center uppercase tracking-wider">{size}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stockSizes[size as keyof typeof stockSizes] ?? 0}
                                            onChange={(e) => setStockSizes({ ...stockSizes, [size]: parseInt(e.target.value) || 0 })}
                                            className="w-full text-center px-1 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-tertiary-container transition-all font-bold text-sm text-on-surface"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 p-4 border border-outline-variant bg-surface-container/60 rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isNew}
                                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                    className="w-5 h-5 accent-tertiary-container rounded border-outline-variant"
                                />
                                <span className="font-semibold text-sm text-on-surface-variant">Marcar como "NUEVO" en la tienda</span>
                            </label>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-on-surface-variant block">Fotografías del Producto (Frente, Espalda, etc.)</label>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square border border-outline-variant rounded-xl overflow-hidden group bg-surface-container">
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-on-surface p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative border-2 border-dashed border-outline-variant rounded-2xl h-36 flex flex-col items-center justify-center bg-surface-container hover:bg-surface-container-high/50 transition-colors cursor-pointer group">
                            <div className="text-center text-outline pointer-events-none">
                                <Upload className="w-6 h-6 mx-auto mb-2 text-tertiary-container transition-transform group-hover:scale-110" />
                                <p className="font-semibold text-sm text-on-surface">Haz clic para añadir fotos</p>
                                <p className="text-[10px] text-outline mt-1">PNG, JPG, WEBP hasta 5MB</p>
                            </div>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                multiple
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required={imagePreviews.length === 0}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-outline-variant flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-tertiary-container text-on-tertiary-container px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-tertiary-container/20 active:scale-95 disabled:opacity-50 text-sm uppercase tracking-wider"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {isLoading ? "Guardando..." : "Guardar Producto"}
                    </button>
                </div>

            </form>
        </div>
    );
}
