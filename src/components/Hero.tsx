"use client";

import { ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function Hero() {
    // Advanced staggered text animation
    const textVariants: Variants = {
        hidden: { opacity: 0, y: 50 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                type: "spring" as const, stiffness: 200, damping: 15, staggerChildren: 0.05 
            } 
        }
    };

    const childVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 200 } }
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden bg-[var(--background)]">
            {/* The decorative blurred circles were removed here as requested */}

            <motion.div 
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center"
            >
                <motion.span
                    variants={childVariants}
                    className="inline-block text-sm font-semibold tracking-[0.3em] uppercase mb-8 text-[var(--color-main)] border border-[var(--color-main)]/30 rounded-full px-5 py-2 bg-[var(--color-main)]/5 relative overflow-hidden group"
                >
                    <span className="relative z-10">Nueva Colección</span>
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 3 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"
                    />
                </motion.span>

                <motion.h1
                    variants={childVariants}
                    className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter mb-8 text-[var(--foreground)] leading-none"
                >
                    PF<span className="text-[var(--color-main)] relative inline-block">
                        STUDIO
                        <motion.span 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
                            className="absolute -bottom-2 md:-bottom-4 left-0 right-0 h-1 md:h-2 bg-[var(--color-main)] origin-left rounded-full"
                        />
                    </span>
                </motion.h1>

                <motion.p
                    variants={childVariants}
                    className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light px-4"
                >
                    Oversize · Boxy Fit · Clásicas. Prendas diseñadas para ofrecer máxima comodidad sin sacrificar el estilo.
                </motion.p>
            </motion.div>
        </section>
    );
}
