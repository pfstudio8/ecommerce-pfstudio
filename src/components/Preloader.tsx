"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Shirt, Trophy } from "lucide-react";
import PFBotAvatar3D from "./PFBotAvatar3D";

export default function Preloader() {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [loadingStage, setLoadingStage] = useState(0);

    const stages = [
        "Cargando colecciones exclusivas...",
        "Inicializando Custom Studio 2D/3D...",
        "Preparando experiencia PFSTUDIO..."
    ];

    useEffect(() => {
        // Animate percentage smoothly from 0 to 100
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsVisible(false), 300);
                    return 100;
                }
                const next = prev + Math.floor(Math.random() * 15) + 8;
                return next > 100 ? 100 : next;
            });
        }, 120);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress > 65) {
            setLoadingStage(2);
        } else if (progress > 30) {
            setLoadingStage(1);
        } else {
            setLoadingStage(0);
        }
    }, [progress]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-9999 bg-zinc-950 flex flex-col items-center justify-center p-4 overflow-hidden select-none"
                >
                    {/* Ambient Background Aura Lights */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none animate-pulse" />
                    <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

                    {/* Subtle Floating Sparkles */}
                    {[
                        { top: "20%", left: "15%", x: 30, y: -20 },
                        { top: "32%", left: "29%", x: -45, y: 25 },
                        { top: "44%", left: "43%", x: 50, y: 15 },
                        { top: "56%", left: "57%", x: -25, y: -35 },
                        { top: "68%", left: "71%", x: 40, y: -10 },
                        { top: "80%", left: "85%", x: -60, y: 30 }
                    ].map((sparkle, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0.2,
                                y: sparkle.y,
                                x: sparkle.x
                            }}
                            animate={{
                                opacity: [0.2, 0.8, 0.2],
                                y: [sparkle.y, sparkle.y - 25, sparkle.y]
                            }}
                            transition={{
                                duration: 3 + i * 0.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 blur-[1px] pointer-events-none"
                            style={{
                                top: sparkle.top,
                                left: sparkle.left
                            }}
                        />
                    ))}

                    {/* MAIN GLASSMORPHIC LOADER CONTAINER */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="relative max-w-sm w-full bg-zinc-900/80 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-2xl shadow-2xl flex flex-col items-center overflow-hidden"
                    >
                        {/* Glow Gradient Highlight Border */}
                        <div className="absolute inset-0 bg-linear-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

                        {/* KINETIC DUAL-RING LOADER WITH 3D BOT MASCOT */}
                        <div className="relative mb-6 flex items-center justify-center">
                            {/* Outer Spinning Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                className="w-24 h-24 rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-500/40"
                            />

                            {/* Inner Counter-Spinning Ring */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute w-18 h-18 rounded-full border-2 border-transparent border-b-cyan-400 border-l-cyan-500/40"
                            />

                            {/* Center Avatar Badge */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 rounded-2xl bg-zinc-950/90 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden p-1">
                                    <PFBotAvatar3D pose="idle" size="xs" />
                                </div>
                            </div>
                        </div>

                        {/* BRAND SHIMMER TITLE */}
                        <div className="relative mb-2">
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-linear-to-r from-white via-emerald-300 to-zinc-400">
                                PFSTUDIO
                            </h1>
                        </div>

                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-4 inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
                            Indumentaria Premium
                        </span>

                        {/* DYNAMIC STAGE SUBTITLE */}
                        <motion.p
                            key={loadingStage}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-zinc-400 min-h-5 font-medium"
                        >
                            {stages[loadingStage]}
                        </motion.p>

                        {/* ANIMATED PROGRESS BAR & PERCENTAGE */}
                        <div className="w-full mt-6">
                            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-500 mb-1.5 px-1">
                                <span className="uppercase tracking-wider">Cargando</span>
                                <span className="text-emerald-400">{progress}%</span>
                            </div>

                            <div className="w-full bg-zinc-950/80 rounded-full h-2 p-0.5 border border-white/5 overflow-hidden relative shadow-inner">
                                <motion.div
                                    className="h-full bg-linear-to-r from-emerald-500 to-cyan-400 rounded-full relative"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                >
                                    {/* Glowing Head of Progress Bar */}
                                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_8px_#10b981]" />
                                </motion.div>
                            </div>
                        </div>

                        {/* FOOTER BADGE */}
                        <div className="mt-5 pt-4 border-t border-white/5 w-full flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Experiencia Segura 24/7</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

