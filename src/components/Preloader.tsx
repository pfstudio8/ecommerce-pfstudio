"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Preloader() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Hide the preloader after the animation completes (2.5 seconds total)
        const timeout = setTimeout(() => {
            setIsVisible(false);
        }, 2800);

        return () => clearTimeout(timeout);
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)] transition-opacity duration-800",
                "animate-fadeOut delay-[2000ms]"
            )}
            style={{ animationDelay: "2s" }}
        >
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-[0.2em] text-[var(--foreground)] animate-pulseLogo">
                    PFSTUDIO
                </h1>
                <div className="mt-8 h-[2px] w-64 overflow-hidden bg-black/10 dark:bg-white/10 mx-auto">
                    <div className="h-full bg-[var(--foreground)] animate-progressWidth" />
                </div>
            </div>
        </div>
    );
}
