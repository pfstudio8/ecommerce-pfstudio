"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, ShoppingBag, Check, ArrowRight, MessageCircle, Layers, CheckCircle2 } from "lucide-react";
import { useProductDrawerStore } from "../store/productDrawer";
import { useCartStore } from "@/features/orders/store/cart";
import { Product } from "@/types/product";
import { toast } from "sonner";

interface HotspotItem {
    id: string;
    number: string;
    product: Product;
    // Percentage positions on image (0% to 100%)
    top: number;
    left: number;
    materialNote?: string;
}

interface LookbookPreset {
    id: string;
    tag: string;
    title: string;
    subtitle: string;
    environment: string;
    image: string;
    hotspots: HotspotItem[];
}

const LOOKBOOK_PRESETS: LookbookPreset[] = [
    {
        id: "set-taller-eventos",
        tag: "Set 01 // Taller & Merch",
        title: "Set Regalería, Vasos & Eventos",
        subtitle: "Chopps, vasos cristal con tapa bambú, vasos de trago, rompecabezas y gorras trucker.",
        environment: "Producción Real en Taller PFSTUDIO",
        image: "/images/lookbook-taller.jpg",
        hotspots: [
            {
                id: "vaso-chopp",
                number: "01",
                top: 25,
                left: 50,
                materialNote: "Polímero térmico brillante • Sublimación HD",
                product: {
                    id: "vaso-chopp-personalizado",
                    name: "Vaso Chopp Cervecero Térmico",
                    category: "Vasos & Chopps",
                    price: 12500,
                    image_url: "/images/crop-vaso-chopp-v2.jpg",
                    images: ["/images/crop-vaso-chopp-v2.jpg", "/images/lookbook-taller.jpg"],
                    description: "Vaso Chopp térmico con asa ergonómica de polímero virgen de alta densidad. Sublimación fotográfica inalterable, apto para freezer.",
                    stock: 45,
                    active: true,
                    product_stock: [{ size: "500ml", stock_quantity: 45 }]
                }
            },
            {
                id: "vaso-cristal",
                number: "02",
                top: 45,
                left: 66,
                materialNote: "Vidrio esmerilado satinado • Tapa bambú + sorbete",
                product: {
                    id: "vaso-cristal-bambu",
                    name: "Vaso Cristal Esmerilado con Tapa Bambú",
                    category: "Cristalería",
                    price: 9800,
                    image_url: "/images/crop-vaso-cristal-v2.jpg",
                    images: ["/images/crop-vaso-cristal-v2.jpg", "/images/lookbook-taller.jpg"],
                    description: "Vaso cilíndrico de vidrio esmerilado satinado con tapa de bambú natural y sorbete de vidrio reutilizable. Sublimación 360°.",
                    stock: 35,
                    active: true,
                    product_stock: [{ size: "450ml", stock_quantity: 35 }]
                }
            },
            {
                id: "vaso-trago",
                number: "03",
                top: 45,
                left: 35,
                materialNote: "Acrílico cristal resistente • Tapa a rosca",
                product: {
                    id: "vaso-trago-sorbete",
                    name: "Vaso de Trago con Tapa y Sorbete",
                    category: "Vasos & Tragos",
                    price: 8500,
                    image_url: "/images/crop-vaso-trago-v2.jpg",
                    images: ["/images/crop-vaso-trago-v2.jpg", "/images/lookbook-taller.jpg"],
                    description: "Vaso rígido cristal para tragos y eventos con tapa antiderrame y sorbete al tono. Personalizado con vinilo o DTF UV.",
                    stock: 50,
                    active: true,
                    product_stock: [{ size: "550ml", stock_quantity: 50 }]
                }
            },
            {
                id: "rompecabezas",
                number: "04",
                top: 72,
                left: 27,
                materialNote: "Cartón prensado rígido • Acabado brillante",
                product: {
                    id: "rompecabezas-personalizado",
                    name: "Rompecabezas Sublimado Personalizado",
                    category: "Merch & Regalos",
                    price: 6200,
                    image_url: "/images/crop-rompecabezas-v2.jpg",
                    images: ["/images/crop-rompecabezas-v2.jpg", "/images/lookbook-taller.jpg"],
                    description: "Rompecabezas personalizado para souvenirs y eventos. Encastre preciso con capa de brillo protectora ultra durable.",
                    stock: 60,
                    active: true,
                    product_stock: [
                        { size: "Chico (A5 - 30 pzas)", stock_quantity: 30 },
                        { size: "Grande (A4 - 60 pzas)", stock_quantity: 30 }
                    ]
                }
            },
            {
                id: "gorra-trucker",
                number: "05",
                top: 73,
                left: 77,
                materialNote: "Frente acolchado blanco • Red respirable",
                product: {
                    id: "gorra-trucker-roja",
                    name: "Gorra Trucker Frente Blanco & Red",
                    category: "Gorras",
                    price: 9500,
                    image_url: "/images/crop-gorra-trucker-v2.jpg",
                    images: ["/images/crop-gorra-trucker-v2.jpg", "/images/lookbook-taller.jpg"],
                    description: "Gorra modelo trucker combinada con frente blanco acolchado para sublimación full color y red respirable trasera con broche regulable.",
                    stock: 30,
                    active: true,
                    product_stock: [{ size: "Regulable", stock_quantity: 30 }]
                }
            }
        ]
    },
    {
        id: "merch-pack",
        tag: "Look 02 // Merch de Autor",
        title: "Merch Pack Creativo & Hogar",
        subtitle: "Remera Oversize Marfil combinada con Taza Cerámica Sublimada y Tote Bag.",
        environment: "Edición Diseñador",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1600&auto=format&fit=crop",
        hotspots: [
            {
                id: "remera-marfil",
                number: "01",
                top: 36,
                left: 46,
                materialNote: "Tono crudo hilado peinado suave",
                product: {
                    id: "remera-marfil-oversize",
                    name: "Remera Classic Fit Marfil Peinado",
                    category: "Remeras",
                    price: 16500,
                    image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop",
                    description: "Tono crudo / marfil con hilado peinado suave al tacto y caída holgada.",
                    stock: 30,
                    active: true,
                    product_stock: [
                        { size: "S", stock_quantity: 6 },
                        { size: "M", stock_quantity: 10 },
                        { size: "L", stock_quantity: 10 },
                        { size: "XL", stock_quantity: 4 }
                    ]
                }
            },
            {
                id: "taza-ceramica",
                number: "02",
                top: 66,
                left: 69,
                materialNote: "Cerámica clase AAA • Apta microondas",
                product: {
                    id: "taza-ceramica-sublimada",
                    name: "Taza Cerámica Importada 11oz",
                    category: "Tazas",
                    price: 6500,
                    image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
                    description: "Cerámica ultra brillante clase AAA, apta para microondas y lavavajillas. Colores vibrantes permanentes.",
                    stock: 50,
                    active: true,
                    product_stock: [{ size: "Único", stock_quantity: 50 }]
                }
            },
            {
                id: "tote-bag",
                number: "03",
                top: 80,
                left: 31,
                materialNote: "Lienzo 100% algodón 40x40cm",
                product: {
                    id: "tote-bag-lienzo",
                    name: "Tote Bag Lienzo Pesado 40x40",
                    category: "Accesorios",
                    price: 8500,
                    image_url: "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?q=80&w=600&auto=format&fit=crop",
                    description: "Lienzo grueso con costuras reforzadas y manijas anchas. Estampado serigráfico o DTF nítido.",
                    stock: 45,
                    active: true,
                    product_stock: [{ size: "Único", stock_quantity: 45 }]
                }
            }
        ]
    },
    {
        id: "hoodie-invierno",
        tag: "Look 03 // Winter Heavy",
        title: "Hoodie Frisa & Beanie",
        subtitle: "Corte oversize con capucha forrada doble y gorro de lana acanalada.",
        environment: "Colección Taller 2026",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop",
        hotspots: [
            {
                id: "gorro-beanie",
                number: "01",
                top: 14,
                left: 50,
                materialNote: "Tejido acanalado doble capa",
                product: {
                    id: "gorro-beanie-rib",
                    name: "Gorro Beanie Rib PFStudio",
                    category: "Accesorios",
                    price: 7500,
                    image_url: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=600&auto=format&fit=crop",
                    description: "Tejido suave al tacto con etiqueta de ecocuero grabada a láser.",
                    stock: 35,
                    active: true,
                    product_stock: [{ size: "Único", stock_quantity: 35 }]
                }
            },
            {
                id: "buzo-hoodie",
                number: "02",
                top: 48,
                left: 52,
                materialNote: "Frisa de 330gr • Capucha doble faz",
                product: {
                    id: "buzo-hoodie-frisa",
                    name: "Buzo Hoodie Frisa Pesada 330gr",
                    category: "Buzos",
                    price: 34000,
                    image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop",
                    description: "Algodón pesado frizado con bolsillo canguro frontal y ojalillos metálicos esmaltados.",
                    stock: 22,
                    active: true,
                    product_stock: [
                        { size: "S", stock_quantity: 5 },
                        { size: "M", stock_quantity: 8 },
                        { size: "L", stock_quantity: 6 },
                        { size: "XL", stock_quantity: 3 }
                    ]
                }
            }
        ]
    }
];

export default function LookbookHotspots() {
    const [activePresetIndex, setActivePresetIndex] = useState(0);
    const [activeHotspotId, setActiveHotspotId] = useState<string | null>("vaso-chopp");
    const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

    const openDrawer = useProductDrawerStore((state) => state.openDrawer);
    const addItem = useCartStore((state) => state.addItem);

    const currentPreset = LOOKBOOK_PRESETS[activePresetIndex];
    const highlightedId = hoveredHotspotId || activeHotspotId;

    const handleSelectPreset = (index: number) => {
        setActivePresetIndex(index);
        setActiveHotspotId(LOOKBOOK_PRESETS[index].hotspots[0]?.id || null);
        setHoveredHotspotId(null);
    };

    const handleCustomize = (product: Product) => {
        openDrawer(product);
    };

    const handleQuickAdd = (product: Product) => {
        const defaultSize = product.product_stock?.[0]?.size || "Único";
        addItem(product, defaultSize);
        toast.success(`Agregaste ${product.name} al carrito`);
    };

    // Calculate total price of current look
    const lookTotalPrice = currentPreset.hotspots.reduce((acc, h) => acc + h.product.price, 0);

    const handleAddAllToCart = () => {
        currentPreset.hotspots.forEach(spot => {
            const defaultSize = spot.product.product_stock?.[0]?.size || "Único";
            addItem(spot.product, defaultSize);
        });
        toast.success(`¡Agregaste las ${currentPreset.hotspots.length} prendas del look a tu bolsa!`);
    };

    const handleOrderFullLook = () => {
        const lines = [
            `¡Hola PFSTUDIO! 👋 Quiero coordinar el look completo *${currentPreset.title}*:`,
            "",
            ...currentPreset.hotspots.map((h, i) => `${i + 1}. *${h.product.name}* (${h.product.category}) - $${h.product.price.toLocaleString("es-AR")}`),
            "",
            `• *Total aproximado del set*: $${lookTotalPrice.toLocaleString("es-AR")}`,
            `• *Beneficios*: Incluye muestra digital previa gratis y sticker pack PFSTUDIO de regalo.`,
            "",
            "¿Cómo coordinamos los talles y los archivos de estampado?"
        ].join("\n");

        window.open(`https://wa.me/5493704245651?text=${encodeURIComponent(lines)}`, "_blank");
    };

    return (
        <section className="py-20 md:py-28 bg-[#fdf8ee] text-[#472825] border-t border-[#472825]/10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-margin md:px-gutter-desktop flex flex-col gap-12">

                {/* Editorial Header (Wonder Theme Style) */}
                <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#472825]/10 pb-8"
                >
                    <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#454e15]" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#454e15]">
                                SHOP THE LOOK // WONDER EDITORIAL
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-[#472825] tracking-tight leading-none">
                            El Set Completo en Vivo
                        </h2>
                        <p className="text-sm sm:text-base text-[#472825]/75 leading-relaxed font-medium">
                            Navegá las piezas sobre la foto de estudio. Tocá los puntos numerados para inspeccionar el hilado, elegir tu talle o personalizar la prenda con tu estampa.
                        </p>
                    </div>

                    {/* Presets Switcher Tabs (Wonder Theme Pill Bar) */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-[#FFF4E2] rounded-full border border-[#472825]/15 shadow-sm self-start md:self-auto overflow-x-auto max-w-full">
                        {LOOKBOOK_PRESETS.map((preset, idx) => {
                            const isSelected = activePresetIndex === idx;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleSelectPreset(idx)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                                        isSelected
                                            ? "bg-[#472825] text-[#FFF4E2] shadow-sm scale-102"
                                            : "text-[#472825]/70 hover:text-[#472825] hover:bg-[#472825]/5"
                                    }`}
                                >
                                    {preset.tag}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Main Interactive Stage: Image with Hotspots + Side Product Deck */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left 7 Columns: Wide Interactive Lifestyle Image */}
                    <motion.div 
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => setActiveHotspotId(null)}
                        className="lg:col-span-7 relative aspect-[4/5] sm:aspect-[16/11] rounded-3xl overflow-hidden bg-[#472825]/5 shadow-2xl border border-[#472825]/15 group select-none cursor-default"
                    >
                        <Image
                            src={currentPreset.image}
                            alt={currentPreset.title}
                            fill
                            priority
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                            sizes="(max-width: 1024px) 100vw, 58vw"
                        />

                        {/* Subtle vignette gradient so white pins contrast crisp */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                        {/* Top-left environmental badge */}
                        <div className="absolute top-5 left-5 z-20 px-4 py-1.5 rounded-full bg-[#FFF4E2]/90 backdrop-blur-md text-xs font-black text-[#472825] border border-[#472825]/15 shadow-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#454e15] animate-pulse" />
                            <span>{currentPreset.title}</span>
                            <span className="text-[10px] text-[#472825]/50 font-normal">| {currentPreset.environment}</span>
                        </div>

                        {/* Hotspot Markers (Wonder Theme Styled Pins) */}
                        {currentPreset.hotspots.map((spot) => {
                            const isSelected = activeHotspotId === spot.id;
                            const isHovered = hoveredHotspotId === spot.id;
                            const isLit = isSelected || isHovered;

                            return (
                                <div
                                    key={spot.id}
                                    style={{ top: `${spot.top}%`, left: `${spot.left}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                                >
                                    {/* Translucent Pulse Wave */}
                                    <span
                                        className={`absolute inset-0 rounded-full transition-transform ${
                                            isLit
                                                ? "bg-[#FFF4E2]/60 animate-ping"
                                                : "bg-[#FFF4E2]/30 group-hover:animate-ping"
                                        }`}
                                    />

                                    {/* Circular Pin with Number */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveHotspotId(isSelected ? null : spot.id);
                                        }}
                                        onMouseEnter={() => setHoveredHotspotId(spot.id)}
                                        onMouseLeave={() => setHoveredHotspotId(null)}
                                        aria-label={`Ver ${spot.product.name}`}
                                        className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-xs shadow-2xl transition-all duration-300 ${
                                            isLit
                                                ? "bg-[#472825] text-[#FFF4E2] ring-4 ring-[#FFF4E2] scale-110 shadow-[0_0_20px_rgba(71,40,37,0.5)]"
                                                : "bg-[#FFF4E2] text-[#472825] hover:bg-[#472825] hover:text-[#FFF4E2] hover:scale-105 border border-[#472825]/20 shadow-md"
                                        }`}
                                    >
                                        <span>{spot.number}</span>
                                    </button>

                                    {/* Pequeña pantallita emergente / Notificación compacta arriba del pin */}
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 6 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 6 }}
                                                transition={{ duration: 0.18, ease: "easeOut" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCustomize(spot.product);
                                                }}
                                                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#FFF4E2]/95 backdrop-blur-xl border border-[#472825]/20 shadow-2xl rounded-2xl p-2.5 flex items-center gap-3 z-40 whitespace-nowrap cursor-pointer hover:border-[#454e15] hover:shadow-lift transition-all select-none"
                                            >
                                                {/* Flecha apuntando al pin */}
                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FFF4E2] rotate-45 border-r border-b border-[#472825]/20" />

                                                {/* Miniatura recortada del producto */}
                                                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 border border-[#472825]/15 shadow-xs">
                                                    <Image
                                                        src={spot.product.images?.[0] || spot.product.image_url || ""}
                                                        alt={spot.product.name}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                </div>

                                                {/* Nombre del producto y Precio */}
                                                <div className="min-w-0 pr-1 text-left">
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-[#454e15] block leading-none mb-0.5">
                                                        {spot.product.category}
                                                    </span>
                                                    <h4 className="text-xs font-black text-[#472825] leading-snug truncate max-w-[180px]">
                                                        {spot.product.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs font-black text-[#25D366]">
                                                            ${spot.product.price.toLocaleString("es-AR")}
                                                        </span>
                                                        <span className="text-[10px] text-[#472825]/70 font-bold hover:text-[#454e15] underline decoration-[#454e15]/40">
                                                            Personalizar →
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* Right 5 Columns: Wonder Theme "Shoppable Buy All" Side Deck */}
                    <motion.div 
                        initial={{ opacity: 0, x: 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-5 flex flex-col gap-4"
                    >
                        <div className="p-6 sm:p-7 rounded-3xl bg-[#FFF4E2] border border-[#472825]/15 shadow-soft space-y-6">

                            {/* Deck Header */}
                            <div className="flex items-center justify-between border-b border-[#472825]/10 pb-4">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#454e15]">
                                        Productos del Set
                                    </span>
                                    <h3 className="text-xl font-black text-[#472825] tracking-tight">
                                        Piezas del Set ({currentPreset.hotspots.length})
                                    </h3>
                                </div>
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#454e15]/10 text-[#454e15]">
                                    Look #{activePresetIndex + 1}
                                </span>
                            </div>

                            {/* Synchronized Product Cards List */}
                            <div className="space-y-3">
                                {currentPreset.hotspots.map((spot) => {
                                    const isSelected = activeHotspotId === spot.id;
                                    const isHovered = hoveredHotspotId === spot.id;
                                    const isLit = isSelected || isHovered;

                                    return (
                                        <div
                                            key={spot.id}
                                            onClick={() => setActiveHotspotId(spot.id)}
                                            onMouseEnter={() => setHoveredHotspotId(spot.id)}
                                            onMouseLeave={() => setHoveredHotspotId(null)}
                                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                isLit
                                                    ? "bg-white border-[#454e15] shadow-md ring-2 ring-[#454e15]/20 scale-[1.01]"
                                                    : "bg-[#FFF4E2]/60 border-[#472825]/10 hover:border-[#472825]/30 hover:bg-white/80"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                {/* Number indicator */}
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                                                    isLit ? "bg-[#472825] text-[#FFF4E2]" : "bg-[#472825]/10 text-[#472825]"
                                                }`}>
                                                    {spot.number}
                                                </span>

                                                {/* Product Image */}
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-[#472825]/15 shadow-xs">
                                                    <Image
                                                        src={spot.product.images?.[0] || spot.product.image_url || ""}
                                                        alt={spot.product.name}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                </div>

                                                {/* Metadata */}
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#454e15] block">
                                                        {spot.product.category}
                                                    </span>
                                                    <h4 className="text-xs font-black text-[#472825] truncate">
                                                        {spot.product.name}
                                                    </h4>
                                                    <span className="text-xs font-extrabold text-[#472825]">
                                                        ${spot.product.price.toLocaleString("es-AR")}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCustomize(spot.product);
                                                }}
                                                className="px-3.5 py-2 rounded-full bg-[#454e15] hover:bg-[#383f11] text-[#FFF4E2] text-[11px] font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
                                                title="Personalizar esta prenda"
                                            >
                                                <Sparkles className="w-3 h-3 text-[#25D366]" />
                                                <span>Personalizar</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* "Shoppable Buy All" Total & Dual Action Bar */}
                            <div className="pt-5 border-t border-[#472825]/10 space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-[#472825]/60 block">Set completo</span>
                                        <span className="text-[11px] text-[#454e15] font-extrabold flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#454e15]" />
                                            Muestra previa + Stickers incluidos
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-[#472825]">
                                            ${lookTotalPrice.toLocaleString("es-AR")}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <button
                                        type="button"
                                        onClick={handleOrderFullLook}
                                        className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>Pedir Look Completo por WhatsApp</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleAddAllToCart}
                                        className="w-full py-3 bg-white hover:bg-[#472825]/5 text-[#472825] font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 border border-[#472825]/20 transition-all shadow-xs"
                                    >
                                        <ShoppingBag className="w-4 h-4 text-[#454e15]" />
                                        <span>Agregar Todo el Set a la Bolsa</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Studio Workshop Quality Guarantee */}
                        <div className="p-4 rounded-2xl bg-[#FFF4E2]/60 border border-[#472825]/10 flex items-center gap-3 text-xs text-[#472825]">
                            <div className="w-8 h-8 rounded-full bg-[#454e15]/10 text-[#454e15] flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4" />
                            </div>
                            <p className="leading-snug font-medium">
                                <strong className="font-bold">Garantía PFSTUDIO:</strong> Podés cambiar cualquier talle sin costo dentro de las 48 hs de recibido tu pedido.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
