"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";

interface HeroSlide {
    id: string;
    tag: string;
    title: string;
    subtitle: string;
    price: number;
    image: string;
    product: Product;
}

const HERO_SLIDES: HeroSlide[] = [
    {
        id: "remera-boxy",
        tag: "Streetwear",
        title: "Remera Boxy Fit",
        subtitle: "Algodón peinado premium 24/1 con calce estructurado y hombros caídos. Estampa curada en taller para máxima definición y durabilidad.",
        price: 18500,
        image: "/images/hero-slide-1-boxy-hd.jpg",
        product: {
            id: "remera-boxy-heavy",
            name: "Remera Boxy Fit Heavyweight 24/1",
            category: "Boxy Fit",
            price: 18500,
            description: "Algodón 100% peinado 24/1 con cuello rib grueso de 3 cm y hombros caídos estructurados.",
            image_url: "/images/hero-slide-1-boxy-hd.jpg",
            stock: 40,
            active: true,
            product_stock: [
                { size: "S", stock_quantity: 8 },
                { size: "M", stock_quantity: 12 },
                { size: "L", stock_quantity: 14 },
                { size: "XL", stock_quantity: 6 }
            ]
        }
    },
    {
        id: "remera-algodon",
        tag: "Indumentaria",
        title: "Remera Algodón",
        subtitle: "Confección 100% algodón suave peinado con calce clásico confortable. Estampas familiares y emotivas curadas con definición fotográfica.",
        price: 16500,
        image: "/images/hero-slide-2-algodon-hd.jpg",
        product: {
            id: "remera-algodon-papa",
            name: "Remera Algodón Clásica Premium",
            category: "Remeras",
            price: 16500,
            description: "Algodón peinado premium 24/1 con costuras reforzadas y estampa DTF textil de máxima durabilidad.",
            image_url: "/images/hero-slide-2-algodon-hd.jpg",
            stock: 35,
            active: true,
            product_stock: [
                { size: "S", stock_quantity: 8 },
                { size: "M", stock_quantity: 12 },
                { size: "L", stock_quantity: 10 },
                { size: "XL", stock_quantity: 5 }
            ]
        }
    },
    {
        id: "taza-racing",
        tag: "Bazar & Cerámica",
        title: "Taza Mágica Racing Club",
        subtitle: "Cerámica importada clase AAA con revelado térmico 360°. Los colores de la Academia cobran vida con el calor de tu café o té.",
        price: 7200,
        image: "/images/hero-slide-3-racing-hd.jpg",
        product: {
            id: "taza-racing-magica",
            name: "Taza Mágica Racing Club Térmica",
            category: "Tazas",
            price: 7200,
            description: "Cerámica ultra brillante con polímero importado clase AAA, apta para microondas. Revelado térmico instantáneo.",
            image_url: "/images/hero-slide-3-racing-hd.jpg",
            stock: 45,
            active: true,
            product_stock: [{ size: "Único", stock_quantity: 45 }]
        }
    },
    {
        id: "chopp-ceramica",
        tag: "Bazar & Regalería",
        title: "Chopp Cerámica",
        subtitle: "Cerámica vitrificada de alto grosor con asa anatómica y base pesada. Diseños y escudos de clubes personalizados para servir bien frío.",
        price: 12500,
        image: "/images/hero-slide-4-chopp-hd.jpg",
        product: {
            id: "chopp-ceramica-bicho",
            name: "Chopp Cerámica Cervecero Personalizado",
            category: "Bazar",
            price: 12500,
            description: "Chopp de cerámica pesada esmaltada, resistente a freezer y lavavajillas. Estampas vitrificadas indelebles.",
            image_url: "/images/hero-slide-4-chopp-hd.jpg",
            stock: 30,
            active: true,
            product_stock: [{ size: "Único", stock_quantity: 30 }]
        }
    }
];

export default function LandingHero() {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
    const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

    const slide = HERO_SLIDES[currentSlideIndex];

    // Autoplay slider every 6.5s
    useEffect(() => {
        if (isAutoplayPaused) return;

        autoplayTimerRef.current = setInterval(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 6500);

        return () => {
            if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
        };
    }, [isAutoplayPaused, currentSlideIndex]);

    const handleNext = () => {
        setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    };

    const handlePrev = () => {
        setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    };

    return (
        <section
            onMouseEnter={() => setIsAutoplayPaused(true)}
            onMouseLeave={() => setIsAutoplayPaused(false)}
            className="relative w-full h-[100dvh] min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-black select-none"
        >
            {/* FULL BLEED BACKGROUND SLIDES */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full z-0"
                >
                    <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        priority
                        unoptimized
                        className="object-cover object-center"
                        sizes="100vw"
                    />

                    {/* Subtle Cinematic Vignette - Calibrated so the photo and product shine with clarity */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 pointer-events-none" />
                </motion.div>
            </AnimatePresence>

            {/* MAIN EDITORIAL CONTENT (Full Width Container, Padded Top for Transparent Navbar) */}
            <div className="relative z-10 w-full flex-1 max-w-7xl mx-auto px-margin md:px-gutter-desktop flex flex-col justify-between pt-24 sm:pt-32 pb-12 sm:pb-16 text-white">

                {/* Top Row: Slide Counter with Controls (Discreet & Elegant) */}
                <div className="flex items-center justify-end w-full pt-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs font-black tracking-widest text-white/90">
                            <span className="text-[#e5a93b]">0{currentSlideIndex + 1}</span>
                            <span className="text-white/30">/</span>
                            <span className="text-white/60">0{HERO_SLIDES.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handlePrev}
                                aria-label="Slide anterior"
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#472825] backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-md active:scale-95"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                aria-label="Slide siguiente"
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#472825] backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-md active:scale-95"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Central Editorial Area: Title, 3-Line Brief Subtitle, & CTA */}
                <div className="max-w-xl space-y-4 sm:space-y-5 my-auto py-8">
                    {/* Massive Typography */}
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-[#FFF4E2] drop-shadow-2xl">
                        {slide.title}
                    </h1>

                    {/* Brief 3-Line Text with refined, elegant typography */}
                    <p className="text-sm sm:text-base lg:text-lg text-white/85 font-light leading-relaxed tracking-wide max-w-md drop-shadow">
                        {slide.subtitle}
                    </p>

                    {/* Primary Action CTA: Ver Catálogo */}
                    <div className="pt-2">
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#FFF4E2] hover:bg-white text-[#472825] font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl hover:shadow-white/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <span>Ver Catálogo</span>
                            <ArrowRight className="w-4 h-4 text-[#e5a93b]" />
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}
