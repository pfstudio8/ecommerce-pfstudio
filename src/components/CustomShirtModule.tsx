"use client";

import { useState, useRef, useEffect } from "react";
import { 
    UploadCloud, Image as ImageIcon, ShoppingCart, Trash2, Shirt, Beer, 
    Crown, Key, CupSoda, Check, RotateCw, ZoomIn, ZoomOut, Maximize2, 
    Sparkles, Layers, Info, Package
} from "lucide-react";
import { useCartStore, CartStore } from "@/store/cart";
import { sileo } from "sileo";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export interface InsumoOption {
    id: string;
    label: string;
    price: number;
    shape?: string;
    dimensions?: string;
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
    const [activeCategoryId, setActiveCategoryId] = useState<string>("llaveros");
    const [selectedItemType, setSelectedItemType] = useState<string>("llavero-circulo");
    const [selectedVariant, setSelectedVariant] = useState<string>("2 Caras");
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    
    // Interactive Preview Controls
    const [imageScale, setImageScale] = useState<number>(100);
    const [imageRotation, setImageRotation] = useState<number>(0);
    const [imageFit, setImageFit] = useState<"cover" | "contain">("cover");
    const [baseColor, setBaseColor] = useState<string>("#ffffff");
    const [previewSide, setPreviewSide] = useState<"frente" | "dorso">("frente");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const addItem = useCartStore((state: CartStore) => state.addItem);

    // Dynamic Insumo Categories & Items
    const [categories, setCategories] = useState<InsumoCategory[]>([
        {
            id: "llaveros",
            name: "Llaveros Custom",
            icon: Key,
            defaultVariant: "2 Caras",
            variants: ["2 Caras", "1 Cara"],
            specs: [
                "Polímero inalterable al calor y al agua.",
                "Sublimación HD Full Color de alta definición sin degradarse con el roce.",
                "Incluye argolla metálica sinfín reforzada lista para usar.",
                "Demora de producción express: 24-48hs hábiles.",
                "Impresión apta fotos, logos, texto, escudos o ilustraciones."
            ],
            options: [
                { id: "llavero-circulo", label: "Llavero Círculo", price: 3500, shape: "circle", dimensions: "4 × 4 cm" },
                { id: "llavero-rectangulo", label: "Llavero Rectángulo", price: 3500, shape: "rect", dimensions: "4 × 5 cm" },
                { id: "llavero-corazon-chico", label: "Llavero Corazón Chico", price: 3500, shape: "heart-chico", dimensions: "4 × 4 cm" },
                { id: "llavero-corazon-grande", label: "Llavero Corazón Grande", price: 3800, shape: "heart-grande", dimensions: "5 × 5 cm" },
                { id: "llavero-camiseta", label: "Llavero Camiseta", price: 3500, shape: "shirt", dimensions: "3 × 5 cm" },
                { id: "llavero-elipse", label: "Llavero Ovalado", price: 3500, shape: "ellipse", dimensions: "3.5 × 6 cm" },
                { id: "llavero-credencial", label: "Llavero Credencial", price: 4200, shape: "rect-credencial", dimensions: "5 × 8 cm" },
                { id: "llavero-portafoto", label: "Llavero Portafoto", price: 3800, shape: "rect-portafoto", dimensions: "4 × 5 cm" },
            ]
        },
        {
            id: "botineros",
            name: "Botineros",
            icon: Package,
            defaultVariant: "Standard",
            variants: ["Standard"],
            specs: [
                "Material impermeable de alta resistencia.",
                "Sublimación HD Full Color de gran tamaño.",
                "Ideal para botines, zapatillas y accesorios deportivos.",
                "Demora de producción: 24-48hs hábiles."
            ],
            options: [
                { id: "botinero", label: "Botinero Personalizado", price: 16000, shape: "rect-6x4", dimensions: "35 × 20 cm" },
            ]
        },
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
                "RECOMENDACIÓN: Lavar a mano con agua fría sin suavizante."
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

    const getParsedDimensions = (dimStr?: string) => {
        if (!dimStr) return { width: null, height: null };
        const cleanStr = dimStr.replace(/cm/gi, '').trim();
        const parts = cleanStr.split(/[×x]/);
        if (parts.length === 2) {
            return {
                width: parts[0].trim(),
                height: parts[1].trim()
            };
        }
        return { width: null, height: null };
    };

    const parsedDimensions = getParsedDimensions(currentOption?.dimensions);

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

    const handleRotate = () => {
        setImageRotation((prev) => (prev + 90) % 360);
    };

    const handleAddToCart = () => {
        if (!selectedImage) {
            alert("Por favor sube una imagen con tu diseño para continuar.");
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
            category: activeCategory.name,
            images: [selectedImage],
            stock: 9999
        };

        addItem(customProduct as any, selectedVariant || "Único");
        sileo.success({ title: `¡Agregado al carrito: ${productName} (${selectedVariant})!` });
    };

    // Render Keychain & Product Interactive Mockup SVG
    const renderInteractiveMockup = () => {
        const optionId = currentOption?.id || "llavero-circulo";
        const isKeychainCategory = activeCategoryId === "llaveros";

        // SVG Mask ID
        const maskId = `mask-${optionId}`;

        // Scaling factor transform
        const scaleVal = imageScale / 100;
        const transformStr = `rotate(${imageRotation} 150 190) scale(${scaleVal}) translate(${(150 - 150 * scaleVal) / scaleVal} ${(190 - 190 * scaleVal) / scaleVal})`;

        return (
            <div className="relative w-full aspect-square max-w-105 mx-auto flex items-center justify-center p-6">
                {/* TOP DIMENSION GUIDE: ANCHO */}
                {parsedDimensions.width && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-950/90 border border-main/50 text-main px-3.5 py-1 rounded-full text-xs font-mono font-bold shadow-lg z-20">
                        <span className="text-main font-extrabold">←</span>
                        <span className="text-[10px] uppercase font-sans text-gray-400 font-bold">Ancho:</span>
                        <span>{parsedDimensions.width} cm</span>
                        <span className="text-main font-extrabold">→</span>
                    </div>
                )}

                {/* RIGHT DIMENSION GUIDE: ALTO */}
                {parsedDimensions.height && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center bg-zinc-950/90 border border-main/50 text-main px-2 py-2.5 rounded-xl text-xs font-mono font-bold shadow-lg z-20">
                        <span className="text-main font-extrabold">↑</span>
                        <span className="text-[9px] uppercase font-sans text-gray-400 font-bold my-0.5">Alto</span>
                        <span>{parsedDimensions.height}</span>
                        <span className="text-[9px] font-sans text-gray-400 font-bold">cm</span>
                        <span className="text-main font-extrabold">↓</span>
                    </div>
                )}

                <svg viewBox="0 0 300 340" className="w-full h-full drop-shadow-2xl overflow-visible select-none">
                    <defs>
                        {/* Metallic Gradient for Ring */}
                        <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e2e8f0" />
                            <stop offset="30%" stopColor="#94a3b8" />
                            <stop offset="50%" stopColor="#cbd5e1" />
                            <stop offset="70%" stopColor="#64748b" />
                            <stop offset="100%" stopColor="#f1f5f9" />
                        </linearGradient>

                        {/* Polymer Gloss Overlay */}
                        <linearGradient id="white-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Drop Shadow Filter */}
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.35" />
                        </filter>

                        {/* MASK DEFINITIONS FOR EACH KEYCHAIN SHAPE */}
                        {optionId === "llavero-circulo" && (
                            <clipPath id={maskId}>
                                <circle cx="150" cy="195" r="100" />
                            </clipPath>
                        )}
                        {(optionId === "llavero-corazon-chico" || optionId === "llavero-corazon") && (
                            <clipPath id={maskId}>
                                <path d="M 150 270 C 150 270 55 190 55 125 C 55 85 85 62 115 62 C 135 62 150 75 150 75 C 150 75 165 62 185 62 C 215 62 245 85 245 125 C 245 190 150 270 150 270 Z" />
                            </clipPath>
                        )}
                        {optionId === "llavero-corazon-grande" && (
                            <clipPath id={maskId}>
                                <path d="M 150 286 C 150 286 40 198 40 125 C 40 76 77 50 115 50 C 136 50 150 66 150 66 C 150 66 164 50 185 50 C 223 50 260 76 260 125 C 260 198 150 286 150 286 Z" />
                            </clipPath>
                        )}
                        {optionId === "llavero-camiseta" && (
                            <clipPath id={maskId}>
                                <path d="M 125 90 L 175 90 L 180 102 C 180 102 215 115 240 130 L 220 165 L 195 152 L 195 285 L 105 285 L 105 152 L 80 165 L 60 130 C 85 115 120 102 120 102 Z" />
                            </clipPath>
                        )}
                        {(optionId === "llavero-rectangulo" || optionId === "llavero-portafoto") && (
                            <clipPath id={maskId}>
                                <rect x="70" y="85" width="160" height="230" rx="18" />
                            </clipPath>
                        )}
                        {optionId === "llavero-credencial" && (
                            <clipPath id={maskId}>
                                <rect x="75" y="80" width="150" height="240" rx="14" />
                            </clipPath>
                        )}
                        {optionId === "llavero-elipse" && (
                            <clipPath id={maskId}>
                                <ellipse cx="150" cy="195" rx="80" ry="122" />
                            </clipPath>
                        )}
                        {optionId === "botinero" && (
                            <clipPath id={maskId}>
                                <rect x="45" y="115" width="210" height="150" rx="18" />
                            </clipPath>
                        )}

                        {/* Default Mask for non-keychains */}
                        {!isKeychainCategory && (
                            <clipPath id={maskId}>
                                <rect x="50" y="90" width="200" height="210" rx="16" />
                            </clipPath>
                        )}
                    </defs>

                    {/* KEYCHAIN METALLIC RING & HOOK ASSEMBLY */}
                    {isKeychainCategory && (
                        <g id="ring-assembly">
                            {/* Key Ring (Sin Fin) */}
                            <circle cx="150" cy="36" r="24" fill="none" stroke="url(#metal-grad)" strokeWidth="6" filter="url(#shadow)" />
                            <circle cx="150" cy="36" r="20" fill="none" stroke="#475569" strokeWidth="1" opacity="0.6" />
                            
                            {/* Chain Link Hook */}
                            <rect x="146" y="54" width="8" height="22" rx="4" fill="url(#metal-grad)" stroke="#334155" strokeWidth="0.5" />
                        </g>
                    )}

                    {/* POLYMER KEYCHAIN BASE BODY SHAPE */}
                    <g filter="url(#shadow)">
                        {/* Tab at Top of Keychain */}
                        {isKeychainCategory && (
                            <g>
                                <path d="M 132 88 C 132 68 168 68 168 88 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
                                <circle cx="150" cy="78" r="6" fill="#0f172a" />
                            </g>
                        )}

                        {/* White Outer Border / Bevel for Keychains */}
                        {optionId === "llavero-circulo" && (
                            <circle cx="150" cy="195" r="105" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
                        )}
                        {optionId === "llavero-corazon-chico" && (
                            <path d="M 150 276 C 150 276 50 193 50 125 C 50 81 81 58 115 58 C 135 58 150 71 150 71 C 150 71 165 58 185 58 C 219 58 250 81 250 125 C 250 193 150 276 150 276 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
                        )}
                        {optionId === "llavero-corazon-grande" && (
                            <path d="M 150 286 C 150 286 40 198 40 125 C 40 76 77 50 115 50 C 136 50 150 66 150 66 C 150 66 164 50 185 50 C 223 50 260 76 260 125 C 260 198 150 286 150 286 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
                        )}
                        {optionId === "llavero-camiseta" && (
                            <path d="M 125 85 L 175 85 L 182 98 C 182 98 218 110 245 127 L 223 168 L 198 155 L 198 290 L 102 290 L 102 155 L 77 168 L 55 127 C 82 110 118 98 118 98 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
                        )}
                        {(optionId === "llavero-rectangulo" || optionId === "llavero-portafoto") && (
                            <rect x="65" y="80" width="170" height="240" rx="22" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
                        )}
                        {optionId === "llavero-credencial" && (
                            <rect x="70" y="75" width="160" height="250" rx="18" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
                        )}
                        {optionId === "llavero-elipse" && (
                            <ellipse cx="150" cy="195" rx="85" ry="127" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
                        )}
                        {optionId === "botinero" && (
                            <rect x="40" y="110" width="220" height="160" rx="22" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
                        )}
                    </g>

                    {/* SUBLIMATION DESIGN PRINT AREA (CLIPPED BY MASK) */}
                    <g clipPath={`url(#${maskId})`}>
                        {/* Background Base Fill */}
                        <rect x="0" y="0" width="300" height="340" fill={baseColor} />

                        {selectedImage ? (
                            <image
                                href={selectedImage}
                                x="0"
                                y="0"
                                width="300"
                                height="340"
                                preserveAspectRatio={imageFit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
                                transform={transformStr}
                            />
                        ) : (
                            /* Placeholder grid & text when no image is uploaded */
                            <g className="opacity-40">
                                <rect x="0" y="0" width="300" height="340" fill="url(#white-gloss)" />
                                <circle cx="150" cy="195" r="40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                                <text x="150" y="190" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="bold">TU DISEÑO AQUÍ</text>
                                <text x="150" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10">Subí tu imagen PNG / JPG</text>
                            </g>
                        )}

                        {/* Polymer Gloss Effect overlay */}
                        <ellipse cx="120" cy="130" rx="90" ry="50" fill="url(#white-gloss)" transform="rotate(-25 120 130)" pointerEvents="none" />
                    </g>

                    {/* Outer Metallic Rim for Metallic Llavero option */}
                    {optionId === "llavero-metal" && (
                        <rect x="65" y="80" width="170" height="240" rx="22" fill="none" stroke="url(#metal-grad)" strokeWidth="8" pointerEvents="none" />
                    )}
                </svg>
            </div>
        );
    };

    return (
        <section className="py-20 bg-dark relative overflow-hidden" id="personalizador">
            {/* Top and Bottom Smooth Background Fade Overlays */}
            <div className="absolute top-0 inset-x-0 h-28 bg-linear-to-b from-dark via-dark/80 to-transparent pointer-events-none z-10"></div>
            <div className="absolute bottom-0 inset-x-0 h-28 bg-linear-to-t from-dark via-dark/80 to-transparent pointer-events-none z-10"></div>

            {/* Ambient Glow Radial Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none z-0"></div>

            {/* Elegant Grid Background overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none z-0"></div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center mb-10 text-center"
                >
                    <span className="text-xs font-bold uppercase tracking-widest text-main bg-main/10 border border-main/30 px-4 py-1.5 rounded-full mb-3 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-main" />
                        ESTUDIO DE SUBLIMACIÓN & CUSTOM
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mb-3 uppercase">
                        Diseñá Tu Propio Llavero & Insumos
                    </h2>
                    <p className="text-gray-400 max-w-2xl text-sm sm:text-base leading-relaxed">
                        Elegí la forma de tu llavero o insumo, subí tu foto, imagen o logo y visualizá en tiempo real cómo quedará estampado con alta calidad.
                    </p>

                    {/* Integrated 3-Step Process Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mt-6 p-2 rounded-2xl bg-zinc-900/60 border border-main/30 backdrop-blur-md shadow-lg">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/90 border border-main/40 text-left transition-all hover:border-main">
                            <span className="w-8 h-8 rounded-lg bg-main text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-md">
                                01
                            </span>
                            <div>
                                <p className="text-xs font-extrabold text-foreground uppercase tracking-wide">1. Forma o Modelo</p>
                                <p className="text-[11px] text-main font-bold truncate">{currentOption?.label || activeCategory.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/90 border border-white/10 text-left transition-all hover:border-main">
                            <span className="w-8 h-8 rounded-lg bg-main/20 text-main font-extrabold text-xs flex items-center justify-center shrink-0 border border-main/30">
                                02
                            </span>
                            <div>
                                <p className="text-xs font-bold text-foreground uppercase tracking-wide">2. Subí tu Diseño</p>
                                <p className="text-[11px] text-gray-400">PNG, JPG, WebP o Logo</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/90 border border-white/10 text-left transition-all hover:border-main">
                            <span className="w-8 h-8 rounded-lg bg-main/20 text-main font-extrabold text-xs flex items-center justify-center shrink-0 border border-main/30">
                                03
                            </span>
                            <div>
                                <p className="text-xs font-bold text-foreground uppercase tracking-wide">3. Hacé tu Pedido</p>
                                <p className="text-[11px] text-gray-400">Agregá al carrito y listo</p>
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
                                            : "bg-zinc-900/80 text-gray-300 border-white/10 hover:border-main/50 hover:text-white"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* MAIN CUSTOMIZER WORKSPACE */}
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start relative z-10">
                    
                    {/* LEFT PANEL: Interactive Design Canvas Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 w-full bg-zinc-900/90 rounded-2xl p-6 border border-white/10 shadow-2xl relative flex flex-col items-center justify-between"
                    >
                        {/* Status Header Badge */}
                        <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-main animate-pulse"></span>
                                <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                                    Previsualización en Vivo 2D/3D
                                </h3>
                            </div>
                            <span className="text-xs bg-white/10 text-main font-bold px-3 py-1 rounded-full border border-main/30">
                                {currentOption?.dimensions || "Sublimación Full"}
                            </span>
                        </div>

                        {/* Guía de Medidas Header Banner */}
                        <div className="w-full mb-2 p-2.5 rounded-xl bg-zinc-800/80 border border-main/30 flex items-center gap-2 text-xs text-gray-300 shadow-sm">
                            <Info className="w-4 h-4 text-main shrink-0" />
                            <span><strong>Guía de medidas:</strong> Las dimensiones representan <strong>Ancho (arriba) × Alto (a la derecha)</strong> en cm.</span>
                        </div>

                        {/* Mockup Canvas Component */}
                        <div className="w-full flex-1 flex items-center justify-center min-h-90 py-2 relative">
                            {renderInteractiveMockup()}
                        </div>

                        {/* Interactive Design Controls Bar */}
                        <div className="w-full bg-black/60 rounded-xl p-4 border border-white/10 backdrop-blur-md mt-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-main text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-main-dark transition cursor-pointer shadow-md"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    {selectedImage ? "Cambiar Imagen" : "Subir Imagen"}
                                </button>

                                {selectedImage && (
                                    <button
                                        onClick={handleRemoveImage}
                                        className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition cursor-pointer"
                                        title="Eliminar imagen"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Fine Adjustment Controls */}
                            {selectedImage && (
                                <div className="flex items-center gap-4 flex-wrap">
                                    {/* Zoom controls */}
                                    <div className="flex items-center gap-1.5 bg-zinc-800/80 px-2 py-1 rounded-lg border border-white/10 text-xs">
                                        <ZoomOut
                                            className="w-3.5 h-3.5 text-gray-400 hover:text-white cursor-pointer"
                                            onClick={() => setImageScale(Math.max(50, imageScale - 15))}
                                        />
                                        <span className="text-white font-mono min-w-9 text-center">{imageScale}%</span>
                                        <ZoomIn
                                            className="w-3.5 h-3.5 text-gray-400 hover:text-white cursor-pointer"
                                            onClick={() => setImageScale(Math.min(200, imageScale + 15))}
                                        />
                                    </div>

                                    {/* Rotate Button */}
                                    <button
                                        onClick={handleRotate}
                                        className="p-2 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-lg border border-white/10 text-xs flex items-center gap-1.5 transition cursor-pointer"
                                        title="Rotar 90°"
                                    >
                                        <RotateCw className="w-3.5 h-3.5 text-main" />
                                        <span>{imageRotation}°</span>
                                    </button>

                                    {/* Fit Mode Button */}
                                    <button
                                        onClick={() => setImageFit(imageFit === "cover" ? "contain" : "cover")}
                                        className="p-2 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-lg border border-white/10 text-xs flex items-center gap-1.5 transition cursor-pointer"
                                        title="Modo de Ajuste"
                                    >
                                        <Maximize2 className="w-3.5 h-3.5 text-main" />
                                        <span className="capitalize">{imageFit}</span>
                                    </button>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                            />
                        </div>
                    </motion.div>

                    {/* RIGHT PANEL: Product Options & Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex-1 w-full bg-zinc-900/90 rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-foreground uppercase">
                                    <ImageIcon className="w-6 h-6 text-main" />
                                    Detalles & Selección
                                </h3>
                                <span className="text-xs uppercase font-extrabold tracking-widest text-main bg-main/10 border border-main/30 px-3 py-1 rounded-full">
                                    {activeCategory.name}
                                </span>
                            </div>

                            {/* Dynamic Price Display */}
                            <div className="mb-6 bg-black/40 p-4 rounded-xl border border-white/5 flex items-baseline justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Precio Unitario</p>
                                    <div className="text-3xl font-black text-main flex items-end gap-1">
                                        {isLoadingPrices ? (
                                            <span className="h-8 w-28 bg-zinc-800 animate-pulse rounded"></span>
                                        ) : (
                                            <>
                                                ${currentOption ? currentOption.price.toLocaleString("es-AR") : "..."}
                                                <span className="text-xs font-semibold text-gray-400 mb-1">ARS</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SELECTOR DE FORMA / OPCIÓN DE LLAVERO */}
                            <div className="mb-6">
                                <h4 className="text-sm font-extrabold uppercase tracking-wider mb-3 text-gray-200 flex items-center justify-between">
                                    <span>Seleccioná la Forma / Modelo</span>
                                    <span className="text-xs text-gray-400 font-normal">({activeCategory.options.length} opciones)</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-65 overflow-y-auto pr-1 custom-scrollbar">
                                    {activeCategory.options.map((opt) => {
                                        const isSelected = selectedItemType === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSelectedItemType(opt.id)}
                                                className={`py-3 px-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "border-main bg-main/20 text-white font-extrabold shadow-md ring-1 ring-main"
                                                        : "border-white/10 bg-zinc-800/40 text-gray-300 hover:border-white/30 hover:bg-zinc-800/80"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    {isSelected ? (
                                                        <Check className="w-4 h-4 text-main shrink-0" />
                                                    ) : (
                                                        <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0"></span>
                                                    )}
                                                    <span className="text-xs sm:text-sm truncate">{opt.label}</span>
                                                </div>
                                                <span className="text-xs font-bold text-main shrink-0 ml-2">
                                                    ${opt.price.toLocaleString("es-AR")}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SELECTOR DE VARIANTE / ACABADO */}
                            <div className="mb-6">
                                <h4 className="text-sm font-extrabold uppercase tracking-wider mb-3 text-gray-200">
                                    {activeCategory.id === "llaveros" ? "Impresión / Acabado" : "Talla / Variante"}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {activeCategory.variants.map((variant) => (
                                        <button
                                            key={variant}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                                selectedVariant === variant
                                                    ? "border-main bg-main text-white shadow-lg scale-105"
                                                    : "border-white/10 bg-zinc-800/50 text-gray-300 hover:border-white/30"
                                            }`}
                                        >
                                            {variant}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Especificaciones */}
                            <div className="bg-black/50 p-4 rounded-xl border border-white/5 mb-6 text-xs text-gray-300 leading-relaxed">
                                <div className="flex items-center gap-2 font-bold text-foreground uppercase mb-2">
                                    <Info className="w-4 h-4 text-main" />
                                    Detalles del Producto:
                                </div>
                                <ul className="list-disc pl-4 space-y-1 text-gray-400">
                                    {activeCategory.specs.map((spec, i) => (
                                        <li key={i}>{spec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* AGREGAR AL CARRITO CTA */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedImage || !selectedItemType}
                            className="w-full py-4 bg-main hover:bg-main-dark text-white rounded-xl font-extrabold flex items-center justify-center gap-2.5 transition-all duration-300 uppercase tracking-wider shadow-lg shadow-main/30 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 cursor-pointer mt-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {!selectedImage ? "Subí tu diseño para continuar" : "Agregar al Carrito"}
                        </button>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

