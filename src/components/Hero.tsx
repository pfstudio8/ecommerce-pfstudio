"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Palette, ShoppingBag, Sparkles } from "lucide-react";

export default function Hero() {
    const textVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                type: "spring", stiffness: 180, damping: 14, staggerChildren: 0.08 
            } 
        }
    };

    const childVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 180 } }
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <header className="relative pt-28 md:pt-36 pb-12 px-4 md:px-8 max-w-350 mx-auto w-full overflow-hidden">
            {/* Ambient Lighting & Glow FX */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 md:w-175 md:h-100 bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

            <motion.div 
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center text-center mt-2 md:mt-6 gap-8 relative z-10"
            >
                {/* Hero Headline */}
                <div className="flex flex-col items-center max-w-4xl">
                    <motion.h1
                        variants={childVariants}
                        className="font-black text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] tracking-tight leading-[0.85] text-foreground uppercase mb-6"
                    >
                        PFSTUDIO
                    </motion.h1>

                    <motion.p
                        variants={childVariants}
                        className="text-gray-300 max-w-2xl sm:text-lg md:text-xl font-normal leading-relaxed text-balance mx-auto px-2"
                    >
                        Sublimación integral en todo tipo de insumos: Remeras, Gorras, Chopps, Tazas, Llaveros, Vasos y más. Personalizá tus productos en tiempo real con la mejor calidad y diseños únicos.
                    </motion.p>
                </div>

                {/* Interactive CTAs */}
                <motion.div 
                    variants={childVariants} 
                    className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2"
                >
                    <button
                        onClick={() => scrollToSection("productos")}
                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-linear-to-r from-main to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-main/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Ver Catálogo
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => scrollToSection("personalizador")}
                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-black/60 hover:bg-white/10 text-white border border-white/15 backdrop-blur-md font-extrabold text-sm uppercase tracking-wider hover:border-emerald-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group"
                    >
                        <Palette className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
                        Personalizá tu Insumo
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    </button>
                </motion.div>
            </motion.div>
        </header>
    );
}


