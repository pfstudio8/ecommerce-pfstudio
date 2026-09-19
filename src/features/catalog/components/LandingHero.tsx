"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HERO_CONTENT = [
    {
        src: "/hero-video.mp4",
        title: "Taza Mágica DBZ",
        subtitle: "Revela su diseño con líquido caliente",
        icon: "local_cafe",
        trimEnd: 1.3,
        playbackRate: 0.8
    },
    {
        src: "/hero-video2.mp4",
        title: "Taza Mágica Racing Club",
        subtitle: "Revela su diseño con líquido caliente",
        icon: "local_cafe",
        trimEnd: 1.3,
        playbackRate: 0.8
    }
];

export default function LandingHero() {
    const [activeIndex, setActiveIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const transitioningRef = useRef(false);

    useEffect(() => {
        // Al cambiar de video, reiniciamos el bloqueo
        transitioningRef.current = false;
        if (videoRef.current) {
            videoRef.current.playbackRate = HERO_CONTENT[activeIndex].playbackRate;
            // Forzar la reproducción por si el autoPlay falla al montar el nuevo DOM node
            videoRef.current.play().catch(() => {});
        }
    }, [activeIndex]);

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const video = e.currentTarget;
        
        // Evitar que el video anterior (que está en fade-out) dispare eventos,
        // o que se disparen múltiples eventos seguidos.
        if (video !== videoRef.current || transitioningRef.current) return;

        const currentContent = HERO_CONTENT[activeIndex];

        if (video.duration && video.currentTime >= video.duration - currentContent.trimEnd) {
            transitioningRef.current = true;
            setActiveIndex((prev) => (prev + 1) % HERO_CONTENT.length);
        }
    };

    return (
        <section className="relative overflow-hidden bg-surface-container-low border-b border-outline-variant py-space-xl lg:py-16">
            <div className="absolute inset-0 custom-grid-pattern opacity-40 pointer-events-none"></div>
            <div className="w-full px-margin-desktop max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
                    {/* Left Column: Copy & Actions */}
                    <div className="lg:col-span-7 flex flex-col gap-space-md">
                        <div className="inline-flex items-center gap-2 self-start bg-surface-container px-3 py-1 rounded-full border border-outline-variant">
                            <span className="material-symbols-outlined text-primary text-label-md material-symbols-fill">precision_manufacturing</span>
                            <span className="text-label-sm font-label-sm uppercase tracking-wider text-secondary">Taller de Estampado & Sublimación Integral</span>
                        </div>
                        <h1 className="text-display-lg font-display-lg text-on-surface leading-tight">
                            PFSTUDIO — Sublimación Integral, Remeras & Diseños a Medida
                        </h1>
                        <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">
                            Sublimación integral en todo tipo de insumos: Remeras Boxy Fit, Gorras, Chopps, Tazas, Llaveros, Vasos y más. Personalizá tus productos en tiempo real con la mejor calidad y diseños únicos.
                        </p>

                        {/* Call to Actions */}
                        <div className="flex flex-wrap items-center gap-space-md pt-2">
                            <Link href="#catalogo" className="inline-flex items-center gap-2 px-space-lg py-3 bg-primary-container text-on-primary font-headline-sm text-headline-sm rounded-lg shadow-sm hover:bg-primary transition-colors active:scale-95">
                                <span className="material-symbols-outlined text-headline-sm">storefront</span>
                                Ver Catálogo
                                <span className="material-symbols-outlined text-headline-sm">arrow_forward</span>
                            </Link>
                            <Link href="#personalizador" className="inline-flex items-center gap-2 px-space-lg py-3 bg-tertiary-fixed text-on-tertiary-fixed font-headline-sm text-headline-sm rounded-lg border border-tertiary-container shadow-sm hover:bg-tertiary-fixed-dim transition-colors active:scale-95">
                                <span className="material-symbols-outlined text-headline-sm material-symbols-fill">palette</span>
                                Personalizá tu Insumo
                            </Link>
                        </div>

                        {/* Telemetry Indicator Mini Banner */}
                        <div className="mt-4 pt-4 border-t border-outline-variant/60 grid grid-cols-2 gap-space-sm text-secondary">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-headline-sm">check_circle</span>
                                <span className="text-body-sm font-body-sm text-on-surface">Sublimación HD Inalterable</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-headline-sm">bolt</span>
                                <span className="text-body-sm font-body-sm text-on-surface">Despacho en 24-48 hs</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visual Stage / Hero Graphic */}
                    <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                        <div className="relative mx-auto max-w-md lg:max-w-none bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-sm">
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-container">
                                <AnimatePresence>
                                    <motion.video
                                        key={activeIndex}
                                        ref={videoRef}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="w-full h-full object-cover absolute inset-0"
                                        autoPlay
                                        muted
                                        playsInline
                                        src={HERO_CONTENT[activeIndex].src}
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={() => setActiveIndex((prev) => (prev + 1) % HERO_CONTENT.length)}
                                    />
                                </AnimatePresence>
                            </div>
                            <div className="mt-space-md flex items-center justify-between bg-surface-container-low p-space-sm rounded-lg border border-outline-variant">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary material-symbols-fill">
                                        {HERO_CONTENT[activeIndex].icon}
                                    </span>
                                    <div>
                                        <p className="text-label-sm font-label-sm font-bold text-on-surface">
                                            {HERO_CONTENT[activeIndex].title}
                                        </p>
                                        <p className="text-body-sm font-body-sm text-on-surface-variant">
                                            {HERO_CONTENT[activeIndex].subtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
