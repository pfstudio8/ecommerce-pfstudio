"use client";

import { useEffect, useState, useMemo } from "react";
import { MessageCircle, Sparkles, CheckCircle2, ChevronRight, HelpCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface CustomProductOption {
    id: string;
    name: string;
    category: 'apparel' | 'accessory' | 'drinkware';
    basePrice: number;
    description: string;
    sizes: string[];
    colors?: string[];
    printOptions?: { id: string; label: string; extraPrice: number }[];
}

const CUSTOM_PRODUCTS: CustomProductOption[] = [
    {
        id: "remera-oversize",
        name: "Remera Oversize",
        category: "apparel",
        basePrice: 19500,
        description: "Algodón peinado 24/1 premium, calce holgado y hombros caídos.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Negro", "Blanco", "Off-White", "Gris"],
        printOptions: [
            { id: "frente", label: "Estampa Frente", extraPrice: 0 },
            { id: "frente-espalda", label: "Frente + Espalda", extraPrice: 3500 },
            { id: "espalda", label: "Solo Espalda", extraPrice: 0 }
        ]
    },
    {
        id: "remera-boxy",
        name: "Remera Boxy Fit",
        category: "apparel",
        basePrice: 18500,
        description: "Corte cuadrado estructurado streetwear, cuello rib ancho y caída recta.",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Negro", "Blanco", "Off-White"],
        printOptions: [
            { id: "frente", label: "Estampa Frente", extraPrice: 0 },
            { id: "frente-espalda", label: "Frente + Espalda", extraPrice: 3500 },
            { id: "espalda", label: "Solo Espalda", extraPrice: 0 }
        ]
    },
    {
        id: "buzo-hoodie",
        name: "Buzo Hoodie Oversize",
        category: "apparel",
        basePrice: 32000,
        description: "Frisa invisible abrigada, capucha forrada doble y bolsillo canguro.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Negro", "Gris Melange", "Off-White"],
        printOptions: [
            { id: "frente", label: "Estampa Pecho/Frente", extraPrice: 0 },
            { id: "frente-espalda", label: "Frente + Espalda", extraPrice: 4000 },
            { id: "espalda", label: "Espalda Grande", extraPrice: 0 }
        ]
    },
    {
        id: "gorra-trucker",
        name: "Gorra Trucker",
        category: "accessory",
        basePrice: 9500,
        description: "Frente acolchado sublimable con red trasera y broche regulable.",
        sizes: ["Talle Único Regulable"],
        colors: ["Negro Total", "Negro con Frente Blanco", "Azul Marino"],
        printOptions: [
            { id: "frente", label: "Estampa Frente HD", extraPrice: 0 }
        ]
    },
    {
        id: "taza-ceramica",
        name: "Taza Cerámica Sublimada",
        category: "drinkware",
        basePrice: 6500,
        description: "Cerámica importada de alta blancura y brillo, apta microondas y lavavajillas.",
        sizes: ["330 ml"],
        colors: ["Blanca Clásica", "Mágica Termocromática (+$2.000)"],
        printOptions: [
            { id: "panoramica", label: "Estampa Panorámica 360°", extraPrice: 0 }
        ]
    },
    {
        id: "chopp-ceramico",
        name: "Chopp Cervecero",
        category: "drinkware",
        basePrice: 11000,
        description: "Chopp de cerámica pesada premium con borde dorado o plateado.",
        sizes: ["500 ml"],
        colors: ["Blanco Brillante"],
        printOptions: [
            { id: "frente-dorso", label: "Estampa Doble Cara", extraPrice: 0 }
        ]
    },
    {
        id: "llavero-polimero",
        name: "Llavero de Polímero",
        category: "accessory",
        basePrice: 2500,
        description: "Polímero de alto impacto ultra resistente con argolla sin fin.",
        sizes: ["Formato Camiseta", "Formato Corazón", "Formato Rectangular", "Formato Redondo"],
        printOptions: [
            { id: "ambas-caras", label: "Sublimación Doble Faz", extraPrice: 0 }
        ]
    }
];

export default function CustomWhatsAppCTA() {
    const [whatsapp, setWhatsapp] = useState("5493704245651");

    // Form state
    const [selectedProductId, setSelectedProductId] = useState(CUSTOM_PRODUCTS[0].id);
    const selectedProduct = useMemo(
        () => CUSTOM_PRODUCTS.find((p) => p.id === selectedProductId) || CUSTOM_PRODUCTS[0],
        [selectedProductId]
    );

    const [selectedSize, setSelectedSize] = useState(selectedProduct.sizes[0]);
    const [selectedColor, setSelectedColor] = useState(selectedProduct.colors?.[0] || "");
    const [selectedPrint, setSelectedPrint] = useState(selectedProduct.printOptions?.[0]?.id || "");
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");

    // Reset options when product changes
    useEffect(() => {
        setSelectedSize(selectedProduct.sizes[0]);
        setSelectedColor(selectedProduct.colors?.[0] || "");
        setSelectedPrint(selectedProduct.printOptions?.[0]?.id || "");
    }, [selectedProduct]);

    // Fetch store info
    useEffect(() => {
        const fetchStoreInfo = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'store_info')
                    .single();

                if (data?.value?.whatsapp) {
                    setWhatsapp(data.value.whatsapp);
                }
            } catch (err) {
                // Fallback kept
            }
        };

        fetchStoreInfo();
    }, []);

    // Price calculation
    const currentPrintOption = selectedProduct.printOptions?.find((p) => p.id === selectedPrint);
    const extraPrintPrice = currentPrintOption?.extraPrice || 0;
    const isMagica = selectedColor.includes("Mágica");
    const extraMagica = isMagica ? 2000 : 0;

    const unitPrice = selectedProduct.basePrice + extraPrintPrice + extraMagica;
    const isBulkDiscount = quantity >= 10;
    const discountRate = isBulkDiscount ? 0.10 : 0;
    const subtotal = unitPrice * quantity;
    const discountAmount = subtotal * discountRate;
    const finalTotal = subtotal - discountAmount;

    const handleWhatsAppSubmit = () => {
        const lines = [
            "¡Hola PFSTUDIO! 👋 Quiero coordinar un pedido personalizado:",
            `• *Producto*: ${selectedProduct.name}`,
            `• *Talle/Medida*: ${selectedSize}`,
            selectedColor ? `• *Color/Variante*: ${selectedColor}` : null,
            currentPrintOption ? `• *Estampa*: ${currentPrintOption.label}` : null,
            `• *Cantidad*: ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}${isBulkDiscount ? ' (con 10% OFF por cantidad)' : ''}`,
            `• *Precio estimado*: $${finalTotal.toLocaleString("es-AR")} ${quantity > 1 ? `($${Math.round(finalTotal / quantity).toLocaleString("es-AR")} c/u)` : ''}`,
            notes.trim() ? `• *Detalle/Idea*: ${notes.trim()}` : null,
            "",
            "¿Cómo les envío el diseño o imagen para preparar la muestra digital?"
        ].filter(Boolean).join("\n");

        const encoded = encodeURIComponent(lines);
        window.open(`https://wa.me/${whatsapp}?text=${encoded}`, "_blank");
    };

    return (
        <section id="personalizados" className="py-16 md:py-24 bg-surface border-b border-outline-variant relative">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant text-secondary text-label-sm font-bold uppercase tracking-wider mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>Taller de Confección & Estampado</span>
                    </div>
                    <h2 className="text-headline-lg md:text-display-md font-bold text-on-surface tracking-tight">
                        Armá tu Pedido Personalizado
                    </h2>
                    <p className="text-body-md text-on-surface-variant mt-2">
                        Seleccioná tu prenda o artículo, elegí el calce y opciones, y coordinamos la muestra digital y producción directamente por WhatsApp.
                    </p>
                </div>

                {/* Configurator Box */}
                <div className="bg-surface-container-low border border-outline-variant rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        
                        {/* Left Column: Product Selection & Configuration */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            {/* Step 1: Choose Product */}
                            <div>
                                <label className="text-label-sm font-bold uppercase tracking-wider text-secondary block mb-3">
                                    1. Elegí el producto
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {CUSTOM_PRODUCTS.map((prod) => {
                                        const isSelected = prod.id === selectedProductId;
                                        return (
                                            <button
                                                key={prod.id}
                                                type="button"
                                                onClick={() => setSelectedProductId(prod.id)}
                                                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                                                    isSelected
                                                        ? 'bg-surface-container-highest border-primary text-on-surface ring-1 ring-primary shadow-sm'
                                                        : 'bg-surface-container border-outline-variant/60 text-on-surface-variant hover:border-outline hover:text-on-surface'
                                                }`}
                                            >
                                                <span className="text-sm font-bold leading-snug line-clamp-1">{prod.name}</span>
                                                <span className="text-xs font-semibold text-primary">
                                                    desde ${prod.basePrice.toLocaleString("es-AR")}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-on-surface-variant mt-2.5">
                                    {selectedProduct.description}
                                </p>
                            </div>

                            {/* Step 2: Choose Size / Format */}
                            <div>
                                <label className="text-label-sm font-bold uppercase tracking-wider text-secondary block mb-3">
                                    2. Talle o Formato
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.sizes.map((size) => {
                                        const isSelected = selectedSize === size;
                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                                                    isSelected
                                                        ? 'bg-primary text-on-primary border-primary'
                                                        : 'bg-surface-container border-outline-variant text-on-surface hover:border-outline'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 3: Choose Color / Variant (if applicable) */}
                            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                                <div>
                                    <label className="text-label-sm font-bold uppercase tracking-wider text-secondary block mb-3">
                                        3. Color o Estilo
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProduct.colors.map((color) => {
                                            const isSelected = selectedColor === color;
                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                                                        isSelected
                                                            ? 'bg-secondary-container text-on-secondary-container border-secondary'
                                                            : 'bg-surface-container border-outline-variant text-on-surface hover:border-outline'
                                                    }`}
                                                >
                                                    {color}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Print Options */}
                            {selectedProduct.printOptions && selectedProduct.printOptions.length > 0 && (
                                <div>
                                    <label className="text-label-sm font-bold uppercase tracking-wider text-secondary block mb-3">
                                        4. Ubicación de la estampa
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProduct.printOptions.map((opt) => {
                                            const isSelected = selectedPrint === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setSelectedPrint(opt.id)}
                                                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                                        isSelected
                                                            ? 'bg-primary-container text-on-primary-container border-primary'
                                                            : 'bg-surface-container border-outline-variant text-on-surface hover:border-outline'
                                                    }`}
                                                >
                                                    <span>{opt.label}</span>
                                                    {opt.extraPrice > 0 && (
                                                        <span className="text-[11px] opacity-80">(+${opt.extraPrice.toLocaleString("es-AR")})</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Optional Notes */}
                            <div>
                                <label className="text-label-sm font-bold uppercase tracking-wider text-secondary block mb-2">
                                    Idea o detalle del diseño (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ej: Logo en el pecho y frase en la espalda, foto familiar..."
                                    className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface placeholder-outline focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Right Column: Order Summary & WhatsApp Action */}
                        <div className="lg:col-span-5 flex flex-col justify-between bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
                            <div className="space-y-5">
                                <div className="border-b border-outline-variant/60 pb-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-outline">Resumen de cotización</span>
                                    <h3 className="text-xl font-bold text-on-surface mt-1">{selectedProduct.name}</h3>
                                    <p className="text-xs text-on-surface-variant mt-0.5">
                                        {selectedSize} {selectedColor ? `• ${selectedColor}` : ''}
                                    </p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-center justify-between py-2 border-b border-outline-variant/60">
                                    <span className="text-sm font-medium text-on-surface">Cantidad de unidades:</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-high transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm text-on-surface">{quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-high transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Price breakdown */}
                                <div className="space-y-2 text-sm text-on-surface-variant">
                                    <div className="flex justify-between">
                                        <span>Precio unitario estimado:</span>
                                        <span className="font-semibold text-on-surface">${unitPrice.toLocaleString("es-AR")}</span>
                                    </div>
                                    {isBulkDiscount && (
                                        <div className="flex justify-between text-primary font-medium">
                                            <span>Descuento 10% (+10 u.):</span>
                                            <span>-${Math.round(discountAmount).toLocaleString("es-AR")}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-outline-variant/60 flex justify-between items-baseline">
                                        <span className="text-base font-bold text-on-surface">Total estimado:</span>
                                        <span className="text-2xl font-black text-primary">${Math.round(finalTotal).toLocaleString("es-AR")}</span>
                                    </div>
                                </div>

                                {isBulkDiscount ? (
                                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        <span>¡10% de descuento por volumen aplicado!</span>
                                    </div>
                                ) : (
                                    <div className="text-xs text-outline text-center">
                                        💡 10% de descuento automático a partir de 10 unidades
                                    </div>
                                )}
                            </div>

                            {/* WhatsApp Button */}
                            <div className="mt-8 space-y-3">
                                <button
                                    type="button"
                                    onClick={handleWhatsAppSubmit}
                                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-5 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg active:scale-98"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Coordinar pedido por WhatsApp
                                </button>
                                <p className="text-[11px] text-outline text-center leading-tight">
                                    Te respondemos al instante con la muestra digital y confirmación de tiempo de entrega.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Trust Highlights */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-outline-variant/60 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Muestra digital previa gratis</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Sublimación & Vinilo HD inalterable</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Producción en 2 a 4 días hábiles</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Envíos a todo el país o retiro en taller</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
