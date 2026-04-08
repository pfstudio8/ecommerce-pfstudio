"use client";

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

    // Note: The filter button logic actually lives in ProductGrid. 
    // Here we're just keeping the editorial header structure.

    return (
        <header className="pt-28 pb-4 px-4 md:px-8 max-w-[1400px] mx-auto w-full bg-[var(--background)]">
            <motion.div 
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center text-center mt-6 md:mt-10 gap-6"
            >
                <div className="flex flex-col items-center w-full">
                    <motion.h2
                        variants={childVariants}
                        className="text-white font-black tracking-[0.4em] uppercase text-xs md:text-sm mb-4 bg-gradient-to-r from-[var(--color-main)] to-[#008f65] px-6 py-2 rounded-full shadow-[0_0_20px_rgba(0,168,122,0.4)] border border-white/20"
                    >
                        Bienvenidos a
                    </motion.h2>
                    <motion.h1
                        variants={childVariants}
                        className="font-black text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6rem] leading-[0.85] tracking-tighter mb-4 md:mb-6 text-[var(--foreground)]"
                    >
                        PFSTUDIO
                    </motion.h1>
                    <motion.p
                        variants={childVariants}
                        className="text-gray-400 max-w-3xl text-base md:text-lg lg:text-xl font-light leading-relaxed text-balance mx-auto px-4"
                    >
                        Oversize · Boxy Fit · Clásicas. Prendas diseñadas para ofrecer máxima comodidad sin sacrificar el estilo.
                    </motion.p>
                </div>
            </motion.div>
        </header>
    );
}
