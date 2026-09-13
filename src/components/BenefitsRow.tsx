"use client";

import { motion } from "framer-motion";
import { Sparkles, Palette, MapPin, MessageSquare } from "lucide-react";

export default function BenefitsRow() {
    const benefits = [
        {
            icon: Sparkles,
            title: "Vinilo Sublimable",
            description: "Estampas de alta fidelidad con vinilo textil premium sublimable de excelente acabado y durabilidad.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/5 border-emerald-500/10"
        },
        {
            icon: Palette,
            title: "Sublimación Directa",
            description: "Diseños integrados directamente en las fibras de la tela, totalmente suaves al tacto e indestructibles.",
            color: "text-sky-500",
            bg: "bg-sky-500/5 border-sky-500/10"
        },
        {
            icon: MapPin,
            title: "Retiro por el Taller",
            description: "Comprá de forma online y coordiná de manera directa el retiro por nuestro taller de producción local.",
            color: "text-main",
            bg: "bg-main/5 border-main/10"
        },
        {
            icon: MessageSquare,
            title: "WhatsApp Directo",
            description: "Atención personalizada para definir detalles de tus diseños y coordinar transferencias o efectivo.",
            color: "text-main",
            bg: "bg-main/5 border-main/10"
        }
    ];

    return (
        <section className="py-12 bg-background border-t border-b border-white/5 relative z-10 w-full">
            <div className="container mx-auto px-6 md:px-8 max-w-350">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className={`p-6 rounded-2xl border ${benefit.bg} flex gap-4 items-start hover:scale-[1.02] transition-transform duration-300`}
                            >
                                <div className={`p-3 rounded-xl bg-white/5 ${benefit.color} shrink-0`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-foreground">
                                        {benefit.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                        {benefit.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
