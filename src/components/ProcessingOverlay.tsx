"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CreditCard, Landmark, Sparkles, Lock, Loader2 } from "lucide-react";

interface ProcessingOverlayProps {
    isOpen: boolean;
    title: string;
    subtitle?: string;
    type?: 'auth' | 'mercadopago' | 'transfer' | 'general';
}

export default function ProcessingOverlay({
    isOpen,
    title,
    subtitle,
    type = 'general'
}: ProcessingOverlayProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'auth':
                return <Lock className="w-6 h-6 text-emerald-400" />;
            case 'mercadopago':
                return <CreditCard className="w-6 h-6 text-emerald-400" />;
            case 'transfer':
                return <Landmark className="w-6 h-6 text-emerald-400" />;
            default:
                return <Sparkles className="w-6 h-6 text-emerald-400" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-9999 flex items-center justify-center bg-zinc-950/85 backdrop-blur-xl p-4 select-none"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 15, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 15, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative max-w-sm w-full bg-zinc-900/90 border border-white/10 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center overflow-hidden"
                    >
                        {/* Glow Ambient Layer */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />

                        {/* Brand Pulsing Logo / Icon Container */}
                        <div className="relative mb-6 flex items-center justify-center">
                            {/* Outer Spinning Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                className="w-20 h-20 rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-500/30"
                            />

                            {/* Center Icon Circle */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 rounded-2xl bg-zinc-950/90 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
                                    {getIcon()}
                                </div>
                            </div>
                        </div>

                        {/* Brand Name Tag */}
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full mb-3 inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            PFSTUDIO
                        </span>

                        {/* Dynamic Title */}
                        <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">
                            {title}
                        </h3>

                        {/* Dynamic Subtitle */}
                        {subtitle && (
                            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs font-medium">
                                {subtitle}
                            </p>
                        )}

                        {/* Animated Progress Bar */}
                        <div className="w-full bg-zinc-950/80 rounded-full h-1.5 mt-6 overflow-hidden border border-white/5 relative">
                            <motion.div
                                className="bg-linear-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.4,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>

                        {/* Security Tag */}
                        <div className="mt-5 pt-4 border-t border-white/5 w-full flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Procesamiento 100% Seguro</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

