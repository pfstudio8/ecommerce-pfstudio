"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Upload, CheckCircle2, MessageCircle, ShoppingBag, ArrowRight, Trash2, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProductDrawerStore } from "../store/productDrawer";
import { useCartStore } from "@/features/orders/store/cart";
import BenefitTierBar, { getUnlockedBenefitSummary } from "@/features/orders/components/BenefitTierBar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PrintOption {
    id: string;
    label: string;
    extraPrice: number;
}

const DEFAULT_PRINT_OPTIONS: PrintOption[] = [
    { id: "frente", label: "Estampa Frente", extraPrice: 0 },
    { id: "frente-espalda", label: "Frente + Espalda", extraPrice: 3500 },
    { id: "espalda", label: "Solo Espalda", extraPrice: 0 }
];

export default function QuickCustomizeDrawer() {
    const { isOpen, product, closeDrawer } = useProductDrawerStore();
    const addItem = useCartStore((state) => state.addItem);

    const [selectedSize, setSelectedSize] = useState<string>("M");
    const [selectedPrint, setSelectedPrint] = useState<string>("frente");
    const [quantity, setQuantity] = useState(1);
    const [designFile, setDesignFile] = useState<{ name: string; url: string } | null>(null);
    const [notes, setNotes] = useState("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [whatsapp, setWhatsapp] = useState("5493704245651");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch store WhatsApp
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
                // Silently fallback
            }
        };
        fetchStoreInfo();
    }, []);

    // Reset drawer state when product opens
    useEffect(() => {
        if (product) {
            const defaultSize = product.product_stock?.find(s => (s.stock_quantity ?? 0) > 0)?.size || "M";
            setSelectedSize(defaultSize);
            setSelectedPrint("frente");
            setQuantity(1);
            setDesignFile(null);
            setNotes("");
            setActiveImageIndex(0);
        }
    }, [product]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                closeDrawer();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closeDrawer]);

    if (!product) return null;

    // Available variants from stock
    const productVariants = product.product_stock && product.product_stock.length > 0
        ? product.product_stock
        : [{ size: "S", stock_quantity: 10 }, { size: "M", stock_quantity: 10 }, { size: "L", stock_quantity: 10 }, { size: "XL", stock_quantity: 10 }];

    const images = product.images && product.images.length > 0
        ? product.images
        : [product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop'];

    // Price calculations
    const currentPrint = DEFAULT_PRINT_OPTIONS.find(p => p.id === selectedPrint) || DEFAULT_PRINT_OPTIONS[0];
    const unitPrice = (product.price || 0) + currentPrint.extraPrice;
    const isBulk = quantity >= 10;
    const subtotal = unitPrice * quantity;
    const discount = isBulk ? subtotal * 0.10 : 0;
    const finalTotal = subtotal - discount;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 15 * 1024 * 1024) {
                toast.error("El archivo no debe superar los 15MB");
                return;
            }
            const previewUrl = URL.createObjectURL(file);
            setDesignFile({ name: file.name, url: previewUrl });
            toast.success("Diseño cargado con éxito");
        }
    };

    const handleWhatsAppSubmit = () => {
        const unlockedRewards = getUnlockedBenefitSummary(quantity);
        const lines = [
            "¡Hola PFSTUDIO! 👋 Quiero coordinar un pedido personalizado:",
            `• *Producto*: ${product.name}`,
            `• *Talle*: ${selectedSize}`,
            `• *Estampa*: ${currentPrint.label}`,
            `• *Cantidad*: ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}${isBulk ? ' (10% OFF pack aplicado)' : ''}`,
            unlockedRewards.length > 0 ? `• *Beneficios alcanzados*: ${unlockedRewards.join(" + ")}` : null,
            `• *Archivo de diseño*: ${designFile ? `Adjuntaré "${designFile.name}"` : 'Tengo el archivo listo para enviar'}`,
            notes.trim() ? `• *Indicaciones*: ${notes.trim()}` : null,
            `• *Total estimado*: $${Math.round(finalTotal).toLocaleString("es-AR")}`,
            "",
            "¿Cómo les envío el archivo para confirmar la muestra digital previa?"
        ].filter(Boolean).join("\n");

        window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(lines)}`, "_blank");
    };

    const handleAddToCart = () => {
        addItem(product, selectedSize);
        toast.success(`Agregaste ${product.name} (Talle ${selectedSize}) al carrito`);
        closeDrawer();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDrawer}
                        className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
                    />

                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        {/* Slide-out Drawer Panel */}
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 260 }}
                            className="w-screen max-w-md bg-surface text-on-surface shadow-2xl flex flex-col justify-between overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="px-6 py-4 border-b border-outline-variant/40 flex items-center justify-between shrink-0 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
                                        Personalización & Compra Rápida
                                    </h3>
                                </div>
                                <button
                                    onClick={closeDrawer}
                                    className="p-2 -mr-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
                                    aria-label="Cerrar panel"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                                {/* Image Preview & Selector */}
                                <div className="space-y-3">
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container-high shadow-soft">
                                        <Image
                                            src={images[activeImageIndex]}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="400px"
                                        />
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-surface/85 backdrop-blur-md text-[11px] font-bold text-on-surface">
                                            {product.category || "Prenda"}
                                        </div>
                                    </div>

                                    {/* Small image thumbnails if multiple */}
                                    {images.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {images.map((img, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setActiveImageIndex(i)}
                                                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                                                        activeImageIndex === i ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                                                    }`}
                                                >
                                                    <Image src={img} alt="" fill className="object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Product Title & Base Price */}
                                <div className="border-b border-outline-variant/40 pb-4">
                                    <h2 className="text-xl font-extrabold text-on-surface leading-snug">
                                        {product.name}
                                    </h2>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-xl font-extrabold text-primary">
                                            ${product.price.toLocaleString("es-AR")}
                                        </span>
                                        <span className="text-xs text-outline font-medium">precio base unitario</span>
                                    </div>
                                    {product.description && (
                                        <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                                            {product.description}
                                        </p>
                                    )}
                                </div>

                                {/* Step 1: Choose Size */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-secondary">
                                            1. Elegí tu Talle
                                        </label>
                                        <Link
                                            href={`/product/${product.id}`}
                                            onClick={closeDrawer}
                                            className="text-[11px] font-semibold text-primary hover:underline"
                                        >
                                            Ver tabla de medidas →
                                        </Link>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {productVariants.map((variant) => {
                                            const isAvailable = (variant.stock_quantity ?? 0) > 0;
                                            const isSelected = selectedSize === variant.size;

                                            if (!isAvailable) {
                                                return (
                                                    <span
                                                        key={variant.size}
                                                        className="px-4 py-2 rounded-full text-xs font-bold border border-outline-variant/30 text-outline/40 line-through cursor-not-allowed select-none"
                                                    >
                                                        {variant.size}
                                                    </span>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={variant.size}
                                                    type="button"
                                                    onClick={() => setSelectedSize(variant.size)}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                                        isSelected
                                                            ? "bg-primary text-on-primary shadow-sm"
                                                            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                                                    }`}
                                                >
                                                    {variant.size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 2: Print Placement */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-secondary block">
                                        2. Ubicación del estampado
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {DEFAULT_PRINT_OPTIONS.map((opt) => {
                                            const isSelected = selectedPrint === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setSelectedPrint(opt.id)}
                                                    className={`p-3 rounded-2xl text-left text-xs font-semibold flex items-center justify-between border transition-all ${
                                                        isSelected
                                                            ? "bg-primary/10 border-primary text-on-surface"
                                                            : "bg-surface-container border-transparent text-on-surface-variant hover:border-outline-variant"
                                                    }`}
                                                >
                                                    <span className="font-bold">{opt.label}</span>
                                                    <span className="text-[11px] text-primary font-bold">
                                                        {opt.extraPrice > 0 ? `+$${opt.extraPrice.toLocaleString("es-AR")}` : "Incluida"}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 3: Design Upload (.PNG / .JPG) */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-secondary block">
                                        3. Subí tu diseño o logo (.png / .jpg)
                                    </label>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />

                                    {designFile ? (
                                        <div className="p-3.5 rounded-2xl bg-surface-container flex items-center justify-between gap-3 border border-primary/30">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-outline-variant/40">
                                                    <Image src={designFile.url} alt="Diseño preview" fill className="object-contain p-1" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-on-surface truncate">{designFile.name}</p>
                                                    <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Listo para coordinar muestra
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setDesignFile(null)}
                                                className="p-2 text-outline hover:text-error hover:bg-error-container/30 rounded-full transition-colors"
                                                title="Quitar archivo"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-5 rounded-2xl border-2 border-dashed border-outline-variant hover:border-primary/60 bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-surface-container-highest group-hover:bg-primary group-hover:text-on-primary text-primary flex items-center justify-center transition-colors mb-2">
                                                <Upload className="w-4 h-4" />
                                            </div>
                                            <p className="text-xs font-bold text-on-surface">
                                                Hacé clic para cargar tu imagen
                                            </p>
                                            <p className="text-[11px] text-outline mt-0.5">
                                                PNG con fondo transparente o JPG de alta resolución (hasta 15MB)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Step 4: Optional notes */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-secondary block">
                                        Indicaciones o texto para la estampa (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Ej: Logo chico en el pecho izquierdo, centrado..."
                                        className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-xs text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                            </div>

                            {/* Drawer Footer & Actions */}
                            <div className="p-6 border-t border-outline-variant/40 bg-surface-container-low shrink-0 space-y-4">
                                {/* Quantity & Total Breakdown */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-on-surface-variant">Cantidad:</span>
                                        <div className="flex items-center gap-1.5 bg-surface-container rounded-full p-1 border border-outline-variant/40">
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-7 h-7 rounded-full bg-surface flex items-center justify-center font-bold text-xs text-on-surface hover:bg-surface-container-high transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-6 text-center text-xs font-bold text-on-surface">{quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-7 h-7 rounded-full bg-surface flex items-center justify-center font-bold text-xs text-on-surface hover:bg-surface-container-high transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[11px] text-outline block">Total estimado</span>
                                        <span className="text-xl font-black text-primary">
                                            ${Math.round(finalTotal).toLocaleString("es-AR")}
                                        </span>
                                    </div>
                                </div>

                                {isBulk && (
                                    <div className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>¡10% OFF aplicado por pedido de 10+ unidades!</span>
                                    </div>
                                )}

                                {/* Benefit Progress Bar (Nook-style) */}
                                <BenefitTierBar itemCount={quantity} compact />

                                {/* Dual Action Buttons */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={handleWhatsAppSubmit}
                                        className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>Pedir por WhatsApp con este diseño</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        className="w-full py-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 transition-colors border border-outline-variant/40"
                                    >
                                        <ShoppingBag className="w-4 h-4 text-primary" />
                                        <span>Agregar a mi Bolsa de Pedido</span>
                                    </button>
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
