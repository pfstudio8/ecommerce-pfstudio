"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransitionBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsNavigating(true);
        const timer = setTimeout(() => {
            setIsNavigating(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return (
        <AnimatePresence>
            {isNavigating && (
                <motion.div
                    initial={{ scaleX: 0, opacity: 1 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ transformOrigin: "0%" }}
                    className="fixed top-0 left-0 right-0 h-1 bg-main z-110 shadow-[0_0_10px_#00A87A]"
                />
            )}
        </AnimatePresence>
    );
}
