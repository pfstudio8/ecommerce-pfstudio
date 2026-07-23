"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { sileo } from "sileo";
import { useCartStore } from "@/store/cart";

export default function PostPurchaseHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const clearCart = useCartStore(state => state.clearCart);

    useEffect(() => {
        const status = searchParams.get('status');

        if (status === 'success') {
            // Show success toast
            sileo.success({
                title: "¡Pago exitoso!",
                description: "Gracias por tu compra. En breve recibirás un correo de confirmación."
            });
            // Clear the cart
            clearCart();

            // Clean the URL without refreshing
            const url = new URL(window.location.href);
            url.searchParams.delete('status');
            url.searchParams.delete('payment_id');
            url.searchParams.delete('payment_intent');
            url.searchParams.delete('payment_intent_client_secret');
            url.searchParams.delete('redirect_status');
            window.history.replaceState({}, '', url.pathname + url.search);
        } else if (status === 'failure') {
            sileo.error({
                title: "El pago fue rechazado",
                description: "Por favor, intenta de nuevo o usa otro método de pago."
            });
            const url = new URL(window.location.href);
            url.searchParams.delete('status');
            window.history.replaceState({}, '', url.pathname + url.search);
        } else if (status === 'pending') {
            sileo.success({
                title: "Pago pendiente",
                description: "Tu pago está siendo procesado. Te avisaremos cuando se apruebe."
            });
            clearCart();
            const url = new URL(window.location.href);
            url.searchParams.delete('status');
            window.history.replaceState({}, '', url.pathname + url.search);
        }

    }, [searchParams, clearCart, router]);

    return null;
}
