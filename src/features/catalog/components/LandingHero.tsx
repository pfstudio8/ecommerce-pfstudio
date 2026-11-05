"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Zap, ShieldCheck, ShoppingBag, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

const HERO_CONTENT = [
    {
        src: "/hero-video.mp4",
        title: "Taza Mágica Termocromática",
        subtitle: "Revela la estampa al contacto con calor",
        tag: "Insumos Sublimados",
        trimEnd: 1.3,
        playbackRate: 0.85
    },
    {
        src: "/hero-video2.mp4",
        title: "Edición Especial Clubes",
        subtitle: "Sublimación panorámica en alta definición",
        tag: "Edición Limitada",
        trimEnd: 1.3,
        playbackRate: 0.85
    }
];

export default function LandingHero() {
    const [activeIndex, setActiveIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const transitioningRef = useRef(false);
    const [texts, setTexts] = useState({
        badge: "Taller Textil & Sublimación",
        title: "Indumentaria Streetwear & Estampados a Medida",
        subtitle: "Remeras Boxy Fit, cortes Oversize, buzos y accesorios personalizados con insumos de primera línea y terminaciones profesionales."
    });

    useEffect(() => {
        const fetchLandingTexts = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'landing_texts')
                    .single();

                if (data?.value) {
                    setTexts(prev => ({
                        badge: data.value.badge || prev.badge,
                        title: data.value.title || prev.title,
                        subtitle: data.value.subtitle || prev.subtitle
                    }));
                }
            } catch (err) {
                // Keep default texts
            }
        };
        fetchLandingTexts();
    }, []);

    useEffect(() => {
        transitioningRef.current = false;
        if (videoRef.current) {
            videoRef.current.playbackRate = HERO_CONTENT[activeIndex].playbackRate;
            videoRef.current.play().catch(() => {});
        }
    }, [activeIndex]);

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const video = e.currentTarget;
        if (video !== videoRef.current || transitioningRef.current) return;

        const currentContent = HERO_CONTENT[activeIndex];
        if (video.duration && video.currentTime >= video.duration - currentContent.trimEnd) {
            transitioningRef.current = true;
            setActiveIndex((prev) => (prev + 1) % HERO_CONTENT.length);
        }
    };

    return (
        <section className="relative overflow-hidden bg-surface-container-low border-b border-outline-variant py-14 lg:py-20">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    
                    {/* Left Column: Clean Typography & Direct Actions */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="inline-flex items-center gap-2 self-start bg-surface-container-high px-3.5 py-1.5 rounded-full border border-outline-variant">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-secondary">{texts.badge}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-[1.1]">
                            {texts.title}
                        </h1>

                        <p className="text-base sm:text-lg text-on-surface-variant max-w-xl font-normal leading-relaxed">
                            {texts.subtitle}
                        </p>

                        {/* Clean Actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <Link 
                                href="/catalog" 
                                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-primary text-on-primary font-bold text-sm rounded-xl shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Ver Catálogo</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link 
                                href="#personalizados" 
                                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high font-bold text-sm rounded-xl transition-all active:scale-95"
                            >
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span>Personalizar Producto</span>
                            </Link>
                        </div>

                        {/* Minimalist Trust Features */}
                        <div className="pt-6 border-t border-outline-variant/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-on-surface-variant font-medium">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary shrink-0" />
                                <span>Despachos en 24-48 hs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                                <span>Garantía de confección</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                                <span>Sublimación HD resistente</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Clean Minimalist Stage */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative mx-auto max-w-md lg:max-w-none bg-surface-container-lowest p-3 sm:p-4 rounded-2xl border border-outline-variant shadow-sm">
                            <div className="relative aspect-4/3 sm:aspect-square rounded-xl overflow-hidden bg-surface-container">
                                <AnimatePresence mode="wait">
                                    <motion.video
                                        key={activeIndex}
                                        ref={videoRef}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full object-cover absolute inset-0"
                                        autoPlay
                                        muted
                                        playsInline
                                        src={HERO_CONTENT[activeIndex].src}
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={() => setActiveIndex((prev) => (prev + 1) % HERO_CONTENT.length)}
                                    />
                                </AnimatePresence>
                                <div className="absolute top-3 left-3 bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-on-surface border border-outline-variant/50">
                                    {HERO_CONTENT[activeIndex].tag}
                                </div>
                            </div>
                            
                            <div className="mt-3 px-2 py-1 flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs sm:text-sm font-bold text-on-surface">
                                        {HERO_CONTENT[activeIndex].title}
                                    </h4>
                                    <p className="text-[11px] text-on-surface-variant">
                                        {HERO_CONTENT[activeIndex].subtitle}
                                    </p>
                                </div>
                                <div className="flex gap-1.5">
                                    {HERO_CONTENT.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveIndex(i)}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                i === activeIndex ? 'w-5 bg-primary' : 'bg-outline-variant hover:bg-outline'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
