"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, ChevronsLeftRight, CheckCircle2, Layers, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComparisonCase {
    id: string;
    label: string;
    productName: string;
    beforeLabel: string;
    afterLabel: string;
    beforeDesc: string;
    afterDesc: string;
    beforeImage: string;
    afterImage: string;
    specs: string[];
}

const COMPARISON_CASES: ComparisonCase[] = [
    {
        id: "remera-lisa-estampada",
        label: "Remera Lisa vs. Estampada",
        productName: "Remera Peinada 24/1 • Proceso de Estampado Taller",
        beforeLabel: "Prenda Lisa Base",
        afterLabel: "Estampado Final en Taller",
        beforeDesc: "Prenda de algodón 100% peinado 24/1 lisa y estructurada, lista en mesa de producción para el proceso de estampado.",
        afterDesc: "Estampa de alta definición transferida y curada a 165°C con tintas textiles elásticas, tacto ultra suave y colores vivos permanentes.",
        beforeImage: "/images/slider-remera-lisa.jpg",
        afterImage: "/images/slider-remera-estampada.jpg",
        specs: ["Algodón 100% Peinado 24/1", "Curado térmico industrial a 165°C", "Fijación inalterable lavado tras lavado"]
    }
];

export default function BeforeAfterSlider() {
    const [activeCaseIndex, setActiveCaseIndex] = useState(0);
    const [sliderPos, setSliderPos] = useState(50); // percentage 0 to 100
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentCase = COMPARISON_CASES[activeCaseIndex];

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.min(Math.max((x / rect.width) * 100, 2), 98);
        setSliderPos(Math.round(percent * 10) / 10);
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        handleMove(e.clientX);
        try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
    };

    return (
        <section className="py-16 md:py-24 bg-surface-container-low border-b border-outline-variant/40 overflow-hidden">
            <div className="w-full px-margin md:px-gutter-desktop max-w-7xl mx-auto flex flex-col gap-10">

                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div className="flex flex-col gap-2">
                        <span className="eyebrow flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                            Calidad & Precisión de Taller
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
                            Prenda Lisa vs. Estampado Final
                        </h2>
                        <p className="text-sm text-on-surface-variant max-w-xl leading-relaxed">
                            Deslizá la barra central para ver la transformación exacta del tejido de algodón virgen a la prenda curada con el diseño terminado.
                        </p>
                    </div>

                    {/* Badge Indicator */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-xs font-bold text-primary border border-outline-variant/40 shadow-xs self-start md:self-auto">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>Muestra Real 1:1 en Taller</span>
                    </div>
                </motion.div>

                {/* Main Interactive Slider Box */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                    {/* Slider Viewer (8 cols) - Slides in from left */}
                    <motion.div 
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-8"
                    >
                        <div
                            ref={containerRef}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-3xl overflow-hidden bg-black shadow-lift select-none cursor-ew-resize group touch-none"
                        >
                            {/* Accessible invisible range input for 100% reliable mobile swipe and keyboard control */}
                            <input
                                type="range"
                                min={2}
                                max={98}
                                step={0.5}
                                value={sliderPos}
                                onChange={(e) => setSliderPos(Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-ew-resize pointer-events-auto"
                                aria-label="Deslizador comparativo de boceto digital y producto final"
                            />

                            {/* AFTER Image (Full Background - Finished Printed Item) */}
                            <div className="absolute inset-0 w-full h-full pointer-events-none">
                                <Image
                                    src={currentCase.afterImage}
                                    alt={currentCase.afterLabel}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                                {/* Bottom Pill Right (After - Printed) */}
                                <div className="absolute bottom-4 right-4 z-10 px-4 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-lg flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                                    <span>{currentCase.afterLabel}</span>
                                </div>
                            </div>

                            {/* BEFORE Image (Clipped Overlay on Left - Plain Blank Item) */}
                            <div
                                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                            >
                                <Image
                                    src={currentCase.beforeImage}
                                    alt={currentCase.beforeLabel}
                                    fill
                                    priority
                                    className="object-cover"
                                />

                                {/* Bottom Pill Left (Before - Blank) */}
                                <div className="absolute bottom-4 left-4 z-10 px-4 py-1.5 rounded-full bg-[#FFF4E2]/95 backdrop-blur-md text-[#472825] text-xs font-bold border border-[#472825]/20 shadow-lg flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#472825]/40" />
                                    <span>{currentCase.beforeLabel}</span>
                                </div>
                            </div>

                            {/* Visual Stimulus: Luminous Laser Divider Handle Line */}
                            <div
                                className="absolute top-0 bottom-0 w-[2.5px] bg-gradient-to-b from-white/40 via-white to-white/40 z-20 pointer-events-none shadow-[0_0_16px_rgba(255,255,255,0.9),0_0_32px_rgba(37,211,102,0.6)]"
                                style={{ left: `${sliderPos}%` }}
                            >
                                {/* Vertical subtle laser sheen reflection */}
                                <div className="absolute -inset-y-4 -left-3 w-7 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-[2px] pointer-events-none" />

                                {/* Center Circular Knob with tactile haptic look */}
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white text-[#472825] border-2 border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex items-center justify-center ring-4 ring-[#25D366]/40 group-hover:ring-[#25D366]/60 group-hover:scale-110 active:scale-95 transition-all">
                                    <ChevronsLeftRight className="w-5 h-5 text-[#472825]" />
                                </div>
                            </div>

                            {/* Floating hint */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold pointer-events-none flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity border border-white/15 shadow-md">
                                <ChevronsLeftRight className="w-3.5 h-3.5 text-[#25D366]" />
                                <span>Deslizá para revelar el estampado</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Explanatory Specs Column (4 cols) - Slides in from right */}
                    <motion.div 
                        initial={{ opacity: 0, x: 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-4 flex flex-col justify-between h-full gap-6"
                    >
                        <div className="space-y-5">
                            <div>
                                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                                    Caso en Análisis
                                </span>
                                <h3 className="text-xl sm:text-2xl font-bold text-on-surface leading-snug">
                                    {currentCase.productName}
                                </h3>
                            </div>

                            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                                {sliderPos < 50 ? currentCase.beforeDesc : currentCase.afterDesc}
                            </p>

                            {/* Technical Specs List */}
                            <div className="space-y-3 pt-2">
                                {currentCase.specs.map((spec, i) => (
                                    <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-on-surface">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>{spec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Box */}
                        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 flex flex-col gap-3 shadow-soft">
                            <span className="text-xs font-bold text-on-surface">¿Tenés un diseño propio para estampar?</span>
                            <p className="text-[11px] text-on-surface-variant">
                                Te armamos la muestra digital sin costo para que veas cómo queda antes de mandar a producción.
                            </p>
                            <Link
                                href="#personalizados"
                                className="w-full py-3 bg-primary text-on-primary hover:bg-primary-container font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Personalizar con tu diseño</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </motion.div>

                </div>

            </div>
        </section>
    );
}

