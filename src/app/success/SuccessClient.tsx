"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/features/orders/store/cart";
import { CheckCircle2, ArrowRight, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./TransactionAnimation.module.css";

import ProcessingOverlay from "@/components/ProcessingOverlay";

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
        document.cookie = `pago_exitoso=true; max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Strict; Secure`;

        // 3. Minimum display delay for smooth branding loading experience
        const timer = setTimeout(() => {
            setIsProcessing(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [status, paymentId, router, clearCart]);

    if (isProcessing) {
        return (
            <ProcessingOverlay
                isOpen={true}
                type="mercadopago"
                title="Validando tu pago..."
                subtitle="Confirmando tu transacción aprobada con Mercado Pago."
            />
        );
    }

    return (
        <div className="min-h-screen bg-(--background) pt-32 pb-24 px-4 flex items-center justify-center animate-in fade-in duration-700">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
            >
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-main" />

                {/* Custom Transaction Micro-animation */}
                <div className="flex justify-center mb-8 relative z-10">
                    <div className={styles.txContainer}>
                        <div className={styles.txLeftSide}>
                            <div className={styles.txCard}>
                                <div className={styles.txCardLine}></div>
                                <div className={styles.txButtons}></div>
                            </div>
                            <div className={styles.txPost}>
                                <div className={styles.txPostLine}></div>
                                <div className={styles.txScreen}>
                                    <div className={styles.txDollar}>$</div>
                                </div>
                                <div className={styles.txNumbers}></div>
                                <div className={styles.txNumbersLine2}></div>
                            </div>
                        </div>
                        <div className={styles.txRightSide}>
                            <div className={styles.txNew}>¡Pago Aprobado!</div>
                            <svg className={styles.txArrow} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 451.846 451.847">
                                <path d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z" fill="#00a87a" />
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-(--foreground) mb-4">
                    ¡Pago Exitoso!
                </h1>

                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                    Muchas gracias por tu compra y por confiar en PF Studio. Hemos asegurado tu pedido (<strong>#{paymentId}</strong>). En breves recibirás confirmación en tu correo.
                </p>

                <div className="bg-gray-50 dark:bg-zinc-950 rounded-2xl p-6 mb-10 border border-gray-100 dark:border-zinc-800 text-left">
                    <h3 className="font-bold flex items-center gap-2 mb-4 text-(--foreground)">
                        <Package className="w-5 h-5" />
                        Próximos pasos
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex gap-2">
                            <span className="font-bold text-main">1.</span>
                            Confirmaremos el stock de tu pedido inmediatamente.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-main">2.</span>
                            Prepararemos cuidadosamente tus prendas.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-main">3.</span>
                            Te contactaremos para coordinar el envío o retiro.
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="flex-1 py-4 bg-(--foreground) text-(--background) rounded-xl font-bold hover:bg-main hover:text-white transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-main/30 flex items-center justify-center gap-2"
                    >
                        Volver al inicio <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
