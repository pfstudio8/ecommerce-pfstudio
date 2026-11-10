"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface CollectionItem {
    id: string;
    name: string;
    label: string;
    image: string;
    badge?: string;
    query: string;
}

const DEFAULT_COLLECTIONS: CollectionItem[] = [
    {
        id: "boxy-fit",
        name: "Boxy Fit",
        label: "Remeras Boxy",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop",
        badge: "Tendencia",
        query: "Boxy Fit"
    },
    {
        id: "remeras-clasicas",
        name: "Remeras",
        label: "Clásicas 24/1",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400&auto=format&fit=crop",
        query: "Remeras"
    },
    {
        id: "buzos-hoodies",
        name: "Buzos",
        label: "Buzos & Hoodies",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400&auto=format&fit=crop",
        badge: "Invierno",
        query: "Buzos"
    },
    {
        id: "conjuntos-joggers",
        name: "Conjuntos",
        label: "Joggers & Shorts",
        image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=400&auto=format&fit=crop",
        query: "Conjuntos"
    },
    {
        id: "tazas-ceramica",
        name: "Tazas",
        label: "Tazas Cerámica",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop",
        badge: "Sublimación",
        query: "Tazas"
    },
    {
        id: "gorras-accesorios",
        name: "Gorras",
        label: "Gorras Trucker",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400&auto=format&fit=crop",
        query: "Gorras"
    },
    {
        id: "llaveros-merch",
        name: "Accesorios",
        label: "Llaveros & Merch",
        image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=400&auto=format&fit=crop",
        query: "Accesorios"
    }
];

export default function CollectionNavigator() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollButtons = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    };

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        updateScrollButtons();
        el.addEventListener("scroll", updateScrollButtons);
        window.addEventListener("resize", updateScrollButtons);
        return () => {
            el.removeEventListener("scroll", updateScrollButtons);
            window.removeEventListener("resize", updateScrollButtons);
        };
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return;
        const offset = direction === "left" ? -280 : 280;
        scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    };

    return (
        <section id="colecciones" className="py-8 sm:py-12 bg-[#fdf8ee] border-b border-[#472825]/10 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-margin md:px-gutter-desktop">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#454e15]" />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#454e15]">
                            Colecciones del Taller
                        </h2>
                    </div>

                    {/* Arrow Navigation (Desktop) */}
                    <div className="hidden sm:flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            aria-label="Desplazar a la izquierda"
                            className="w-8 h-8 rounded-full border border-[#472825]/20 flex items-center justify-center text-[#472825] hover:bg-[#FFF4E2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            aria-label="Desplazar a la derecha"
                            className="w-8 h-8 rounded-full border border-[#472825]/20 flex items-center justify-center text-[#472825] hover:bg-[#FFF4E2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scrollable Carousel of Category Pills */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth -mx-margin px-margin md:-mx-gutter-desktop md:px-gutter-desktop select-none"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {DEFAULT_COLLECTIONS.map((col, idx) => (
                        <motion.div
                            key={col.id}
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                            className="shrink-0"
                        >
                            <Link
                                href={`/catalog?cat=${encodeURIComponent(col.query)}`}
                                className="group flex flex-col items-center shrink-0 text-center focus:outline-none"
                            >
                                {/* Circular Image Container with Wonder-theme border */}
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2 border-[#472825]/15 group-hover:border-[#454e15] group-hover:shadow-md transition-all duration-300">
                                    <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FFF4E2]">
                                        <Image
                                            src={col.image}
                                            alt={col.label}
                                            fill
                                            sizes="(max-width: 640px) 80px, 96px"
                                            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                        />
                                    </div>

                                    {/* Floating Tag / Badge */}
                                    {col.badge && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#472825] text-[#FFF4E2] text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-xs">
                                            {col.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Label */}
                                <span className="text-xs font-bold text-[#472825] mt-2.5 group-hover:text-[#454e15] transition-colors whitespace-nowrap">
                                    {col.label}
                                </span>
                            </Link>
                        </motion.div>
                    ))}

                    {/* Special Pill: Personalizados a Medida */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5, delay: DEFAULT_COLLECTIONS.length * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className="shrink-0"
                    >
                        <Link
                            href="#personalizados"
                            className="group flex flex-col items-center shrink-0 text-center focus:outline-none"
                        >
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2 border-dashed border-[#25D366] group-hover:border-[#20ba59] group-hover:shadow-md transition-all duration-300">
                                <div className="relative w-full h-full rounded-full bg-[#25D366]/10 flex flex-col items-center justify-center text-[#1faa53] group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                                    <Sparkles className="w-6 h-6 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">A medida</span>
                                </div>
                            </div>

                            <span className="text-xs font-bold text-[#1faa53] mt-2.5 group-hover:text-[#168a41] transition-colors whitespace-nowrap">
                                Personalizados
                            </span>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

