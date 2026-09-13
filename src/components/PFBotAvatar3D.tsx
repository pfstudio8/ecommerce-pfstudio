"use client";

import { motion } from "framer-motion";
import { Sparkles, Shirt, Truck, CreditCard, Palette, ShieldCheck } from "lucide-react";

export type BotPose = 'idle' | 'waving' | 'talles' | 'sublimacion' | 'envios' | 'pagos' | 'thinking';

interface PFBotAvatar3DProps {
    pose?: BotPose;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function PFBotAvatar3D({ pose = 'idle', size = 'md' }: PFBotAvatar3DProps) {
    const isSmall = size === 'xs' || size === 'sm';

    const dimensions = {
        xs: { width: 28, height: 34, headW: 'w-7', headH: 'h-5.5', visorH: 'h-3', eyeSize: 'w-1.5 h-1.5', torsoW: 'w-8', torsoH: 'h-6.5' },
        sm: { width: 42, height: 50, headW: 'w-10', headH: 'h-8', visorH: 'h-4', eyeSize: 'w-2 h-2', torsoW: 'w-11', torsoH: 'h-9' },
        md: { width: 70, height: 84, headW: 'w-12', headH: 'h-10', visorH: 'h-5', eyeSize: 'w-2.5 h-2.5', torsoW: 'w-14', torsoH: 'h-11' },
        lg: { width: 100, height: 120, headW: 'w-16', headH: 'h-13', visorH: 'h-7', eyeSize: 'w-3.5 h-3.5', torsoW: 'w-18', torsoH: 'h-15' }
    }[size];

    return (
        <div className="relative flex flex-col items-center justify-center select-none overflow-visible" style={{ width: dimensions.width, height: dimensions.height }}>
            
            {/* 3D PERSPECTIVE ROBOT CHARACTER */}
            <motion.div
                className="relative w-full h-full flex flex-col items-center justify-center"
                style={{ perspective: 800, transformStyle: "preserve-3d" }}
                animate={{
                    y: pose === 'idle' ? [0, -4, 0] : pose === 'envios' ? [-2, 2, -2] : 0,
                    rotateY: pose === 'waving' ? [0, 15, -15, 0] : pose === 'thinking' ? [0, 18, 0] : 0,
                    rotateZ: pose === 'thinking' ? [0, 6, 0] : pose === 'sublimacion' ? [-3, 3, -3] : 0
                }}
                transition={{
                    repeat: Infinity,
                    duration: pose === 'idle' ? 3.2 : pose === 'envios' ? 0.6 : 2.8,
                    ease: "easeInOut"
                }}
            >
                {/* AMBIENT 3D EMERALD GLOW */}
                <div className="absolute inset-0 bg-main/20 rounded-full blur-lg animate-pulse pointer-events-none" />

                {/* 1. ROBOT HEAD */}
                <div className={`relative ${dimensions.headW} ${dimensions.headH} bg-linear-to-b from-zinc-700 via-zinc-800 to-zinc-950 rounded-xl border border-main/60 shadow-[0_4px_12px_rgba(0,168,122,0.3)] flex flex-col items-center justify-between p-0.5 z-30 transform-gpu`}>
                    
                    {/* ANTENNA & SPHERE */}
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-main shadow-[0_0_8px_#00A87A]"
                            animate={{
                                scale: pose === 'thinking' ? [1, 1.3, 1] : [1, 1.15, 1],
                                opacity: [0.8, 1, 0.8]
                            }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        />
                        <div className="w-0.5 h-1.5 bg-zinc-600" />
                    </div>

                    {/* 3D NEON EYE VISOR SCREEN */}
                    <div className={`w-full ${dimensions.visorH} bg-black/90 rounded-lg border border-main/50 p-0.5 flex items-center justify-around relative overflow-hidden shadow-inner mt-0.5`}>
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-main/15 to-transparent animate-pulse pointer-events-none" />

                        {pose === 'thinking' ? (
                            <div className="flex items-center gap-0.5 z-10">
                                <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0 }} className="w-1 h-1 rounded-full bg-main shadow-[0_0_4px_#00A87A]" />
                                <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }} className="w-1 h-1 rounded-full bg-main shadow-[0_0_4px_#00A87A]" />
                                <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} className="w-1 h-1 rounded-full bg-main shadow-[0_0_4px_#00A87A]" />
                            </div>
                        ) : pose === 'sublimacion' ? (
                            <div className="flex items-center justify-around w-full z-10">
                                <Sparkles className="w-2.5 h-2.5 text-main animate-spin" />
                                <Sparkles className="w-2.5 h-2.5 text-emerald-300 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <motion.div
                                    className={`${dimensions.eyeSize} rounded-full bg-main shadow-[0_0_6px_#00A87A] z-10`}
                                    animate={{ scaleY: [1, 1, 0.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.88, 0.94, 1] }}
                                />
                                <motion.div
                                    className={`${dimensions.eyeSize} rounded-full bg-main shadow-[0_0_6px_#00A87A] z-10`}
                                    animate={{ scaleY: [1, 1, 0.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.88, 0.94, 1] }}
                                />
                            </>
                        )}
                    </div>

                    {/* MOUTH LINE */}
                    <div className="w-3.5 h-0.5 bg-main/50 rounded-full shadow-[0_0_3px_#00A87A] mb-0.5" />
                </div>

                {/* ROBOT NECK */}
                <div className="w-2 h-1 bg-zinc-800 border-x border-zinc-700 z-20" />

                {/* 2. ROBOT TORSO / BODY */}
                <div className={`relative ${dimensions.torsoW} ${dimensions.torsoH} bg-linear-to-b from-zinc-800 via-zinc-900 to-black rounded-xl border border-main/50 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center z-20`}>
                    {/* SHOULDER PADS */}
                    <div className="absolute -left-1.5 -top-0.5 w-2.5 h-2.5 rounded-md bg-zinc-700 border border-main/30 shadow-xs" />
                    <div className="absolute -right-1.5 -top-0.5 w-2.5 h-2.5 rounded-md bg-zinc-700 border border-main/30 shadow-xs" />

                    {/* CHEST GLOWING ARC REACTOR (PF BRAND CORE) */}
                    <div className="w-4 h-4 rounded-full bg-black/80 border border-main/60 flex items-center justify-center shadow-[0_0_8px_#00A87A] animate-pulse">
                        <span className="text-[7px] font-black text-main tracking-tighter">PF</span>
                    </div>

                    {/* 3D ARMS & HANDS WITH DYNAMIC POSES */}
                    <motion.div
                        className="absolute -left-2.5 top-1.5 w-2 h-5 bg-zinc-800 rounded-full border border-main/30 flex flex-col justify-end items-center p-0.5 shadow-sm"
                        animate={{
                            rotateZ: pose === 'talles' ? -35 : pose === 'sublimacion' ? -25 : 0
                        }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-main/80 shadow-[0_0_3px_#00A87A]" />
                    </motion.div>

                    <motion.div
                        className="absolute -right-2.5 top-1.5 w-2 h-5 bg-zinc-800 rounded-full border border-main/30 flex flex-col justify-end items-center p-0.5 shadow-sm origin-top"
                        animate={{
                            rotateZ: pose === 'waving' ? [-20, -100, -40, -100] : pose === 'thinking' ? -100 : pose === 'talles' ? 35 : 0
                        }}
                        transition={{ repeat: pose === 'waving' ? Infinity : 0, duration: 0.8 }}
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-main/80 shadow-[0_0_3px_#00A87A]" />
                    </motion.div>
                </div>

                {/* 3. DYNAMIC HELD 3D OBJECT REACTION ACCORDING TO POSE (Only if not xs size) */}
                {!isSmall && (
                    <motion.div
                        className="absolute bottom-0 -right-2 z-40 bg-zinc-950 border border-main p-1 rounded-lg shadow-[0_0_8px_#00A87A] text-main flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {pose === 'talles' && <Shirt className="w-3 h-3 text-main animate-bounce" />}
                        {pose === 'sublimacion' && <Palette className="w-3 h-3 text-emerald-400 animate-spin" />}
                        {pose === 'envios' && <Truck className="w-3 h-3 text-main animate-pulse" />}
                        {pose === 'pagos' && <CreditCard className="w-3 h-3 text-main animate-pulse" />}
                        {pose === 'thinking' && <Sparkles className="w-3 h-3 text-main animate-spin" />}
                        {(pose === 'idle' || pose === 'waving') && <ShieldCheck className="w-3 h-3 text-main" />}
                    </motion.div>
                )}

                {/* 4. HOVER THRUSTER FLAME / LEGS */}
                <div className="flex items-center gap-1 mt-0.5 z-10">
                    <motion.div
                        className="w-2 h-2.5 bg-linear-to-b from-main via-emerald-400 to-transparent rounded-b-full shadow-[0_0_6px_#00A87A]"
                        animate={{ height: [8, 11, 8] }}
                        transition={{ repeat: Infinity, duration: 0.4 }}
                    />
                    <motion.div
                        className="w-2 h-2.5 bg-linear-to-b from-main via-emerald-400 to-transparent rounded-b-full shadow-[0_0_6px_#00A87A]"
                        animate={{ height: [8, 11, 8] }}
                        transition={{ repeat: Infinity, duration: 0.4, delay: 0.2 }}
                    />
                </div>

            </motion.div>

            {/* 3D FLOATING SHADOW ON GROUND */}
            <motion.div
                className="absolute bottom-0 w-8 h-1 bg-black/80 rounded-full blur-xs"
                animate={{
                    scale: pose === 'idle' ? [1, 0.75, 1] : 1,
                    opacity: pose === 'idle' ? [0.8, 0.4, 0.8] : 0.8
                }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            />
        </div>
    );
}
