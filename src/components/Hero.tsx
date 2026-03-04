"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden bg-[var(--background)]">
            {/* Background Decor Elements */}
            <div className="absolute top-1/4 left-10 w-72 h-72 bg-[var(--color-main)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulseLogo"></div>
            <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-700/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block text-sm font-semibold tracking-[0.3em] uppercase mb-4 text-[var(--color-main)] border border-[var(--color-main)]/30 rounded-full px-4 py-1 bg-[var(--color-main)]/5"
                >
                    Nueva Colección
                </motion.span>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-[var(--foreground)]"
                >
                    PF<span className="text-[var(--color-main)]">STUDIO</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    Oversize · Boxy Fit · Clásicas. Prendas diseñadas para ofrecer máxima comodidad sin sacrificar el estilo.
                </motion.p>
            </div>
        </section>
    );
}
