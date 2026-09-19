"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CreditCard, Landmark, Sparkles, Lock } from "lucide-react";

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
                return <Lock className="w-6 h-6 text-primary" />;
            case 'mercadopago':
                return <CreditCard className="w-6 h-6 text-primary" />;
            case 'transfer':
                return <Landmark className="w-6 h-6 text-primary" />;
            default:
                return <Sparkles className="w-6 h-6 text-primary" />;
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
                    className="fixed inset-0 z-1000 flex items-center justify-center bg-surface/80 backdrop-blur-md p-4 select-none"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 15, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 15, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative max-w-sm w-full bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 text-center shadow-lg flex flex-col items-center overflow-hidden"
                    >
                        {/* Glow Ambient Layer */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary-container/30 blur-2xl rounded-full pointer-events-none" />

                        {/* Brand Pulsing Logo / Icon Container */}
                        <div className="relative mb-6 flex items-center justify-center">
                            {/* Outer Spinning Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                className="w-20 h-20 rounded-full border-2 border-transparent border-t-primary border-r-primary/30"
                            />

                            {/* Center Icon Circle */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 rounded-2xl bg-surface border border-primary/20 flex items-center justify-center shadow-sm animate-pulse">
                                    {getIcon()}
                                </div>
                            </div>
                        </div>

                        {/* Brand Name Tag */}
                        <span className="text-label-sm font-label-sm font-bold uppercase tracking-widest text-primary bg-primary-container/50 border border-primary/10 px-3 py-1 rounded-full mb-3 inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary" />
                            PFSTUDIO
                        </span>

                        {/* Dynamic Title */}
                        <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">
                            {title}
                        </h3>

                        {/* Dynamic Subtitle */}
                        {subtitle && (
                            <p className="text-body-sm font-body-sm text-on-surface-variant max-w-xs">
                                {subtitle}
                            </p>
                        )}

                        {/* Animated Progress Bar */}
                        <div className="w-full bg-surface-container-highest rounded-full h-1 mt-6 overflow-hidden relative">
                            <motion.div
                                className="bg-primary h-full rounded-full"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.2,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>

                        {/* Security Tag */}
                        <div className="mt-5 pt-4 border-t border-outline-variant w-full flex items-center justify-center gap-1.5 text-label-sm font-label-sm text-on-surface-variant">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <span>Procesamiento 100% Seguro</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

