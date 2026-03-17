"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore, CartStore } from "@/store/cart";
import { sileo } from "sileo";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function CustomShirtModule() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedShirtType, setSelectedShirtType] = useState<string | null>(null);
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addItem = useCartStore((state: CartStore) => state.addItem);

    const sizes = ["S", "M", "L", "XL"];

    const [shirtTypes, setShirtTypes] = useState([
        { id: "oversize", label: "Oversize", price: 20000 },
        { id: "boxy", label: "Boxy Fit", price: 17000 },
        { id: "clasica-mujer", label: "Clásica Mujer", price: 15000 },
        { id: "clasica-hombre", label: "Clásica Hombre", price: 15000 },
        { id: "clasica-nino", label: "Clásica Niño", price: 10000 },
    ]);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('name, category, price');
                
                if (error) throw error;
                if (data) {
                    const updatedTypes = [
                        { 
                            id: "oversize", 
                            label: "Oversize", 
                            price: data.find(p => p.category === "Oversize")?.price || 20000 
                        },
                        { 
                            id: "boxy", 
                            label: "Boxy Fit", 
                            price: data.find(p => p.category === "Boxy Fit")?.price || 17000 
                        },
                        { 
                            id: "clasica-mujer", 
                            label: "Clásica Mujer", 
                            price: data.find(p => p.category === "Clásicas" && p.name.includes("Mujer"))?.price || 15000 
                        },
                        { 
                            id: "clasica-hombre", 
                            label: "Clásica Hombre", 
                            price: data.find(p => p.category === "Clásicas" && p.name.includes("Hombre"))?.price || 15000 
                        },
                        { 
                            id: "clasica-nino", 
                            label: "Clásica Niño", 
                            price: data.find(p => p.category === "Clásicas" && p.name.includes("Niño"))?.price || 10000 
                        },
                    ];
                    setShirtTypes(updatedTypes);
                }
            } catch (error) {
                console.error("Error fetching shirt prices:", error);
            } finally {
                setIsLoadingPrices(false);
            }
        };

        fetchPrices();
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAddToCart = () => {
        if (!selectedSize || !selectedImage || !selectedShirtType) {
            alert("Por favor sube una imagen, selecciona un modelo de remera y una talla.");
            return;
        }

        const selectedTypeData = shirtTypes.find(t => t.id === selectedShirtType);
        const price = selectedTypeData ? selectedTypeData.price : 20000;
        const productName = `Remera Personalizada - ${selectedTypeData?.label || 'Estándar'}`;

        // Add to global cart as a custom product
        const customProduct = {
            id: `custom-${selectedShirtType}-${Date.now()}`,
            name: productName,
            price: price,
            category: "Custom",
            images: [selectedImage],
        };

        addItem(customProduct, selectedSize);
        sileo.success({ title: `¡Agregado al carrito: ${productName}!` });

        // Reset state
        setSelectedImage(null);
        setSelectedSize(null);
        setSelectedShirtType(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <section className="py-24 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 overflow-hidden" id="personalizadas">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center mb-16 text-center"
                >
                    <h2 className="text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
                        Crea Tu Propio Diseño
                    </h2>
                    <div className="w-24 h-1 bg-[var(--color-main)] mb-6"></div>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">
                        Sube la imagen que quieras y nosotros la estampamos en nuestras prendas premium de alta calidad. Tu imaginación es el único límite.
                    </p>
                </motion.div>

                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-start">

                    {/* Image Upload Area */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex-1 w-full relative"
                    >
                        {!selectedImage ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-main)] hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors aspect-[4/5] bg-gray-50 dark:bg-zinc-900 overflow-hidden"
                            >
                                <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">Sube tu Diseño</h3>
                                <p className="text-sm text-gray-500 max-w-[250px]">
                                    Haz clic aquí o arrastra tu imagen (PNG, JPG o WebP) de alta calidad.
                                </p>
                            </div>
                        ) : (
                            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl group">
                                <img
                                    src={selectedImage}
                                    alt="Tu diseño personalizado"
                                    className="w-full h-full object-contain p-4"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                    title="Quitar diseño"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                <div className="absolute inset-0 border-4 border-[var(--color-main)] pointer-events-none opacity-50 rounded-xl"></div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                    </motion.div>

                    {/* Controls Area */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex-1 w-full flex flex-col"
                    >
                        <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm">
                            <h3 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
                                <ImageIcon className="w-6 h-6 text-[var(--color-main)]" />
                                Detalles del Pedido
                            </h3>

                            {/* Dynamic Price Display */}
                            <p className="text-3xl font-bold text-[var(--color-main)] mb-8 flex items-end gap-1">
                                {isLoadingPrices && selectedShirtType ? (
                                    <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded mt-1"></div>
                                ) : (
                                    <>
                                        ${selectedShirtType
                                            ? shirtTypes.find(t => t.id === selectedShirtType)?.price.toLocaleString("es-AR")
                                            : "..."}
                                        <span className="text-sm font-normal text-gray-500 mb-1">ARS</span>
                                    </>
                                )}
                            </p>

                            <div className="mb-6">
                                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Selecciona el Modelo</h4>
                                <div className="flex flex-col gap-2">
                                    {shirtTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedShirtType(type.id)}
                                            className={`w-full py-3 px-4 rounded-lg border-2 flex items-center justify-between text-left font-semibold transition-all ${selectedShirtType === type.id
                                                ? "border-[var(--color-main)] bg-[var(--color-main)]/10 text-[var(--color-main)] dark:bg-[var(--color-main)]/20"
                                                : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-500"
                                                }`}
                                        >
                                            <span>{type.label}</span>
                                            <span className="text-sm font-normal">
                                                {isLoadingPrices ? <div className="w-16 h-4 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded"></div> : `$${type.price.toLocaleString("es-AR")}`}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Selecciona tu Talla</h4>
                                <div className="flex flex-wrap gap-3">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${selectedSize === size
                                                ? "border-[var(--color-main)] bg-[var(--color-main)] text-white shadow-md scale-105"
                                                : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-950 p-4 rounded-lg border border-gray-100 dark:border-zinc-800 mb-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                <ul className="list-disc pl-5 space-y-1">

                                    <li>Algodón Premium 24/1 Peinado.</li>
                                    <li>Estampado DTF de altísima duración.</li>
                                    <li>Demora de confección: 48-72hs hábiles.</li>
                                    <li>RECOMENDACION: Lavar pasadas las 48hs de recibido el producto.</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={!selectedSize || !selectedImage || !selectedShirtType}
                                className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-main)] hover:text-white transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-1"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {(!selectedSize || !selectedImage || !selectedShirtType) ? "Completa todos los campos" : "Agregar Carrito"}
                            </button>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
