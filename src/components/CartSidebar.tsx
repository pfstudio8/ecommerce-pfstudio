"use client";

import { X, Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Lock, ArrowLeft, Truck, Store, Landmark, ChevronRight, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useCartStore } from "@/features/orders/store/cart";
import { useAuthStore } from "@/features/auth/store/auth";
import { useAddressStore } from "@/features/orders/store/addresses";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import ProcessingOverlay from "@/components/ProcessingOverlay";

export default function CartSidebar() {
    const { 
        items, 
        removeItem, 
        updateQuantity, 
        getTotalPrice, 
        isCartOpen, 
        setCartOpen, 
        updateSize, 
        clearCart,
        isValidating,
        validationWarnings,
        clearWarnings,
        validateWithServer
    } = useCartStore();
    const { user } = useAuthStore();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [currentStep, setCurrentStep] = useState<'cart' | 'form'>('cart');
    
    const { addresses, fetchAddresses } = useAddressStore();
    const defaultAddress = addresses.find(a => a.is_default);

    // Formulario de Checkout por Transferencia
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        deliveryMethod: 'shipping' as 'shipping' | 'pickup',
        shippingAddress: "",
        notes: ""
    });

    useEffect(() => {
        if (isCartOpen && user) {
            fetchAddresses();
        }
    }, [isCartOpen, user, fetchAddresses]);

    // Prellenar formulario con datos del usuario autenticado si existen
    useEffect(() => {
        if (user) {
            const formattedAddress = defaultAddress 
                ? `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state} (${defaultAddress.zip_code})`
                : (user.user_metadata?.address || "");

            setFormData(prev => ({
                ...prev,
                name: prev.name || user.user_metadata?.full_name || "",
                email: prev.email || user.email || "",
                phone: prev.phone || user.user_metadata?.phone || "",
                shippingAddress: prev.shippingAddress || formattedAddress
            }));
        }
    }, [user, defaultAddress]);

    // Reset step when cart closes
    useEffect(() => {
        if (!isCartOpen) {
            setCurrentStep('cart');
        }
    }, [isCartOpen]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGoToForm = async () => {
        if (items.length === 0) {
            toast.error("El carrito está vacío");
            return;
        }

        const res = await validateWithServer();
        if (res.hasAdjustments) {
            toast.warning("Se actualizaron precios o cantidades por stock disponible.");
        }

        const hasOutOfStock = items.some(i => i.isOutOfStock);
        if (hasOutOfStock) {
            toast.error("Hay artículos sin stock disponible en tu bolsa. Elimínalos para continuar.");
            return;
        }

        setCurrentStep('form');
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones en cliente
        if (!formData.name.trim()) {
            toast.error("Por favor, ingresá tu nombre completo");
            return;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            toast.error("Por favor, ingresá un correo electrónico válido");
            return;
        }
        if (!formData.phone.trim() || formData.phone.length < 6) {
            toast.error("Por favor, ingresá un número de teléfono o WhatsApp de contacto");
            return;
        }
        if (formData.deliveryMethod === 'shipping' && (!formData.shippingAddress || formData.shippingAddress.trim().length < 5)) {
            toast.error("Por favor, completá la dirección de envío");
            return;
        }

        setIsCheckingOut(true);
        const startTime = Date.now();

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    customer: formData
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Error en el servidor (${res.status})`);
            }

            const elapsed = Date.now() - startTime;
            if (elapsed < 1200) await new Promise((r) => setTimeout(r, 1200 - elapsed));

            if (data.success && data.orderId) {
                clearCart();
                setCartOpen(false);
                window.location.href = `/transfer-success?orderId=${data.orderId}&amount=${data.totalAmount || 0}`;
            } else {
                toast.error(data.error || "Hubo un error al generar tu pedido.");
                setIsCheckingOut(false);
            }
        } catch (error: any) {
            console.error("Error en checkout por transferencia:", error);
            toast.error(error.message || "Error al conectar con el servidor. Revisá tu conexión.");
            setIsCheckingOut(false);
        }
    };

    const handleRemove = (productId: string, size: string) => {
        const idToRemove = `${productId}-${size}`;
        setRemovingId(idToRemove);
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
                    "fixed inset-0 bg-black/50 backdrop-blur-sm z-60 transition-all duration-300",
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
                    "fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface-container-lowest/95 backdrop-blur-2xl border-l border-outline-variant z-70 shadow-2xl transition-transform duration-300 flex flex-col",
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface">
                    {currentStep === 'form' ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentStep('cart')}
                                className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                                title="Volver al carrito"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-bold text-on-surface">Datos de Entrega</h2>
                        </div>
                    ) : (
                        <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                            Tu Bolsa
                        </h2>
                    )}
                    <div className="flex items-center gap-1">
                        {currentStep === 'cart' && items.length > 0 && (
                            <button
                                onClick={() => validateWithServer()}
                                disabled={isValidating}
                                className="p-2 hover:bg-surface-container text-outline hover:text-on-surface rounded-full transition-colors"
                                title="Verificar stock y precios en tiempo real"
                            >
                                <RefreshCw className={cn("w-4 h-4 text-primary", isValidating && "animate-spin")} />
                            </button>
                        )}
                        <button
                            onClick={() => setCartOpen(false)}
                            className="p-2 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Step 1: Cart Items Review */}
                {currentStep === 'cart' && (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
                            {/* Validation Warnings Alert Banner */}
                            {validationWarnings.length > 0 && (
                                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            Actualización de carrito en tiempo real
                                        </span>
                                        <button 
                                            onClick={clearWarnings}
                                            className="text-[10px] font-bold uppercase tracking-wider text-outline hover:text-on-surface"
                                        >
                                            Entendido
                                        </button>
                                    </div>
                                    <div className="space-y-1 text-xs text-on-surface-variant font-medium">
                                        {validationWarnings.map((w, idx) => (
                                            <p key={idx}>• {w}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-4">
                                    <ShoppingBag className="w-12 h-12 opacity-20" />
                                    <p className="font-medium text-sm">Tu carrito está vacío</p>
                                    <button
                                        onClick={() => setCartOpen(false)}
                                        className="mt-4 px-6 py-2.5 border border-primary text-primary font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-all shadow-sm"
                                    >
                                        Explorar Catálogo
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
                                                "flex gap-4 p-4 bg-surface border rounded-xl transition-all duration-300 shadow-sm",
                                                item.isOutOfStock ? "border-red-500/50 bg-red-500/5" : "border-outline-variant",
                                                isRemoving ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
                                            )}
                                        >
                                            {/* Image */}
                                            <div className="relative w-20 h-24 bg-surface-container rounded-lg overflow-hidden shrink-0 border border-outline-variant">
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
                                                        <h3 className="font-bold text-sm text-on-surface line-clamp-1">
                                                            {item.product.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            {(() => {
                                                                const availableSizes = item.product.product_stock && item.product.product_stock.length > 0
                                                                    ? item.product.product_stock.filter(s => s.stock_quantity > 0).map(s => s.size)
                                                                    : (["S", "M", "L", "XL", "XXL"].includes(item.size) ? ["S", "M", "L", "XL", "XXL"] : [item.size]);
                                                                
                                                                if (availableSizes.length > 1) {
                                                                    return (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Talle:</span>
                                                                            <select
                                                                                value={item.size}
                                                                                onChange={(e) => updateSize(item.product.id, item.size, e.target.value)}
                                                                                className="text-xs bg-surface-container border border-outline-variant rounded px-1.5 py-0.5 text-on-surface font-bold focus:outline-none focus:border-primary"
                                                                            >
                                                                                {availableSizes.map(size => (
                                                                                    <option key={size} value={size} className="bg-surface text-on-surface">{size}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    );
                                                                }
                                                                return (
                                                                    <p className="text-xs text-outline font-medium">
                                                                        Talle: <span className="font-bold text-primary">{item.size}</span>
                                                                    </p>
                                                                );
                                                            })()}

                                                            {item.isOutOfStock && (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                                                    Agotado
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.warning && (
                                                            <p className="text-[11px] text-amber-400 mt-1 font-medium leading-tight">{item.warning}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(item.product.id, item.size)}
                                                        className="text-outline hover:text-red-400 p-1 transition-colors"
                                                        title="Eliminar producto"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex justify-between items-center mt-3">
                                                    {/* Quantity Control */}
                                                    <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container overflow-hidden">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                                                            className="p-1 hover:bg-surface-container-high transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3 text-on-surface-variant" />
                                                        </button>
                                                        <span className="px-2.5 text-xs font-bold text-on-surface">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                                                            disabled={item.isOutOfStock || (item.availableStock !== undefined && item.quantity >= item.availableStock)}
                                                            className="p-1 hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <Plus className="w-3 h-3 text-on-surface-variant" />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <span className={cn(
                                                        "font-black text-sm",
                                                        item.isOutOfStock ? "text-outline line-through" : "text-on-surface"
                                                    )}>
                                                        ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Summary & Checkout Button */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-outline-variant bg-surface space-y-4">
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between text-outline">
                                        <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} prendas)</span>
                                        <span className="font-medium text-on-surface">${getTotalPrice().toLocaleString("es-AR")}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-extrabold text-on-surface pt-2 border-t border-outline-variant">
                                        <span>Total estimado</span>
                                        <span className="text-primary font-black">${getTotalPrice().toLocaleString("es-AR")}</span>
                                    </div>
                                </div>

                                <div className="bg-primary-container/20 border border-primary/20 rounded-xl p-3 flex items-center gap-2.5 text-xs text-on-surface-variant">
                                    <Landmark className="w-4 h-4 text-primary shrink-0" />
                                    <span>Pago seguro por <strong>Transferencia Bancaria</strong> (Alias / CBU al confirmar).</span>
                                </div>

                                {items.some(i => i.isOutOfStock) && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <span>Hay artículos agotados en tu carrito. Por favor elimínalos para continuar.</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleGoToForm}
                                    disabled={items.some(i => i.isOutOfStock) || isValidating}
                                    className="w-full py-4 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all shadow-md active:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isValidating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Validando stock con el servidor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{items.some(i => i.isOutOfStock) ? "Eliminá productos agotados" : "Completar Datos de Envío"}</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Step 2: Customer & Delivery Details Form */}
                {currentStep === 'form' && (
                    <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                            <div className="bg-surface border border-outline-variant rounded-xl p-3 flex justify-between items-center text-xs">
                                <span className="text-outline">Resumen de tu pedido:</span>
                                <span className="font-bold text-primary">${getTotalPrice().toLocaleString("es-AR")} ({items.length} artículos)</span>
                            </div>

                            {/* Nombre */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                    Nombre y Apellido *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="Ej: Juan Pérez"
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                    Email de Contacto *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    placeholder="tu-email@gmail.com"
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                                />
                                <p className="text-[11px] text-outline">Allí recibirás el comprobante y seguimiento de tu compra.</p>
                            </div>

                            {/* Teléfono */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                    Teléfono / WhatsApp *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleFormChange}
                                    placeholder="Ej: 11 2345-6789"
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Método de Entrega */}
                            <div className="space-y-2 pt-1">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                    Método de Entrega *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'shipping' }))}
                                        className={cn(
                                            "p-3 rounded-xl border text-left flex flex-col gap-1 transition-all",
                                            formData.deliveryMethod === 'shipping'
                                                ? "border-primary bg-primary-container/20 text-on-surface"
                                                : "border-outline-variant bg-surface text-on-surface-variant hover:border-outline"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 font-bold text-xs">
                                            <Truck className="w-4 h-4 text-primary" />
                                            <span>Envío a Domicilio</span>
                                        </div>
                                        <span className="text-[10px] text-outline">A coordinar por WhatsApp</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'pickup' }))}
                                        className={cn(
                                            "p-3 rounded-xl border text-left flex flex-col gap-1 transition-all",
                                            formData.deliveryMethod === 'pickup'
                                                ? "border-primary bg-primary-container/20 text-on-surface"
                                                : "border-outline-variant bg-surface text-on-surface-variant hover:border-outline"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 font-bold text-xs">
                                            <Store className="w-4 h-4 text-primary" />
                                            <span>Retiro en Local</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-400 font-bold">Gratis</span>
                                    </button>
                                </div>
                            </div>

                            {/* Dirección de Envío si aplica */}
                            {formData.deliveryMethod === 'shipping' && (
                                <div className="space-y-1.5 animate-in fade-in duration-200">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                        Dirección de Entrega Completa *
                                    </label>
                                    <input
                                        type="text"
                                        name="shippingAddress"
                                        required
                                        value={formData.shippingAddress}
                                        onChange={handleFormChange}
                                        placeholder="Calle, Número, Depto, Ciudad, CP"
                                        className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            )}

                            {/* Notas Adicionales */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                    Notas o Instrucciones (Opcional)
                                </label>
                                <input
                                    type="text"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleFormChange}
                                    placeholder="Ej: Timbre B, dejar en portería"
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="p-6 border-t border-outline-variant bg-surface space-y-3">
                            <button
                                type="submit"
                                disabled={isCheckingOut}
                                className="w-full py-4 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all shadow-md active:scale-[1.02] disabled:opacity-60"
                            >
                                {isCheckingOut ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-on-primary"></div>
                                ) : (
                                    <span>Confirmar y Ver Datos de Pago</span>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-outline">
                                Al confirmar, tu pedido quedará registrado en espera de la transferencia.
                            </p>
                        </div>
                    </form>
                )}
            </aside>

            {/* Processing Overlay */}
            <ProcessingOverlay
                isOpen={isCheckingOut}
                type="transfer"
                title="Generando Pedido..."
                subtitle="Validando stock disponible y calculando el total exacto."
            />
        </>
    );
}
