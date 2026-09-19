"use client";

import { motion } from "framer-motion";
import { Sparkles, Shirt, Truck, CreditCard, Palette, ShieldCheck } from "lucide-react";

export type BotPose = 'idle' | 'waving' | 'talles' | 'sublimacion' | 'envios' | 'pagos' | 'thinking';

interface PFBotAvatar3DProps {
    pose?: BotPose;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function PFBotAvatar3D({ pose = 'idle', size = 'md' }: PFBotAvatar3DProps) {
    const dimensions = {
        xs: { width: 28, height: 28 },
        sm: { width: 42, height: 42 },
        md: { width: 70, height: 70 },
        lg: { width: 100, height: 100 }
    }[size];

    return (
        <div className="relative flex flex-col items-center justify-center select-none overflow-visible" style={{ width: dimensions.width, height: dimensions.height }}>
            <img 
                src="/images/chems_avatar.jpg" 
                alt="Chems Avatar" 
                className="w-full h-full object-cover rounded-full shadow-lg border-2 border-primary/50" 
            />
        </div>
    );
}
