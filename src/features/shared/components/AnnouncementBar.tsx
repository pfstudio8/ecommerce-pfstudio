"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const ANNOUNCEMENTS = [
    {
        text: "Diseños 100% personalizados • Envíos a todo el país y retiro en taller",
        linkText: "Consultar",
        href: "#personalizados"
    },
    {
        text: "Algodón 24/1 peinado & sublimación HD inalterable",
        linkText: "Ver catálogo",
        href: "/catalog"
    },
    {
        text: "10% OFF automático en pedidos de 10 o más unidades",
        linkText: "Cotizar pack",
        href: "#personalizados"
    }
];

export default function AnnouncementBar() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
        }, 4500);
        return () => clearInterval(timer);
    }, []);

    const item = ANNOUNCEMENTS[currentIndex];

    return (
        <aside 
            aria-label="Anuncios de la tienda"
            className="w-full bg-[#472825] text-[#FFF4E2] text-xs font-medium py-2 px-4 transition-colors z-50 relative overflow-hidden"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-center relative min-h-[20px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="flex items-center gap-2 text-center tracking-wide"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-[#FFF4E2]/80 shrink-0 hidden sm:inline-block" />
                        <span>{item.text}</span>
                        {item.linkText && (
                            <Link 
                                href={item.href}
                                className="underline underline-offset-4 decoration-[#FFF4E2]/40 hover:decoration-[#FFF4E2] font-semibold inline-flex items-center gap-0.5 ml-1 transition-all"
                            >
                                <span>{item.linkText}</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </aside>
    );
}

