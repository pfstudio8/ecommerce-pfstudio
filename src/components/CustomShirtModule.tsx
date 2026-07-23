"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, ShoppingCart, Trash2, Shirt, Beer, Crown, Key, CupSoda, Check } from "lucide-react";
import { useCartStore, CartStore } from "@/store/cart";
import { sileo } from "sileo";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export interface InsumoOption {
    id: string;
    label: string;
    price: number;
}

export interface InsumoCategory {
    id: string;
    name: string;
    icon: any;
    defaultVariant: string;
    variants: string[];
    specs: string[];
    options: InsumoOption[];
}

export default function CustomShirtModule() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<string>("remeras");
    const [selectedItemType, setSelectedItemType] = useState<string>("oversize");
    const [selectedVariant, setSelectedVariant] = useState<string>("M");
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addItem = useCartStore((state: CartStore) => state.addItem);

    // Dynamic Insumo Categories & Items
    const [categories, setCategories] = useState<InsumoCategory[]>([
        {
            id: "remeras",
            name: "Remeras",
            icon: Shirt,
            defaultVariant: "M",
            variants: ["S", "M", "L", "XL", "XXL"],
            specs: [
                "Algodón Premium 24/1 Peinado.",
                "Estampado DTF / Sublimación de altísima duración.",
                "Demora de confección: 48-72hs hábiles.",
                "RECOMENDACION: Lavar pasadas las 48hs, a mano con agua fría y sin suavizante."
            ],
            options: [
                { id: "oversize", label: "Oversize", price: 20000 },
                { id: "boxy", label: "Boxy Fit", price: 17000 },
                { id: "clasica-mujer", label: "Clásica Mujer", price: 13000 },
                { id: "clasica-hombre", label: "Clásica Hombre", price: 15000 },
                { id: "clasica-nino", label: "Clásica Niño", price: 7000 },
            ]
        },
        {
            id: "chopps-tazas",
            name: "Chopps & Tazas",
            icon: Beer,
            defaultVariant: "Standard 330ml",
            variants: ["Standard 330ml", "Grande 500ml"],
            specs: [
                "Vidrio Esmerilado o Cerámica Importada de alta resistencia.",
                "Sublimación Full HD apta para microondas y lavados cotidianos.",
                "Demora de producción: 24-48hs hábiles.",
                "Ideal para regalos personalizados, eventos o merchandising."
            ],
            options: [
                { id: "chopp-vidrio", label: "Chopp Vidrio Esmerilado", price: 14000 },
                { id: "chopp-ceramico", label: "Chopp Cerámico", price: 15000 },
                { id: "taza-ceramica", label: "Taza Cerámica Importada", price: 8500 },
                { id: "taza-magica", label: "Taza Mágica Termosensible", price: 11000 },
            ]
        },
        {
            id: "gorras",
            name: "Gorras",
            icon: Crown,
            defaultVariant: "Talle Único",
            variants: ["Talle Único Ajustable"],
            specs: [
                "Frente de poliéster de alta densidad especial para sublimación HD.",
                "Cierre regulable para adaptarse a cualquier medida.",
                "Demora de producción: 24-48hs hábiles.",
                "Excelente durabilidad y colores vívidos."
            ],
            options: [
                { id: "gorra-trucker", label: "Gorra Trucker (Frente Blanco)", price: 9500 },
                { id: "gorra-dadhat", label: "Gorra Dad Hat / Gabardina", price: 12000 },
                { id: "gorra-snapback", label: "Gorra Snapback Premium", price: 13500 },
            ]
        },
        {
            id: "llaveros-acc",
            name: "Llaveros & Acc.",
            icon: Key,
            defaultVariant: "Talle Único",
            variants: ["Talle Único"],
            specs: [
                "Polímero / Metal reforzado de alta durabilidad.",
                "Sublimación nítida de doble cara o frente según modelo.",
                "Demora de producción: 24-48hs hábiles.",
                "Resistente al roce cotidiano y desgaste."
            ],
            options: [
                { id: "llavero-polimero", label: "Llavero de Polímero", price: 3500 },
                { id: "llavero-metal", label: "Llavero Metálico", price: 5000 },
                { id: "encendedor", label: "Encendedor Sublimable", price: 6500 },
                { id: "botinero", label: "Botinero Personalizado", price: 16000 },
            ]
        },
        {
            id: "vasos-botellas",
            name: "Vasos & Botellas",
            icon: CupSoda,
            defaultVariant: "500ml",
            variants: ["500ml", "750ml"],
            specs: [
                "Aluminio / Acero Inoxidable apto para bebidas.",
                "Impresión 360° en alta definición.",
                "Mantiene bebidas frías o calientes por más tiempo.",
                "Demora de producción: 24-48hs hábiles."
            ],
            options: [
                { id: "vaso-termico", label: "Vaso Térmico Sublimable", price: 15000 },
                { id: "botella-deportiva", label: "Botella Deportiva Aluminio", price: 13000 },
            ]
        }
    ]);

    // Fetch prices dynamically from DB if available
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('name, category, price');

                if (error) throw error;
                if (data && data.length > 0) {
                    setCategories(prevCategories => {
                        return prevCategories.map(cat => ({
                            ...cat,
                            options: cat.options.map(opt => {
                                const dbMatch = data.find(p =>
                                    p.name.toLowerCase().includes(opt.label.toLowerCase()) ||
                                    p.category.toLowerCase().includes(opt.label.toLowerCase())
                                );
                                return dbMatch ? { ...opt, price: dbMatch.price } : opt;
                            })
                        }));
                    });
                }
            } catch (error) {
                console.error("Error fetching insumo prices:", error);
            } finally {
                setIsLoadingPrices(false);
            }
        };

        fetchPrices();
    }, []);

    // Get current category & selected option
    const activeCategory = categories.find(c => c.id === activeCategoryId) || categories[0];
    const currentOption = activeCategory.options.find(o => o.id === selectedItemType) || activeCategory.options[0];

    const handleCategoryChange = (catId: string) => {
        setActiveCategoryId(catId);
        const newCat = categories.find(c => c.id === catId);
        if (newCat && newCat.options.length > 0) {
            setSelectedItemType(newCat.options[0].id);
            setSelectedVariant(newCat.defaultVariant);
        }
    };

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
        if (!selectedImage) {
            alert("Por favor sube una imagen con tu diseño.");
            return;
        }

        if (!selectedItemType || !currentOption) {
            alert("Por favor selecciona un producto o insumo.");
            return;
        }

        const price = currentOption.price;
        const productName = `Sublimación - ${currentOption.label}`;

        // Add to global cart as a custom product
        const customProduct = {
            id: `custom-${selectedItemType}-${Date.now()}`,
            name: productName,
            price: price,
            category: "Custom Sublimación",
            images: [selectedImage],
            stock: 9999
        };

        addItem(customProduct as any, selectedVariant || "Único");
        sileo.success({ title: `¡Agregado al carrito: ${productName}!` });

        // Reset image selection
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <section className="py-16 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 relative overflow-hidden" id="personalizador">
            {/* Elegant Grid Background overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-white/80 dark:to-zinc-950/80 pointer-events-none z-0"></div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center mb-10 text-center"
                >
                    <span className="text-xs font-bold uppercase tracking-widest text-main bg-main/10 border border-[var(--color-main)]/20 px-4 py-1.5 rounded-full mb-3">
                        STUDIO CUSTOM & SUBLIMACIÓN
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-(--foreground) mb-3 uppercase">
                        Crea Tu Propio Diseño
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-sm sm:text-base">
                        Elegí tu insumo (remeras, chopps, gorras, llaveros, tazas, vasos y más), subí tu diseño y nosotros lo estampamos con calidad profesional.
                    </p>

                    {/* Integrated 3-Step Process Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mt-6 p-2 rounded-2xl bg-gray-100/60 dark:bg-zinc-900/40 border-2 border-main/30 dark:border-main/40 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border-2 border-main/60 dark:border-main/70 shadow-md text-left transition-all hover:border-main">
                            <span className="w-8 h-8 rounded-lg bg-main text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                                01
                            </span>
                            <div>
                                <p className="text-xs font-extrabold text-[var(--foreground)] uppercase tracking-wide">1. Elegí tu Insumo</p>
                                <p className="text-[11px] text-main font-bold">{activeCategory.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border-2 border-main/40 dark:border-main/50 shadow-md text-left transition-all hover:border-main">
                            <span className="w-8 h-8 rounded-lg bg-main/20 text-main dark:bg-main/30 dark:text-main font-extrabold text-xs flex items-center justify-center flex-shrink-0 border border-main/30">
                                02
                            </span>
                            <div>
                                <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wide">2. Subí tu Diseño</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Imagen PNG, JPG o WebP</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border-2 border-main/40 dark:border-main/50 shadow-md text-left transition-all hover:border-main">
                            <span className="w-8 h-8 rounded-lg bg-main/20 text-main dark:bg-main/30 dark:text-main font-extrabold text-xs flex items-center justify-center flex-shrink-0 border border-main/30">
                                03
                            </span>
                            <div>
                                <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wide">3. Hacé tu Pedido</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Agregá al carrito y listo</p>
                            </div>
                        </div>
                    </div>

                    {/* Category Selector Tabs (Insumos) */}
                    <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-4xl w-full">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeCategoryId === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-xs sm:text-sm font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-main text-white border-main shadow-lg shadow-main/30 scale-105"
                                            : "bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600 hover:text-white"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>


                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-start relative z-10">
                    {/* Image Upload Area */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex-1 w-full relative z-10"
                    >
                        {!selectedImage ? (
                            <div className="relative group cursor-pointer aspect-[4/5] w-full" onClick={() => fileInputRef.current?.click()}>
                                {/* Animated Gradient Border */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-main)] via-purple-500 to-[var(--color-main)] rounded-2xl blur-md opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse z-0"></div>
                                <div className="relative h-full border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-transparent transition-all overflow-hidden z-10 shadow-sm group-hover:shadow-xl">
                                    <UploadCloud className="w-16 h-16 text-gray-400 mb-4 group-hover:text-[var(--color-main)] group-hover:scale-110 transition-all duration-300" />
                                    <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)] group-hover:text-[var(--color-main)] transition-colors">Sube tu Diseño</h3>
                                    <p className="text-sm text-gray-500 max-w-[250px]">
                                        Haz clic aquí o arrastra tu imagen para estampado en <strong className="text-[var(--color-main)]">{activeCategory.name}</strong>.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl group flex flex-col items-center justify-center p-4">
                                <img
                                    src={selectedImage}
                                    alt="Tu diseño personalizado"
                                    className="w-full h-full object-contain p-4"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg cursor-pointer"
                                    title="Quitar diseño"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                                    <activeCategory.icon className="w-3.5 h-3.5 text-[var(--color-main)]" />
                                    <span>{currentOption?.label}</span>
                                </div>

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
                        className="flex-1 w-full flex flex-col relative z-10"
                    >
                        <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm">
                            <h3 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
                                <ImageIcon className="w-6 h-6 text-[var(--color-main)]" />
                                Detalles del Pedido
                            </h3>

                            {/* Dynamic Price Display */}
                            <p className="text-3xl font-bold text-[var(--color-main)] mb-8 flex items-end gap-1">
                                {isLoadingPrices ? (
                                    <span className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded mt-1"></span>
                                ) : (
                                    <>
                                        ${currentOption ? currentOption.price.toLocaleString("es-AR") : "..."}
                                        <span className="text-sm font-normal text-gray-500 mb-1">ARS</span>
                                    </>
                                )}
                            </p>

                            {/* Select Sublimation Item / Model */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                                    Selecciona el Insumo ({activeCategory.name})
                                </h4>
                                <div className="flex flex-col gap-2">
                                    {activeCategory.options.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSelectedItemType(opt.id)}
                                            className={`w-full py-3 px-4 rounded-lg border-2 flex items-center justify-between text-left font-semibold transition-all cursor-pointer ${
                                                selectedItemType === opt.id
                                                    ? "border-[var(--color-main)] bg-[var(--color-main)]/10 text-[var(--color-main)] dark:bg-[var(--color-main)]/20"
                                                    : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-500"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {selectedItemType === opt.id && <Check className="w-4 h-4 text-[var(--color-main)]" />}
                                                {opt.label}
                                            </span>
                                            <span className="text-sm font-normal">
                                                {isLoadingPrices ? <span className="w-16 h-4 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded block"></span> : `$${opt.price.toLocaleString("es-AR")}`}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Select Variant / Size */}
                            <div className="mb-8">
                                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                                    {activeCategory.id === "remeras" ? "Selecciona tu Talla" : "Variante / Medida"}
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {activeCategory.variants.map((variant) => (
                                        <button
                                            key={variant}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-4 py-3 min-w-[3.5rem] rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${
                                                selectedVariant === variant
                                                    ? "border-[var(--color-main)] bg-[var(--color-main)] text-white shadow-md scale-105"
                                                    : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                                            }`}
                                        >
                                            {variant}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Specifications list */}
                            <div className="bg-white dark:bg-zinc-950 p-4 rounded-lg border border-gray-100 dark:border-zinc-800 mb-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                <ul className="list-disc pl-5 space-y-1">
                                    {activeCategory.specs.map((spec, i) => (
                                        <li key={i}>{spec}</li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={!selectedImage || !selectedItemType}
                                className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-main)] hover:text-white transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {!selectedImage ? "Sube tu diseño para continuar" : "Agregar al Carrito"}
                            </button>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
