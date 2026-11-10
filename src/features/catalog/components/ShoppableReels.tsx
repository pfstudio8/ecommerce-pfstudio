"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { useProductDrawerStore } from "../store/productDrawer";
import { Product } from "@/types/product";

interface ReelItem {
    id: string;
    title: string;
    category: string;
    price: number;
    videoSrc: string;
    specs: string;
}

const REELS: ReelItem[] = [
    {
        id: "remera-boxy",
        title: "Remera Boxy Fit 24/1",
        category: "Streetwear",
        price: 18500,
        videoSrc: "/hero-video2.mp4",
        specs: "Corte cuadrado estructurado"
    },
    {
        id: "taza-magica",
        title: "Taza Mágica Termocromática",
        category: "Sublimación HD",
        price: 6500,
        videoSrc: "/hero-video.mp4",
        specs: "Efecto térmico en vivo"
    },
    {
        id: "remera-oversize",
        title: "Remera Oversize Heavyweight",
        category: "Colección 2026",
        price: 19500,
        videoSrc: "/hero-video2.mp4",
        specs: "Caída amplia y hombros caídos"
    },
    {
        id: "clubes-personalizados",
        title: "Edición Especial Marcas & Clubes",
        category: "Producción Taller",
        price: 18500,
        videoSrc: "/hero-video.mp4",
        specs: "Sublimación continua inalterable"
    }
];

const REELS_PRODUCTS: Record<string, Product> = {
    "remera-boxy": {
        id: "remera-boxy-heavy",
        name: "Remera Boxy Fit 24/1",
        category: "Boxy Fit",
        price: 18500,
        description: "Corte cuadrado estructurado en algodón peinado 24/1 con cuello rib de 3cm.",
        image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
        stock: 35,
        active: true,
        product_stock: [
            { size: "S", stock_quantity: 8 },
            { size: "M", stock_quantity: 12 },
            { size: "L", stock_quantity: 10 },
            { size: "XL", stock_quantity: 5 }
        ]
    },
    "taza-magica": {
        id: "taza-ceramica",
        name: "Taza Mágica Termocromática",
        category: "Tazas",
        price: 6500,
        description: "Cerámica importada AAA con revelado térmico en vivo al contacto con líquido caliente.",
        image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
        stock: 40,
        active: true,
        product_stock: [{ size: "Único", stock_quantity: 40 }]
    },
    "remera-oversize": {
        id: "remera-oversize",
        name: "Remera Oversize Heavyweight",
        category: "Remeras",
        price: 19500,
        description: "Algodón 24/1 pesado con hombros caídos y calce urbano holgado.",
        image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
        stock: 25,
        active: true,
        product_stock: [
            { size: "S", stock_quantity: 5 },
            { size: "M", stock_quantity: 10 },
            { size: "L", stock_quantity: 8 },
            { size: "XL", stock_quantity: 2 }
        ]
    },
    "clubes-personalizados": {
        id: "clubes-personalizados",
        name: "Remera Edición Especial Marcas & Clubes",
        category: "Personalizados",
        price: 18500,
        description: "Prendas de alta durabilidad sublimadas o DTF para indumentaria de equipo o marca.",
        image_url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop",
        stock: 50,
        active: true,
        product_stock: [
            { size: "S", stock_quantity: 10 },
            { size: "M", stock_quantity: 15 },
            { size: "L", stock_quantity: 15 },
            { size: "XL", stock_quantity: 10 }
        ]
    }
};

export default function ShoppableReels() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [mutedIndex, setMutedIndex] = useState<number | null>(null);
    const [pausedIds, setPausedIds] = useState<Record<string, boolean>>({});
    const openDrawer = useProductDrawerStore((state) => state.openDrawer);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const offset = direction === 'left' ? -340 : 340;
            scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
        }
    };

    const togglePlay = (id: string, videoEl: HTMLVideoElement | null) => {
        if (!videoEl) return;
        if (videoEl.paused) {
            videoEl.play().catch(() => {});
            setPausedIds(prev => ({ ...prev, [id]: false }));
        } else {
            videoEl.pause();
            setPausedIds(prev => ({ ...prev, [id]: true }));
        }
    };

    return (
        <section className="py-16 md:py-24 bg-[#FFF4E2]/30 border-b border-[#472825]/10 overflow-hidden">
            <div className="w-full px-margin md:px-gutter-desktop max-w-7xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12 border-b border-[#472825]/10 pb-6"
                >
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#454e15]">
                                TALLER EN MOVIMIENTO // SHOPPABLE REELS 9:16
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-[#472825] tracking-tight">
                            Prendas e Insumos en Acción
                        </h2>
                        <p className="text-sm text-[#472825]/75 max-w-xl">
                            Comprobá la caída real de la tela, el acabado de los estampados y los detalles en video antes de pedir.
                        </p>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            aria-label="Desplazar a la izquierda"
                            className="w-10 h-10 rounded-full border border-[#472825]/20 flex items-center justify-center text-[#472825] hover:bg-[#FFF4E2] transition-colors shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            aria-label="Desplazar a la derecha"
                            className="w-10 h-10 rounded-full border border-[#472825]/20 flex items-center justify-center text-[#472825] hover:bg-[#FFF4E2] transition-colors shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>

                {/* Reels Horizontal Snap Slider */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-margin px-margin md:-mx-gutter-desktop md:px-gutter-desktop select-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {REELS.map((reel, idx) => {
                        const isUnmuted = mutedIndex === idx;
                        const isPaused = !!pausedIds[reel.id];

                        return (
                            <motion.div
                                key={reel.id}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="relative flex-none w-[270px] sm:w-[290px] md:w-[310px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-xl snap-start group border border-[#472825]/15 flex flex-col justify-between p-4"
                            >
                                {/* Video Element */}
                                <video
                                    id={`reel-video-${reel.id}`}
                                    src={reel.videoSrc}
                                    muted={!isUnmuted}
                                    loop
                                    autoPlay
                                    playsInline
                                    onClick={(e) => togglePlay(reel.id, e.currentTarget)}
                                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                                />

                                {/* Top Badges */}
                                <div className="relative z-10 flex items-center justify-between w-full">
                                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white border border-white/20">
                                        {reel.category}
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setMutedIndex(isUnmuted ? null : idx)}
                                            aria-label={isUnmuted ? "Silenciar video" : "Activar sonido"}
                                            className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                                        >
                                            {isUnmuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Pause Play indicator on click */}
                                {isPaused && (
                                    <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center z-10 pointer-events-none">
                                        <Play className="w-5 h-5 ml-0.5" />
                                    </div>
                                )}

                                {/* Bottom Gradient & Anchored Shoppable Card */}
                                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />
                                <div className="relative z-10 w-full">
                                    <div className="bg-[#FFF4E2]/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-[#472825]/15 flex flex-col gap-3 transition-all">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-black text-[#472825] truncate">
                                                    {reel.title}
                                                </h4>
                                                <p className="text-[11px] text-[#472825]/70 truncate font-medium">
                                                    {reel.specs}
                                                </p>
                                            </div>
                                            <span className="text-xs font-black text-[#454e15] shrink-0">
                                                ${reel.price.toLocaleString("es-AR")}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const prod = REELS_PRODUCTS[reel.id];
                                                if (prod) openDrawer(prod);
                                            }}
                                            className="w-full py-2.5 bg-[#472825] hover:bg-[#341d1a] text-[#FFF4E2] font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
                                            <span>Personalizar este producto</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
