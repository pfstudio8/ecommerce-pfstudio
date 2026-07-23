"use client";

import { motion } from "framer-motion";
import { Palette, Upload, ShoppingCart, Sparkles, ArrowRight } from "lucide-react";

export default function CustomBannerTeaser() {
    const steps = [
        {
            num: "01",
            icon: Palette,
            title: "Elegí Modelo y Color",
            desc: "Seleccioná entre corte Oversize, Boxy Fit o Clásico en tu color favorito."
        },
        {
            num: "02",
            icon: Upload,
            title: "Subí tu Diseño",
            desc: "Cargá tu imagen, logo o frase y ubicala en el frente o espalda con vista previa real."
        },
        {
            num: "03",
            icon: ShoppingCart,
            title: "Confirmá tu Pedido",
            desc: "Recibilo en tu casa o retiralo por nuestro taller en pocos días."
        }
    ];

    const scrollToCustomizer = () => {
        const el = document.getElementById("personalizador");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="py-16 my-8 bg-gradient-to-b from-transparent via-[var(--color-main)]/5 to-transparent relative overflow-hidden border-y border-white/5">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--color-main)]/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 md:px-8 max-w-[1400px] relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-main)]/15 border border-[var(--color-main)]/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                            <Sparkles className="w-3.5 h-3.5" /> Studio Custom
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                            Diseñá tu propia remera en <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">3 pasos simples</span>
                        </h2>
                    </div>

                    <button
                        onClick={scrollToCustomizer}
                        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[var(--color-main)] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer group"
                    >
                        Probar Studio Custom
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.15 }}
                                className="group relative p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md hover:border-emerald-500/40 transition-all duration-300 overflow-hidden hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3.5 rounded-xl bg-[var(--color-main)]/20 text-emerald-400 border border-[var(--color-main)]/30 group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-3xl font-black text-white/10 group-hover:text-emerald-400/20 transition-colors">
                                        {step.num}
                                    </span>
                                </div>

                                <h3 className="font-extrabold text-lg uppercase tracking-wide text-white mb-2 group-hover:text-emerald-300 transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-400 font-normal leading-relaxed">
                                    {step.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
