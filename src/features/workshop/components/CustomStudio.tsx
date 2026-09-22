"use client";

import { useState, useRef, useEffect } from "react";
import { 
    UploadCloud, Image as ImageIcon, ShoppingCart, Trash2, Shirt, Beer, 
    Crown, Key, CupSoda, Check, RotateCw, ZoomIn, ZoomOut, Maximize2, 
    Sparkles, Info, Package, Repeat
} from "lucide-react";
import { useCartStore, CartStore } from "@/features/orders/store/cart";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Viewer3D from "./Viewer3D";
import { Product } from "@/types/product";

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

export default function CustomStudio() {
    const [images, setImages] = useState<{ frente: string | null; dorso: string | null }>({ frente: null, dorso: null });
    const [activeCategoryId, setActiveCategoryId] = useState<string>("llaveros");
    const [selectedItemType, setSelectedItemType] = useState<string>("llavero-circulo");
    const [selectedVariant, setSelectedVariant] = useState<string>("Standard");
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    
    // Multi-side logic
    const [printMode, setPrintMode] = useState<"1 Cara" | "2 Caras" | "Completo">("2 Caras");
    const [previewSide, setPreviewSide] = useState<"frente" | "dorso">("frente");

    // Interactive Preview Controls
    const [imageScales, setImageScales] = useState<{ frente: number; dorso: number }>({ frente: 100, dorso: 100 });
    const [imageRotations, setImageRotations] = useState<{ frente: number; dorso: number }>({ frente: 0, dorso: 0 });
    const [imageOffsets, setImageOffsets] = useState<{ frente: { x: number; y: number }; dorso: { x: number; y: number } }>({ frente: { x: 0, y: 0 }, dorso: { x: 0, y: 0 } });
    const [imageFits, setImageFits] = useState<{ frente: "cover" | "contain"; dorso: "cover" | "contain" }>({ frente: "cover", dorso: "cover" });
    const [baseColor, setBaseColor] = useState<string>("#ffffff");
    const [show3D, setShow3D] = useState(false);
    const textureCanvasRef = useRef<HTMLCanvasElement>(null);

    const isDraggingImage = useRef(false);
    const dragStartCoords = useRef({ x: 0, y: 0 });
    const tempOffset = useRef({ x: 0, y: 0 });
    const imageElementRef = useRef<SVGImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addItem = useCartStore((state: CartStore) => state.addItem);

    // Active image states for convenience
    const activeImage = images[previewSide];
    const activeScale = imageScales[previewSide];
    const activeRotation = imageRotations[previewSide];
    const activeOffset = imageOffsets[previewSide];
    const activeFit = imageFits[previewSide];

    // Sync 2D interactions to a hidden canvas for the 3D viewer
    useEffect(() => {
        if (!textureCanvasRef.current) return;
        const canvas = textureCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (activeImage) {
            const img = new Image();
            img.onload = () => {
                ctx.save();
                const scaleVal = activeScale / 100;
                ctx.translate(300, 380); // Center of 600x680 (SVG is 300x340)
                ctx.rotate((activeRotation * Math.PI) / 180);
                ctx.translate(activeOffset.x * 2, activeOffset.y * 2);
                ctx.scale(scaleVal, scaleVal);
                
                // Basic handling for object-fit
                if (activeFit === "cover") {
                    ctx.drawImage(img, -300, -340, 600, 680); // Stretch/Cover approx
                } else {
                    const ratio = Math.min(600 / img.width, 680 / img.height);
                    const w = img.width * ratio;
                    const h = img.height * ratio;
                    ctx.drawImage(img, -w/2, -h/2, w, h);
                }
                
                ctx.restore();
            };
            img.src = activeImage;
        } else {
            ctx.fillStyle = "#f1f5f9";
            ctx.fillRect(0, 0, 600, 680);
            ctx.fillStyle = "#94a3b8";
            ctx.font = "bold 32px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("TU DISEÑO", 300, 340);
        }
    }, [activeImage, activeScale, activeRotation, activeOffset, activeFit, baseColor, previewSide]);

    // Dynamic Insumo Categories & Items
    const [categories, setCategories] = useState<InsumoCategory[]>([
        {
            id: "llaveros",
            name: "Llaveros Custom",
            icon: Key,
            defaultVariant: "Standard",
            variants: ["Standard"],
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
            id: "chopps-tazas",
            name: "Chopps y Tazas",
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
            id: "vasos-botellas",
            name: "Vasos y Botellas",
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
        }
    ]);

    // Fetch prices dynamically from DB
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

    // Effect to update printMode based on category
    useEffect(() => {
        setPrintMode(prev => {
            if (["llaveros", "chopps-tazas", "vasos-botellas"].includes(activeCategoryId)) {
                if (prev === "Completo" && activeCategoryId === "llaveros") {
                    return "2 Caras";
                }
                return prev;
            } else {
                return "1 Cara";
            }
        });

        if (!["llaveros", "chopps-tazas", "vasos-botellas"].includes(activeCategoryId)) {
            setPreviewSide("frente");
        }
    }, [activeCategoryId]);

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
                setImages(prev => ({ ...prev, [previewSide]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImages(prev => ({ ...prev, [previewSide]: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRotate = () => {
        setImageRotations(prev => ({
            ...prev,
            [previewSide]: (prev[previewSide] + 90) % 360
        }));
    };

    const handleScale = (delta: number) => {
        setImageScales(prev => ({
            ...prev,
            [previewSide]: Math.min(200, Math.max(50, prev[previewSide] + delta))
        }));
    };

    const handleFitToggle = () => {
        setImageFits(prev => ({
            ...prev,
            [previewSide]: prev[previewSide] === "cover" ? "contain" : "cover"
        }));
    };

    const compressImage = (base64Str: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_SIZE = 400;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/webp", 0.7));
                } else {
                    resolve(base64Str);
                }
            };
            img.onerror = () => resolve(base64Str);
            img.src = base64Str;
        });
    };

    const handleAddToCart = async () => {
        if (printMode === "2 Caras" && (!images.frente || !images.dorso)) {
            toast.error("Por favor sube ambas imágenes (Frente y Dorso) o selecciona otra opción.");
            return;
        }

        if ((printMode === "1 Cara" || printMode === "Completo") && !images.frente) {
            toast.error("Por favor sube una imagen con tu diseño para continuar.");
            return;
        }

        if (!selectedItemType || !currentOption) {
            toast.error("Por favor selecciona un producto o insumo.");
            return;
        }

        const price = currentOption.price;
        const productName = `Sublimación - ${currentOption.label} (${printMode})`;

        const compressedFrente = images.frente ? await compressImage(images.frente) : null;
        const compressedDorso = images.dorso ? await compressImage(images.dorso) : null;

        const customProduct: Product = {
            id: `custom-${selectedItemType}-${Date.now()}`,
            name: productName,
            price: price,
            description: "Producto personalizado desde Custom Studio",
            category: activeCategory.name,
            image_url: compressedFrente || "/placeholder.png",
            images: [compressedFrente, compressedDorso].filter(Boolean) as string[],
            stock: 9999
        };

        addItem(customProduct, selectedVariant || "Único");
    };
    const isMultiSide = ["llaveros", "chopps-tazas", "vasos-botellas"].includes(activeCategoryId);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!activeImage) return;
        isDraggingImage.current = true;
        dragStartCoords.current = { x: e.clientX, y: e.clientY };
        tempOffset.current = { x: 0, y: 0 };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDraggingImage.current || !activeImage || !imageElementRef.current) return;
        
        const dx = e.clientX - dragStartCoords.current.x;
        const dy = e.clientY - dragStartCoords.current.y;
        tempOffset.current = { x: dx, y: dy };
        
        // Direct DOM update to bypass slow React re-renders
        const scaleVal = activeScale / 100;
        const baseTranslateX = (150 - 150 * scaleVal) / scaleVal;
        const baseTranslateY = (190 - 190 * scaleVal) / scaleVal;
        const userOffsetX = (activeOffset.x + dx) / scaleVal;
        const userOffsetY = (activeOffset.y + dy) / scaleVal;
        
        const transformStr = `scale(${scaleVal}) translate(${baseTranslateX + userOffsetX} ${baseTranslateY + userOffsetY}) rotate(${activeRotation} 150 190)`;
        imageElementRef.current.setAttribute("transform", transformStr);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDraggingImage.current) return;
        isDraggingImage.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
        
        setImageOffsets(prev => ({
            ...prev,
            [previewSide]: {
                x: prev[previewSide].x + tempOffset.current.x,
                y: prev[previewSide].y + tempOffset.current.y
            }
        }));
    };

    // Render Keychain & Product Interactive Mockup SVG
    const renderInteractiveMockup = () => {
        const optionId = currentOption?.id || "llavero-circulo";
        const isKeychainCategory = activeCategoryId === "llaveros";

        const maskId = `mask-${optionId}`;
        const scaleVal = activeScale / 100;
        
        // Base translation to center the scaled image, then add user offset
        const baseTranslateX = (150 - 150 * scaleVal) / scaleVal;
        const baseTranslateY = (190 - 190 * scaleVal) / scaleVal;
        const userOffsetX = activeOffset.x / scaleVal;
        const userOffsetY = activeOffset.y / scaleVal;

        const transformStr = `scale(${scaleVal}) translate(${baseTranslateX + userOffsetX} ${baseTranslateY + userOffsetY}) rotate(${activeRotation} 150 190)`;

        return (
            <div className="relative w-full aspect-square max-w-100 mx-auto flex items-center justify-center p-6 bg-surface-container-low rounded-xl border border-outline-variant shadow-inner">
                
                {/* Visual indicator of side */}
                {printMode === "2 Caras" && (
                    <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-label-sm font-label-sm font-bold uppercase tracking-widest shadow-sm z-30">
                        {previewSide === "frente" ? "Cara: Frente" : "Cara: Dorso"}
                    </div>
                )}

                {/* TOP DIMENSION GUIDE: ANCHO */}
                {parsedDimensions.width && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-surface border border-outline-variant text-on-surface px-3 py-1 rounded-full text-label-sm font-bold shadow-sm z-20">
                        <span className="text-primary font-bold">←</span>
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant">Ancho:</span>
                        <span>{parsedDimensions.width} cm</span>
                        <span className="text-primary font-bold">→</span>
                    </div>
                )}

                {/* RIGHT DIMENSION GUIDE: ALTO */}
                {parsedDimensions.height && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center bg-surface border border-outline-variant text-on-surface px-2 py-2 rounded-xl text-label-sm font-bold shadow-sm z-20">
                        <span className="text-primary font-bold">↑</span>
                        <span className="text-[9px] uppercase font-bold text-on-surface-variant my-0.5">Alto</span>
                        <span>{parsedDimensions.height}</span>
                        <span className="text-[9px] font-bold text-on-surface-variant">cm</span>
                        <span className="text-primary font-bold">↓</span>
                    </div>
                )}

                <svg viewBox="0 0 300 340" className="w-full h-full overflow-visible select-none drop-shadow-xl z-10 relative">
                    <defs>
                        {/* Artisan Style Gradients */}
                        <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e2e8f0" />
                            <stop offset="50%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#cbd5e1" />
                        </linearGradient>

                        <linearGradient id="white-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                        </linearGradient>

                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.15" />
                        </filter>

                        {/* MASK DEFINITIONS */}
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
                        {/* Default Mask */}
                        {!isKeychainCategory && (
                            <clipPath id={maskId}>
                                <rect x="50" y="90" width="200" height="210" rx="16" />
                            </clipPath>
                        )}
                    </defs>

                    {/* KEYCHAIN METALLIC RING & HOOK */}
                    {isKeychainCategory && (
                        <g id="ring-assembly">
                            <circle cx="150" cy="36" r="24" fill="none" stroke="url(#metal-grad)" strokeWidth="6" filter="url(#shadow)" />
                            <circle cx="150" cy="36" r="20" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.6" />
                            <rect x="146" y="54" width="8" height="22" rx="4" fill="url(#metal-grad)" stroke="#94a3b8" strokeWidth="0.5" />
                        </g>
                    )}

                    {/* POLYMER BASE BODY */}
                    <g filter="url(#shadow)">
                        {isKeychainCategory && (
                            <g>
                                <path d="M 132 88 C 132 68 168 68 168 88 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                                <circle cx="150" cy="78" r="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                            </g>
                        )}

                        {/* White Outer Border */}
                        {optionId === "llavero-circulo" && (
                            <circle cx="150" cy="195" r="105" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                        )}
                        {optionId === "llavero-corazon-chico" && (
                            <path d="M 150 276 C 150 276 50 193 50 125 C 50 81 81 58 115 58 C 135 58 150 71 150 71 C 150 71 165 58 185 58 C 219 58 250 81 250 125 C 250 193 150 276 150 276 Z" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                        )}
                        {optionId === "llavero-corazon-grande" && (
                            <path d="M 150 286 C 150 286 40 198 40 125 C 40 76 77 50 115 50 C 136 50 150 66 150 66 C 150 66 164 50 185 50 C 223 50 260 76 260 125 C 260 198 150 286 150 286 Z" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                        )}
                        {optionId === "llavero-camiseta" && (
                            <path d="M 125 85 L 175 85 L 182 98 C 182 98 218 110 245 127 L 223 168 L 198 155 L 198 290 L 102 290 L 102 155 L 77 168 L 55 127 C 82 110 118 98 118 98 Z" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                        )}
                        {(optionId === "llavero-rectangulo" || optionId === "llavero-portafoto") && (
                            <rect x="65" y="80" width="170" height="240" rx="22" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                        )}
                        {optionId === "llavero-credencial" && (
                            <rect x="70" y="75" width="160" height="250" rx="18" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                        )}
                        {optionId === "llavero-elipse" && (
                            <ellipse cx="150" cy="195" rx="85" ry="127" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                        )}
                        {optionId === "botinero" && (
                            <rect x="40" y="110" width="220" height="160" rx="22" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                        )}
                        {!isKeychainCategory && optionId !== "botinero" && (
                            <rect x="45" y="85" width="210" height="220" rx="18" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                        )}
                    </g>

                    {/* SUBLIMATION DESIGN PRINT AREA */}
                    <g clipPath={`url(#${maskId})`}>
                        <rect x="0" y="0" width="300" height="340" fill={baseColor} />

                        {activeImage ? (
                            <image
                                ref={imageElementRef}
                                href={activeImage}
                                x="0"
                                y="0"
                                width="300"
                                height="340"
                                preserveAspectRatio={activeFit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
                                transform={transformStr}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                className="cursor-move touch-none"
                            />
                        ) : (
                            <g className="opacity-60">
                                <rect x="0" y="0" width="300" height="340" fill="url(#white-gloss)" />
                                <circle cx="150" cy="195" r="40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                                <text x="150" y="190" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="bold">TU DISEÑO AQUÍ</text>
                                <text x="150" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10">({previewSide})</text>
                            </g>
                        )}

                        {/* Polymer Gloss Effect overlay */}
                        <ellipse cx="120" cy="130" rx="90" ry="50" fill="url(#white-gloss)" transform="rotate(-25 120 130)" pointerEvents="none" />
                    </g>
                </svg>
            </div>
        );
    };

    return (
        <section className="py-20 bg-background relative overflow-hidden" id="personalizador">
            
            {/* Elegant Background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none z-0"></div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center mb-10 text-center"
                >
                    <span className="text-label-sm font-label-sm font-bold uppercase tracking-widest text-primary bg-primary-container/30 border border-primary/20 px-4 py-1.5 rounded-full mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        ESTUDIO DE SUBLIMACIÓN & CUSTOM
                    </span>
                    <h2 className="text-display-md font-display-md text-on-surface mb-4 uppercase">
                        Diseñá Tu Propio Producto
                    </h2>
                    <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                        Elegí la categoría, seleccioná las opciones de impresión, subí tus imágenes y visualizá en tiempo real cómo quedará estampado con calidad premium.
                    </p>

                    {/* Integrated 3-Step Process Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mt-8 p-3 rounded-2xl bg-surface-container border border-outline-variant shadow-sm">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-outline-variant text-left transition-all shadow-sm">
                            <span className="w-10 h-10 rounded-lg bg-primary text-on-primary font-bold font-sans text-label-md flex items-center justify-center shrink-0">
                                01
                            </span>
                            <div>
                                <p className="text-label-md font-label-md font-bold text-on-surface uppercase tracking-wide">1. Modelo</p>
                                <p className="text-label-sm font-label-sm text-primary font-bold truncate">{currentOption?.label || activeCategory.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-outline-variant text-left transition-all shadow-sm">
                            <span className="w-10 h-10 rounded-lg bg-primary text-on-primary font-bold font-sans text-label-md flex items-center justify-center shrink-0">
                                02
                            </span>
                            <div>
                                <p className="text-label-md font-label-md font-bold text-on-surface uppercase tracking-wide">2. Diseño</p>
                                <p className="text-label-sm font-label-sm text-on-surface-variant">PNG, JPG o WebP</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-outline-variant text-left transition-all shadow-sm">
                            <span className="w-10 h-10 rounded-lg bg-primary text-on-primary font-bold font-sans text-label-md flex items-center justify-center shrink-0">
                                03
                            </span>
                            <div>
                                <p className="text-label-md font-label-md font-bold text-on-surface uppercase tracking-wide">3. Pedido</p>
                                <p className="text-label-sm font-label-sm text-on-surface-variant">Agregá al carrito y listo</p>
                            </div>
                        </div>
                    </div>

                    {/* Category Selector Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8 max-w-4xl w-full">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeCategoryId === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-label-md font-bold font-sans uppercase tracking-wide transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-primary text-on-primary border-primary shadow-md scale-105"
                                            : "bg-surface text-on-surface-variant border-outline-variant hover:border-primary/50 hover:text-on-surface"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
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
                        className="flex-1 w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-xl relative flex flex-col items-center justify-between"
                    >
                        {/* Status Header Badge */}
                        <div className="w-full flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
                                <h3 className="text-title-sm font-title-sm uppercase tracking-wider text-on-surface">
                                    Estudio Interactivo
                                </h3>
                            </div>
                            <span className="text-label-sm font-sans bg-primary text-on-primary font-bold px-3 py-1.5 rounded-full border border-primary/20">
                                {currentOption?.dimensions || "Sublimación Full"}
                            </span>
                        </div>

                        {/* Toggles for Multi-side printing */}
                        {isMultiSide && printMode === "2 Caras" && (
                            <div className="w-full flex justify-center mb-6">
                                <div className="inline-flex bg-surface-container p-1 rounded-xl border border-outline-variant">
                                    <button 
                                        onClick={() => setPreviewSide("frente")}
                                        className={`px-6 py-2 rounded-lg text-label-md font-bold uppercase tracking-widest transition-all ${
                                            previewSide === "frente" ? "bg-surface text-primary shadow-sm border border-outline-variant" : "text-on-surface-variant hover:text-on-surface"
                                        }`}
                                    >
                                        Cara Frente
                                    </button>
                                    <button 
                                        onClick={() => setPreviewSide("dorso")}
                                        className={`px-6 py-2 rounded-lg text-label-md font-bold uppercase tracking-widest transition-all ${
                                            previewSide === "dorso" ? "bg-surface text-primary shadow-sm border border-outline-variant" : "text-on-surface-variant hover:text-on-surface"
                                        }`}
                                    >
                                        Cara Dorso
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 3D / 2D Toggle & Canvas Container */}
                        <div className="w-full flex justify-end mb-2">
                            <button
                                onClick={() => setShow3D(!show3D)}
                                className="px-4 py-2 bg-surface text-primary border border-primary/30 rounded-xl text-label-sm font-bold uppercase tracking-wide hover:bg-primary-container/20 transition shadow-sm"
                            >
                                {show3D ? "Volver a Edición 2D" : "Ver en 3D"}
                            </button>
                        </div>
                        
                        <div className="w-full flex-1 flex items-center justify-center min-h-[500px] py-4 relative">
                            {show3D ? (
                                <Viewer3D 
                                    categoryId={activeCategoryId} 
                                    optionId={currentOption.id} 
                                    textureCanvasRef={textureCanvasRef} 
                                    isMultiSide={isMultiSide}
                                />
                            ) : (
                                renderInteractiveMockup()
                            )}
                            
                            {/* Hidden canvas used as texture for 3D */}
                            <canvas ref={textureCanvasRef} width={600} height={680} style={{ display: 'none' }} />
                        </div>

                        {/* Interactive Design Controls Bar */}
                        <div className="w-full bg-surface rounded-2xl p-4 border border-outline-variant shadow-sm mt-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-5 py-2.5 bg-primary text-on-primary text-label-md font-bold uppercase rounded-xl flex items-center gap-2 hover:bg-primary-dark transition shadow-sm cursor-pointer"
                                >
                                    <UploadCloud className="w-5 h-5" />
                                    {activeImage ? `Cambiar Imagen (${previewSide})` : `Subir Imagen (${previewSide})`}
                                </button>

                                {activeImage && (
                                    <button
                                        onClick={handleRemoveImage}
                                        className="p-2.5 bg-error-container text-on-error-container border border-error/20 rounded-xl hover:bg-error hover:text-on-error transition cursor-pointer"
                                        title="Eliminar imagen"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Fine Adjustment Controls */}
                            {activeImage && (
                                <div className="flex items-center gap-4 flex-wrap">
                                    {/* Zoom controls */}
                                    <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant">
                                        <ZoomOut
                                            className="w-4 h-4 text-on-surface-variant hover:text-primary cursor-pointer transition-colors"
                                            onClick={() => handleScale(-15)}
                                        />
                                        <span className="text-on-surface font-mono font-bold min-w-12 text-center text-label-sm">{activeScale}%</span>
                                        <ZoomIn
                                            className="w-4 h-4 text-on-surface-variant hover:text-primary cursor-pointer transition-colors"
                                            onClick={() => handleScale(15)}
                                        />
                                    </div>

                                    {/* Rotate Button */}
                                    <button
                                        onClick={handleRotate}
                                        className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl border border-outline-variant text-label-sm flex items-center gap-2 transition cursor-pointer"
                                        title="Rotar 90°"
                                    >
                                        <RotateCw className="w-4 h-4 text-primary" />
                                        <span className="font-mono font-bold">{activeRotation}°</span>
                                    </button>

                                    {/* Fit Mode Button */}
                                    <button
                                        onClick={handleFitToggle}
                                        className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl border border-outline-variant text-label-sm flex items-center gap-2 transition cursor-pointer"
                                        title="Modo de Ajuste"
                                    >
                                        <Maximize2 className="w-4 h-4 text-primary" />
                                        <span className="capitalize font-bold">{activeFit}</span>
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
                        className="flex-1 w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-10 border border-outline-variant shadow-xl flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-headline-sm font-headline-sm flex items-center gap-3 text-on-surface uppercase">
                                    <ImageIcon className="w-7 h-7 text-primary" />
                                    Detalles
                                </h3>
                                <span className="text-label-sm font-sans uppercase font-bold tracking-widest text-on-primary bg-primary border border-primary/20 px-4 py-1.5 rounded-full">
                                    {activeCategory.name}
                                </span>
                            </div>

                            {/* Dynamic Price Display */}
                            <div className="mb-8 bg-surface-container p-6 rounded-2xl border border-outline-variant flex items-baseline justify-between shadow-sm">
                                <div>
                                    <p className="text-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-2">Precio Unitario</p>
                                    <div className="text-display-sm font-display-sm text-primary flex items-end gap-2">
                                        {isLoadingPrices ? (
                                            <span className="h-10 w-32 bg-surface-container-highest animate-pulse rounded-lg"></span>
                                        ) : (
                                            <>
                                                ${currentOption ? currentOption.price.toLocaleString("es-AR") : "..."}
                                                <span className="text-title-sm font-title-sm text-on-surface-variant mb-1">ARS</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SELECTOR DE IMPRESION MULTICARA */}
                            {isMultiSide && (
                                <div className="mb-8">
                                    <h4 className="text-title-sm font-title-sm uppercase tracking-wider mb-4 text-on-surface">
                                        Tipo de Impresión
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {["1 Cara", "2 Caras", activeCategoryId !== "llaveros" ? "Completo" : null].filter(Boolean).map((mode) => {
                                            const isSelected = printMode === mode;
                                            return (
                                                <button
                                                    key={mode}
                                                    onClick={() => {
                                                        setPrintMode(mode as any);
                                                        if (mode !== "2 Caras") setPreviewSide("frente");
                                                    }}
                                                    className={`py-3 px-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "border-primary bg-primary-container/20 text-primary shadow-sm"
                                                            : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                                                    }`}
                                                >
                                                    <Repeat className="w-5 h-5" />
                                                    <span className="text-label-md font-bold uppercase">{mode}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* SELECTOR DE FORMA / OPCIÓN */}
                            <div className="mb-8">
                                <h4 className="text-title-sm font-title-sm uppercase tracking-wider mb-4 text-on-surface flex items-center justify-between">
                                    <span>Forma / Modelo</span>
                                    <span className="text-label-sm text-on-surface-variant font-normal">({activeCategory.options.length} opciones)</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                                    {activeCategory.options.map((opt) => {
                                        const isSelected = selectedItemType === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSelectedItemType(opt.id)}
                                                className={`py-4 px-4 rounded-xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "border-primary bg-primary-container/10 text-on-surface font-bold shadow-sm"
                                                        : "border-outline-variant bg-surface text-on-surface-variant hover:border-outline hover:text-on-surface"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {isSelected ? (
                                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                                    ) : (
                                                        <span className="w-3 h-3 rounded-full bg-outline-variant shrink-0"></span>
                                                    )}
                                                    <span className="text-label-md sm:text-label-lg truncate font-bold">{opt.label}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SELECTOR DE VARIANTE / ACABADO */}
                            <div className="mb-8">
                                <h4 className="text-title-sm font-title-sm uppercase tracking-wider mb-4 text-on-surface">
                                    Talla / Variante Base
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {activeCategory.variants.map((variant) => (
                                        <button
                                            key={variant}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-5 py-3 rounded-xl border-2 text-label-md font-bold transition-all cursor-pointer uppercase tracking-wide ${
                                                selectedVariant === variant
                                                    ? "border-primary bg-primary text-on-primary shadow-md scale-105"
                                                    : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                                            }`}
                                        >
                                            {variant}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Especificaciones */}
                            <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant mb-8 text-body-sm text-on-surface-variant leading-relaxed shadow-sm">
                                <div className="flex items-center gap-2 font-bold text-on-surface uppercase mb-3 text-label-lg">
                                    <Info className="w-5 h-5 text-primary" />
                                    Detalles del Producto:
                                </div>
                                <ul className="list-disc pl-5 space-y-2">
                                    {activeCategory.specs.map((spec, i) => (
                                        <li key={i}>{spec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* AGREGAR AL CARRITO CTA */}
                        <button
                            onClick={handleAddToCart}
                            disabled={(printMode === "2 Caras" && (!images.frente || !images.dorso)) || ((printMode === "1 Cara" || printMode === "Completo") && !images.frente) || !selectedItemType}
                            className="w-full py-5 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-headline-sm flex items-center justify-center gap-3 transition-all duration-300 uppercase tracking-widest shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 cursor-pointer mt-4"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {((printMode === "1 Cara" || printMode === "Completo") && !images.frente) || (printMode === "2 Caras" && (!images.frente || !images.dorso)) 
                                ? "Subí tu diseño para continuar" 
                                : "Agregar al Carrito"}
                        </button>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
