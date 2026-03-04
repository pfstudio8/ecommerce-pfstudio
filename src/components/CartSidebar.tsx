"use client";

import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { sileo } from "sileo";
import Image from "next/image";

export default function CartSidebar() {
    const { items, removeItem, updateQuantity, getTotalPrice, isCartOpen, setCartOpen } = useCartStore();
    const { user, setModalOpen } = useAuthStore();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        if (!user) {
            setCartOpen(false);
            setModalOpen(true);
            sileo.error({ title: "Debes iniciar sesión para comprar" });
            return;
        }

        setIsCheckingOut(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
            });

            const data = await res.json();

            if (data.init_point) {
                // Redirect user to MercadoPago
                window.location.href = data.init_point;
            } else {
                console.error("Checkout validation error:", data);
                alert("Hubo un error al generar el pago. Intenta de nuevo.");
                setIsCheckingOut(false);
            }
        } catch (error) {
            console.error("Checkout connection error:", error);
            alert("No se pudo conectar con MercadoPago.");
            setIsCheckingOut(false);
        }
    };

    const handleRemove = (productId: string, size: string) => {
        const idToRemove = `${productId}-${size}`;
        setRemovingId(idToRemove);
        // Small delay for the animation to finish
        setTimeout(() => {
            removeItem(productId, size);
            setRemovingId(null);
        }, 300);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-all duration-300",
                    isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setCartOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 right-0 bottom-0 w-full max-w-md bg-[var(--background)]/85 backdrop-blur-2xl border-l border-white/10 dark:border-zinc-800/50 z-[70] shadow-2xl transition-transform duration-300 flex flex-col",
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Tu Bolsa
                    </h2>
                    <button
                        onClick={() => setCartOpen(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                            <ShoppingBag className="w-12 h-12 opacity-20" />
                            <p>Tu carrito está vacío</p>
                            <button
                                onClick={() => setCartOpen(false)}
                                className="mt-4 px-6 py-2 border border-[var(--color-main)] text-[var(--color-main)] rounded hover:bg-[var(--color-main)] hover:text-white transition-colors"
                            >
                                Seguir Comprando
                            </button>
                        </div>
                    ) : (
                        items.map((item) => {
                            const uniqueId = `${item.product.id}-${item.size}`;
                            const isRemoving = removingId === uniqueId;

                            return (
                                <div
                                    key={uniqueId}
                                    className={cn(
                                        "flex gap-4 p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg transition-all duration-300",
                                        isRemoving ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
                                    )}
                                >
                                    {/* Image */}
                                    <div className="relative w-20 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-col flex-1 justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-[var(--foreground)] line-clamp-1">
                                                    {item.product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Talle: <span className="font-bold text-[var(--foreground)]">{item.size}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item.product.id, item.size)}
                                                className="text-red-400 hover:text-red-500 p-1 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded">
                                                <button
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                                                    className="p-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors text-[var(--foreground)]"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                                                    className="p-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-[var(--foreground)]"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <p className="font-bold text-[var(--color-main)]">
                                                ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer / Checkout */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-4">
                        {/* Free Shipping Progress */}
                        {(() => {
                            const FREE_SHIPPING_THRESHOLD = 100000;
                            const total = getTotalPrice();
                            const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
                            const amountRemaining = FREE_SHIPPING_THRESHOLD - total;

                            return (
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-semibold max-w-[80%] text-[var(--foreground)]">
                                            {total >= FREE_SHIPPING_THRESHOLD
                                                ? "¡Felicidades! Tienes envío gratis."
                                                : `Agrega $${amountRemaining.toLocaleString("es-AR")} para envío gratis.`}
                                        </span>
                                        <span className="text-xs font-bold text-[var(--color-main)]">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-[var(--color-main)] h-full transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-[var(--color-main)] text-2xl">
                                ${getTotalPrice().toLocaleString("es-AR")}
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded font-bold uppercase tracking-widest text-sm hover:bg-[var(--color-main)] hover:text-white transition-colors disabled:opacity-70 flex justify-center items-center"
                        >
                            {isCheckingOut ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--background)]"></div>
                            ) : (
                                "Ir a Pagar"
                            )}
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
