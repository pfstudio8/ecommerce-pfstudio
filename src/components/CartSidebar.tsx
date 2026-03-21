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
    const [paymentMethod, setPaymentMethod] = useState<'mp' | 'transfer'>('mp');
    const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);

    // Billing Data
    const [billingName, setBillingName] = useState("");
    const [billingDni, setBillingDni] = useState("");
    const [billingPhone, setBillingPhone] = useState("");
    const [billingAddress, setBillingAddress] = useState("");

    const handleCheckout = async () => {
        if (!user) {
            setCartOpen(false);
            setModalOpen(true);
            sileo.error({ title: "Debes iniciar sesión para comprar" });
            return;
        }

        if (checkoutStep === 1) {
            setCheckoutStep(2);
            return;
        }

        if (!billingName || !billingDni || !billingPhone || !billingAddress) {
            sileo.error({ title: "Por favor, completa todos los datos de facturación" });
            return;
        }

        setIsCheckingOut(true);
        const billingDetails = { name: billingName, dni: billingDni, phone: billingPhone, address: billingAddress };

        try {
            if (paymentMethod === 'transfer') {
                const res = await fetch('/api/checkout/transfer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items, user_email: user.email, billingDetails }),
                });

                const data = await res.json();
                if (data.success && data.order_id) {
                    window.location.href = `/transfer-success?orderId=${data.order_id}`;
                } else {
                    console.error("Transfer checkout error:", data);
                    sileo.error({ title: "Hubo un error al generar tu pedido." });
                    setIsCheckingOut(false);
                }
            } else {
                const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items, user_email: user.email, billingDetails }),
                });

                const data = await res.json();

                if (data.init_point) {
                    // Redirect user to MercadoPago
                    window.location.href = data.init_point;
                } else {
                    console.error("Checkout validation error:", data);
                    sileo.error({ title: "Hubo un error al generar el pago. Intenta de nuevo." });
                    setIsCheckingOut(false);
                }
            }
        } catch (error) {
            console.error("Checkout connection error:", error);
            sileo.error({ title: "Ocurrió un error inesperado al procesar el pago." });
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
        }, 150);
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
                        {checkoutStep === 2 && (
                            <button onClick={() => setCheckoutStep(1)} className="mr-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-1 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                        )}
                        <ShoppingBag className="w-5 h-5" />
                        {checkoutStep === 1 ? "Tu Bolsa" : "Facturación y Pago"}
                    </h2>
                    <button
                        onClick={() => { setCartOpen(false); setTimeout(() => setCheckoutStep(1), 300); }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* Cart Items or Billing Form */}
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
                    ) : checkoutStep === 1 ? (
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
                    ) : (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <p className="text-sm text-gray-500 mb-2">Por favor, completa tus datos para la factura electrónica.</p>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Nombre Completo / Razón Social <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={billingName}
                                    onChange={(e) => setBillingName(e.target.value)}
                                    className="w-full px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/50 focus:border-[var(--color-main)] transition-all"
                                    placeholder="Juan Pérez o Empresa S.A."
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">DNI / CUIT <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={billingDni}
                                    onChange={(e) => setBillingDni(e.target.value)}
                                    className="w-full px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/50 focus:border-[var(--color-main)] transition-all"
                                    placeholder="Sin puntos ni guiones"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Teléfono <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    required
                                    value={billingPhone}
                                    onChange={(e) => setBillingPhone(e.target.value)}
                                    className="w-full px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/50 focus:border-[var(--color-main)] transition-all"
                                    placeholder="+54 11 1234-5678"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Dirección / Localidad <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={billingAddress}
                                    onChange={(e) => setBillingAddress(e.target.value)}
                                    className="w-full px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/50 focus:border-[var(--color-main)] transition-all"
                                    placeholder="Av. Falsa 123, CABA"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Checkout */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-4">

                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-[var(--color-main)] text-2xl">
                                ${getTotalPrice().toLocaleString("es-AR")}
                            </span>
                        </div>

                        {/* Payment Method Selector - Only on Step 2 */}
                        {checkoutStep === 2 && (
                            <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-300">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-center mb-1">Método de Pago</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setPaymentMethod('mp')}
                                        className={cn(
                                            "py-2 px-3 border rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1",
                                            paymentMethod === 'mp'
                                                ? "border-[#009EE3] bg-[#009EE3]/10 text-[#009EE3]"
                                                : "border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        )}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9 15.5V11L13 13.5V17L9 15.5ZM17 11V14.5L13 12V8.5L17 11Z" fill="currentColor" />
                                        </svg>
                                        Mercado Pago
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('transfer')}
                                        className={cn(
                                            "py-2 px-3 border rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1",
                                            paymentMethod === 'transfer'
                                                ? "border-[var(--color-main)] bg-[var(--color-main)]/10 text-[var(--color-main)]"
                                                : "border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        )}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11.5 17V15H10.5C9.67 15 9 14.33 9 13.5V11.5C9 10.67 9.67 10 10.5 10H12.5V8H9V6H11V5H13V7H14C14.83 7 15.5 7.67 15.5 8.5V10.5C15.5 11.33 14.83 12 14 12H12V14H15.5V16H13V17H11.5Z" fill="currentColor" />
                                        </svg>
                                        Transferencia
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded font-bold uppercase tracking-widest text-sm hover:bg-[var(--color-main)] hover:text-white transition-colors disabled:opacity-70 flex justify-center items-center"
                        >
                            {isCheckingOut ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--background)]"></div>
                            ) : checkoutStep === 1 ? (
                                "Continuar Compra"
                            ) : (
                                "Pagar y Finalizar"
                            )}
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
