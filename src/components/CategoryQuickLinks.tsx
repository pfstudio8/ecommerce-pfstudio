"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shirt, Trophy, Compass, Palette, Sparkles, Key, ArrowUpRight } from "lucide-react";

export default function CategoryQuickLinks() {
    const categories = [
        {
            name: "Remeras",
            description: "Oversize, Boxy & Clásicas",
            href: "/?cat=Remeras#productos",
            icon: Shirt,
            color: "from-emerald-500/10 via-emerald-500/5 to-transparent hover:from-emerald-500/20",
            borderColor: "hover:border-emerald-500/40",
            badge: "POPULAR"
        },
        {
            name: "Llaveros Custom",
            description: "Círculo, Corazón, Camiseta & +",
            href: "#personalizador",
            icon: Key,
            color: "from-teal-500/15 via-emerald-500/10 to-transparent hover:from-teal-500/25",
            borderColor: "border-teal-500/30 hover:border-teal-500/60",
            badge: "NUEVO"
        },
        {
            name: "Camisetas",
            description: "Deportivas & Street",
            href: "/?cat=Camisetas#productos",
            icon: Trophy,
            color: "from-blue-500/10 via-blue-500/5 to-transparent hover:from-blue-500/20",
            borderColor: "hover:border-blue-500/40"
        },
        {
            name: "Gorras",
            description: "Caps & Estilo Urbano",
            href: "/?cat=Gorras#productos",
            icon: Compass,
            color: "from-main/10 via-main/5 to-transparent hover:from-main/20",
            borderColor: "hover:border-main/40"
        },
        {
            name: "Custom Studio",
            description: "Diseñá tu Producto Único",
            href: "#personalizador",
            icon: Palette,
            color: "from-rose-500/15 via-red-500/10 to-transparent hover:from-rose-500/25",
            borderColor: "border-rose-500/30 hover:border-rose-500/60",
            highlight: true,
            badge: "CUSTOM 2D/3D"
        }
    ];

    const handleQuickLinkClick = (e: React.MouseEvent, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.getElementById(href.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        } else if (href.includes("#productos")) {
            const el = document.getElementById("productos");
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <section id="categorias" className="py-16 bg-background relative z-10 border-b border-white/5">
            <div className="container mx-auto px-6 md:px-8 max-w-350">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-main mb-2 block">
                            Colecciones PFSTUDIO
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                            Explorá por Categoría
                        </h2>
                    </div>
                    <p className="text-sm text-gray-400 max-w-md">
                        Encontrá el corte y el estilo perfecto para tu outfit diario o creá tu prenda personalizada desde cero.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                    {categories.map((cat, idx) => {
                        const Icon = cat.icon;
                        return (
                            <Link
                                key={idx}
                                href={cat.href}
                                onClick={(e) => handleQuickLinkClick(e, cat.href)}
                                className={`group relative block p-6 rounded-2xl border border-white/10 bg-linear-to-br ${cat.color} ${cat.borderColor} hover:-translate-y-1.5 backdrop-blur-sm transition-all duration-300 overflow-hidden ${cat.highlight ? 'col-span-2 md:col-span-1 shadow-lg shadow-rose-950/20' : ''}`}
                            >
                                {/* Decorative Glow Accent */}
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500 blur-sm pointer-events-none" />

                                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                    <div className="flex items-center justify-between">
                                        <div className={`p-3 rounded-xl bg-black/50 border border-white/10 text-white group-hover:scale-110 transition-transform duration-300 ${cat.highlight ? 'text-rose-400 border-rose-500/30' : ''}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-extrabold uppercase tracking-wide text-white">
                                                {cat.name}
                                            </h3>
                                            {cat.badge && (
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${cat.highlight ? 'bg-linear-to-r from-rose-500 to-red-600 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                                    {cat.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium">
                                            {cat.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

