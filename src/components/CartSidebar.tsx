"use client";

import { X, Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Lock, RotateCcw } from "lucide-react";
import { useCartStore } from "@/features/orders/store/cart";
import { useAuthStore } from "@/features/auth/store/auth";
import { useAddressStore } from "@/features/orders/store/addresses";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import ProcessingOverlay from "@/components/ProcessingOverlay";

export default function CartSidebar() {
    const { items, removeItem, updateQuantity, getTotalPrice, isCartOpen, setCartOpen, updateSize } = useCartStore();
    const { user, setModalOpen } = useAuthStore();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'mp' | 'transfer'>('mp');
    
    const { addresses, fetchAddresses } = useAddressStore();
    const defaultAddress = addresses.find(a => a.is_default);

    useEffect(() => {
        if (isCartOpen && user) {
            fetchAddresses();
        }
    }, [isCartOpen, user, fetchAddresses]);

    const handleCheckout = async () => {
        if (!user) {
            setCartOpen(false);
            setModalOpen(true);
            toast.info("Inicia sesión para realizar la compra");
            return;
        }

        setIsCheckingOut(true);
        const startTime = Date.now();
        const billingDetails = { 
            name: user.user_metadata?.full_name || "", 
            dni: user.user_metadata?.dni || "", 
            phone: user.user_metadata?.phone || "", 
            address: defaultAddress ? `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state} (${defaultAddress.zip_code})` : user.user_metadata?.address || "" 
        };

        try {
            if (paymentMethod === 'transfer') {
                const res = await fetch('/api/checkout/transfer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items, user_email: user.email, billingDetails }),
                });

                if (!res.ok) {
                    throw new Error(`La solicitud de transferencia falló con estado ${res.status}`);
                }

                const data = await res.json();

                const elapsed = Date.now() - startTime;
                if (elapsed < 1500) await new Promise((res) => setTimeout(res, 1500 - elapsed));

                if (data.success && data.order_id) {
                    window.location.href = `/transfer-success?orderId=${data.order_id}`;
                } else {
                    console.error("Transfer checkout error:", data);
                    toast.error("Hubo un error al generar tu pedido.");
                    setIsCheckingOut(false);
                }
            } else {
                const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items, user_email: user.email, billingDetails }),
                });

                if (!res.ok) {
                    throw new Error(`La solicitud de Mercado Pago falló con estado ${res.status}`);
                }

                const data = await res.json();

                const elapsed = Date.now() - startTime;
                if (elapsed < 1500) await new Promise((res) => setTimeout(res, 1500 - elapsed));

                if (data.init_point) {
                    // Redirect user to MercadoPago
                    window.location.href = data.init_point;
                } else {
                    console.error("Checkout validation error:", data);
                    toast.error("Hubo un error al generar el pago. Intenta de nuevo.");
                    setIsCheckingOut(false);
                }
            }
        } catch (error: any) {
            console.error("Checkout connection error:", error);
            if (error.message && error.message.includes("falló con estado")) {
                 toast.error("Hubo un problema procesando el pago. Por favor, intentá de nuevo o contactá a soporte.");
            } else {
                 toast.error("Error de conexión. Revisá tu internet e intentá de nuevo.");
            }
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
                    "fixed inset-0 bg-black/40 backdrop-blur-sm z-60 transition-all duration-300",
                    isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setCartOpen(false)}
            />

            {/* Sidebar */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Carrito de compras"
                className={cn(
                    "fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface-container-lowest/85 backdrop-blur-2xl border-l border-outline-variant z-70 shadow-2xl transition-transform duration-300 flex flex-col",
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-outline-variant">
                    <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Tu Bolsa
                    </h2>
                    <button
                        onClick={() => setCartOpen(false)}
                        className="p-2 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-4">
                            <ShoppingBag className="w-12 h-12 opacity-20" />
                            <p>Tu carrito está vacío</p>
                            <button
                                onClick={() => setCartOpen(false)}
                                className="mt-4 px-8 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-on-primary shadow-sm hover:shadow-lg hover:shadow-primary/20"
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
                                        "flex gap-4 p-4 bg-surface-container border border-outline-variant rounded-lg transition-all duration-300 shadow-sm",
                                        isRemoving ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
                                    )}
                                >
                                    {/* Image */}
                                    <div className="relative w-20 h-24 bg-surface-container-high rounded overflow-hidden shrink-0">
                                        <Image
                                            src={item.product.images?.[0] || item.product.image_url || '/placeholder.png'}
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
                                                <h3 className="font-semibold text-on-surface line-clamp-1">
                                                    {item.product.name}
                                                </h3>
                                                {(() => {
                                                    const availableSizes = item.product.product_stock && item.product.product_stock.length > 0
                                                        ? item.product.product_stock.filter(s => s.stock_quantity > 0).map(s => s.size)
                                                        : (["S", "M", "L", "XL", "XXL"].includes(item.size) ? ["S", "M", "L", "XL", "XXL"] : [item.size]);
                                                    
                                                    if (availableSizes.length > 1) {
                                                        return (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <label className="text-sm text-on-surface-variant">Variante:</label>
                                                                <select 
                                                                    value={item.size}
                                                                    onChange={(e) => updateSize(item.product.id, item.size, e.target.value)}
                                                                    className="text-sm font-bold text-on-surface bg-surface-container-highest border border-outline-variant rounded px-2 py-0.5 outline-none focus:border-primary cursor-pointer"
                                                                >
                                                                    {availableSizes.map(size => (
                                                                        <option key={size} value={size}>{size}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <p className="text-sm text-on-surface-variant mt-1">
                                                            Variante: <span className="font-bold text-on-surface">{item.size}</span>
                                                        </p>
                                                    );
                                                })()}
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item.product.id, item.size)}
                                                className="text-red-400/80 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg group"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden shadow-sm">
                                                <button
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                                                    className="p-1.5 px-2.5 hover:bg-surface-container-high hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent text-on-surface"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-bold text-on-surface border-x border-outline-variant/50 py-1">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                                                    className="p-1.5 px-2.5 hover:bg-surface-container-high hover:text-primary text-on-surface"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <p className="font-bold text-primary">
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
                    <div className="p-6 border-t border-outline-variant bg-surface-container-lowest flex flex-col gap-4">

                        <div className="flex justify-between items-center text-lg font-bold text-on-surface">
                            <span>Total</span>
                            <span className="text-primary text-2xl">
                                ${getTotalPrice().toLocaleString("es-AR")}
                            </span>
                        </div>

                        {/* Delivery Address Summary */}
                        {user && (
                            <div className="bg-surface-container p-3 rounded-lg border border-outline-variant flex justify-between items-center text-sm">
                                <div>
                                    <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-0.5">Envío a</p>
                                    <p className="font-semibold text-(--foreground) line-clamp-1">
                                        {defaultAddress ? defaultAddress.street : (user.user_metadata?.address || "Dirección no configurada")}
                                    </p>
                                </div>
                                <a href="/profile" onClick={() => setCartOpen(false)} className="text-main font-bold text-xs whitespace-nowrap hover:underline">
                                    Cambiar
                                </a>
                            </div>
                        )}

                        {/* Payment Method Selector */}
                        <div className="flex flex-col gap-2 mt-2">
                            <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest text-center mb-1">Método de Pago</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setPaymentMethod('mp')}
                                    className={cn(
                                        "py-1.5 px-2 border rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2",
                                        paymentMethod === 'mp'
                                            ? "border-[#009EE3] bg-[#009EE3]/10 text-[#009EE3] shadow-sm shadow-[#009EE3]/10"
                                            : "border-outline-variant text-on-surface-variant hover:border-outline hover:bg-surface-container"
                                    )}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9 15.5V11L13 13.5V17L9 15.5ZM17 11V14.5L13 12V8.5L17 11Z" fill="currentColor" />
                                    </svg>
                                    Mercado Pago
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('transfer')}
                                    className={cn(
                                        "py-1.5 px-2 border rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2",
                                        paymentMethod === 'transfer'
                                            ? "border-primary bg-primary-container text-on-primary-container shadow-sm shadow-primary/10"
                                            : "border-outline-variant text-on-surface-variant hover:border-outline hover:bg-surface-container"
                                    )}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11.5 17V15H10.5C9.67 15 9 14.33 9 13.5V11.5C9 10.67 9.67 10 10.5 10H12.5V8H9V6H11V5H13V7H14C14.83 7 15.5 7.67 15.5 8.5V10.5C15.5 11.33 14.83 12 14 12H12V14H15.5V16H13V17H11.5Z" fill="currentColor" />
                                    </svg>
                                    Transferencia
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-[1.02] shadow-md shadow-primary/20 transition-all disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center"
                        >
                            {isCheckingOut ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-primary"></div>
                            ) : (
                                "Pagar y Finalizar"
                            )}
                        </button>

                        {/* Trust Badges */}
                        <div className="flex justify-center items-center gap-3 mt-2 text-[10px] text-gray-500 font-extrabold uppercase tracking-widest pt-2 border-t border-gray-100 dark:border-zinc-800">
                            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-500" /> Seguro</span>
                            <span className="opacity-30">•</span>
                            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-sky-500" /> Oficial</span>
                            <span className="opacity-30">•</span>
                            <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3 text-main" /> Garantía</span>
                        </div>
                    </div>
                )}
            </aside>

            {/* Branded Payment Processing Screen Overlay */}
            <ProcessingOverlay
                isOpen={isCheckingOut}
                type={paymentMethod === 'mp' ? 'mercadopago' : 'transfer'}
                title={
                    paymentMethod === 'mp'
                        ? "Conectando con Mercado Pago..."
                        : "Generando Orden de Compra..."
                }
                subtitle={
                    paymentMethod === 'mp'
                        ? "Te estamos redirigiendo a la pasarela oficial de pago seguro."
                        : "Preparando tus datos bancarios y registrando tu pedido."
                }
            />
        </>
    );
}
