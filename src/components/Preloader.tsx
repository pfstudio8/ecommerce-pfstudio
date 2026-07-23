"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Preloader() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Hide the preloader quickly
        const timeout = setTimeout(() => {
            setIsVisible(false);
        }, 800);

        return () => clearTimeout(timeout);
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)] transition-opacity duration-300",
                "animate-fadeOut delay-[500ms]"
            )}
            style={{ animationDelay: "0.5s" }}
        >
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-[0.2em] text-[var(--foreground)] animate-pulseLogo">
                    PFSTUDIO
                </h1>
                <div className="mt-8 h-[2px] w-64 overflow-hidden bg-black/10 dark:bg-white/10 mx-auto">
                    <div className="h-full bg-[var(--foreground)] animate-progressWidth" style={{ animationDuration: "0.5s" }} />
                </div>
            </div>
        </div>
    );
}
