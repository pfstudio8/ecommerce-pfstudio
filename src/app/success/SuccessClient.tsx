"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { CheckCircle2, ArrowRight, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SuccessClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const clearCart = useCartStore((state) => state.clearCart);

    // URLParams from MP
    const status = searchParams.get("status");
    const paymentId = searchParams.get("payment_id");

    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        // If there's no payment_id or status is not 'approved', redirect home
        if (!paymentId || status !== "approved") {
            router.push("/");
            return;
        }

        // 1. Clear cart
        clearCart();

        // 2. Set 'pago exitoso' cookie for 30 days
        document.cookie = `pago_exitoso=true; max-age=${60 * 60 * 24 * 30}; path=/`;

        setIsProcessing(false);
    }, [status, paymentId, router, clearCart]);

    if (isProcessing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
                <Loader2 className="w-12 h-12 text-[var(--color-main)] animate-spin mb-4" />
                <p className="text-[var(--foreground)] font-medium">Validando tu pago...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] pt-32 pb-24 px-4 flex items-center justify-center animate-in fade-in duration-700">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
            >
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-main)]" />

                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white dark:border-zinc-900 shadow-lg z-10 relative">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] mb-4">
                    ¡Pago Exitoso!
                </h1>

                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                    Muchas gracias por tu compra y por confiar en PF Studio. Hemos asegurado tu pedido (<strong>#{paymentId}</strong>). En breves recibirás confirmación en tu correo.
                </p>

                <div className="bg-gray-50 dark:bg-zinc-950 rounded-2xl p-6 mb-10 border border-gray-100 dark:border-zinc-800 text-left">
                    <h3 className="font-bold flex items-center gap-2 mb-4 text-[var(--foreground)]">
                        <Package className="w-5 h-5" />
                        Próximos pasos
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex gap-2">
                            <span className="font-bold text-[var(--color-main)]">1.</span>
                            Confirmaremos el stock de tu pedido inmediatamente.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-[var(--color-main)]">2.</span>
                            Prepararemos cuidadosamente tus prendas.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-[var(--color-main)]">3.</span>
                            Te contactaremos para coordinar el envío o retiro.
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="flex-1 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold hover:bg-[var(--color-main)] hover:text-white transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-[var(--color-main)]/30 flex items-center justify-center gap-2"
                    >
                        Volver al inicio <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
