"use client";

import { 
    X, 
    Minus, 
    Plus, 
    Trash2, 
    ShoppingBag, 
    ArrowLeft, 
    Truck, 
    Store, 
    Landmark, 
    ChevronRight, 
    AlertTriangle, 
    Loader2, 
    RefreshCw, 
    MessageCircle, 
    CreditCard,
    ShoppingCart,
    Bookmark,
    Zap,
    ShieldCheck,
    Headphones,
    Gift
} from "lucide-react";
import { useCartStore } from "@/features/orders/store/cart";
import { useAuthStore } from "@/features/auth/store/auth";
import { useAddressStore } from "@/features/orders/store/addresses";
import BenefitTierBar, { getUnlockedBenefitSummary, BENEFIT_TIERS } from "@/features/orders/components/BenefitTierBar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import { Product } from "@/types/product";

// Accesorios sugeridos para la tarjeta de Upsell / Subir de Nivel
const QUICK_ADD_SUGGESTIONS: Product[] = [
    {
        id: "posavasos-taller-pf",
        name: "Posavasos",
        category: "Accesorios",
        price: 2500,
        image_url: "/images/crop-rompecabezas-v2.jpg",
        description: "Posavasos rígido para souvenirs y talleres.",
        stock: 50,
        active: true,
        product_stock: [{ size: "Único", stock_quantity: 50 }]
    },
    {
        id: "tapa-extra-bambu-pf",
        name: "Tapa Extra",
        category: "Cristalería",
        price: 1800,
        image_url: "/images/crop-vaso-cristal-v2.jpg",
        description: "Tapa de bambú natural para vasos y cristales.",
        stock: 40,
        active: true,
        product_stock: [{ size: "Único", stock_quantity: 40 }]
    }
];

export default function CartSidebar() {
    const { 
        items, 
        addItem,
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

    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
    const totalPrice = getTotalPrice();
    const unlockedTiers = BENEFIT_TIERS.filter(tier => totalItems >= tier.minItems);
    const highestUnlocked = unlockedTiers.length > 0 ? unlockedTiers[unlockedTiers.length - 1] : null;
    const nextTier = BENEFIT_TIERS.find(tier => totalItems < tier.minItems);
    const itemsNeeded = nextTier ? nextTier.minItems - totalItems : 0;

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

    const handleOrderCartViaWhatsApp = () => {
        if (items.length === 0) {
            toast.error("La bolsa está vacía");
            return;
        }

        const unlockedRewards = getUnlockedBenefitSummary(totalItems);
        const isBulk = totalItems >= 10;
        const discount = isBulk ? totalPrice * 0.10 : 0;
        const finalAmount = totalPrice - discount;

        const lines = [
            "¡Hola PFSTUDIO! 👋 Quiero coordinar el pedido de mi Bolsa de Compras:",
            "",
            ...items.map((item, idx) => {
                const sizeLabel = item.size && item.size !== 'Único' && item.size !== 'Standard' ? ` (Talle ${item.size})` : '';
                return `${idx + 1}. *${item.product.name}*${sizeLabel} x${item.quantity} - $${(item.product.price * item.quantity).toLocaleString("es-AR")}`;
            }),
            "",
            `• *Total de prendas*: ${totalItems} ${totalItems === 1 ? 'unidad' : 'unidades'}`,
            unlockedRewards.length > 0 ? `• *Beneficios alcanzados*: 🎁 ${unlockedRewards.join(" + ")}` : null,
            isBulk ? `• *Descuento 10% OFF aplicado*: -$${Math.round(discount).toLocaleString("es-AR")}` : null,
            `• *Total estimado*: $${Math.round(finalAmount).toLocaleString("es-AR")}`,
            "",
            "¿Cómo coordinamos el pago y los diseños para la muestra previa?"
        ].filter(Boolean).join("\n");

        window.open(`https://wa.me/5493704245651?text=${encodeURIComponent(lines)}`, "_blank");
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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

    const handleAddQuickSuggestion = (product: Product) => {
        addItem(product, "Único");
        toast.success(`¡Agregaste ${product.name} a tu bolsa!`);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-all duration-300",
                    isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setCartOpen(false)}
            />

            {/* Sidebar Drawer */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Carrito de compras"
                className={cn(
                    "fixed top-0 right-0 bottom-0 w-full max-w-md sm:max-w-lg bg-white border-l border-neutral-200/80 z-[100] shadow-2xl transition-transform duration-300 ease-out flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden select-none",
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-neutral-200/80 bg-white">
                    {currentStep === 'form' ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentStep('cart')}
                                className="p-1.5 hover:bg-neutral-100 rounded-xl text-neutral-800 transition-colors"
                                title="Volver al carrito"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-base font-black text-neutral-900">Datos de Entrega</h2>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-800">
                                <ShoppingBag className="w-4 h-4 text-emerald-800" />
                            </div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black tracking-tight text-neutral-900 leading-none">
                                    Tu Bolsa
                                </h2>
                                <span className="bg-emerald-100/80 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    {totalItems} {totalItems === 1 ? 'prenda' : 'prendas'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        {currentStep === 'cart' && items.length > 0 && (
                            <button
                                onClick={() => validateWithServer()}
                                disabled={isValidating}
                                className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 rounded-full transition-colors"
                                title="Verificar stock y precios en tiempo real"
                            >
                                <RefreshCw className={cn("w-4 h-4 text-neutral-600", isValidating && "animate-spin")} />
                            </button>
                        )}
                        <button
                            onClick={() => setCartOpen(false)}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
                            title="Cerrar bolsa"
                        >
                            <span>Cerrar</span>
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Step 1: Cart Items Review */}
                {currentStep === 'cart' && (
                    <>
                        {/* Dynamic Benefit Tier Progress Bar Card */}
                        {items.length > 0 && (
                            <div className="shrink-0 px-4 sm:px-5 py-3 bg-white border-b border-neutral-100">
                                <BenefitTierBar itemCount={totalItems} />
                            </div>
                        )}

                        {/* Middle Scrollable Area: Products + Utilities + Quick Add Upsell */}
                        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 space-y-3.5 bg-[#fbfaf8] custom-scrollbar">
                            {/* Validation Warnings Alert Banner */}
                            {validationWarnings.length > 0 && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            Actualización en tiempo real
                                        </span>
                                        <button 
                                            onClick={clearWarnings}
                                            className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900"
                                        >
                                            Entendido
                                        </button>
                                    </div>
                                    <div className="space-y-0.5 text-xs text-neutral-600 font-medium">
                                        {validationWarnings.map((w, idx) => (
                                            <p key={idx}>• {w}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-3 py-20">
                                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                                        <ShoppingBag className="w-8 h-8 opacity-60" />
                                    </div>
                                    <p className="font-bold text-base text-neutral-800">Tu bolsa está vacía</p>
                                    <p className="text-xs text-neutral-500 text-center max-w-xs">
                                        Descubrí nuestros sets, indumentaria y regalos personalizados para sumarlos a la bolsa.
                                    </p>
                                    <button
                                        onClick={() => setCartOpen(false)}
                                        className="mt-2 px-6 py-2.5 bg-neutral-900 text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-sm"
                                    >
                                        Explorar Catálogo
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Product Cards List */}
                                    <div className="space-y-3">
                                        {items.map((item) => {
                                            const uniqueId = `${item.product.id}-${item.size}`;
                                            const isRemoving = removingId === uniqueId;

                                            return (
                                                <div
                                                    key={uniqueId}
                                                    className={cn(
                                                        "p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs transition-all duration-200 flex gap-3.5 relative",
                                                        item.isOutOfStock ? "border-red-300 bg-red-50/30" : "hover:border-neutral-300",
                                                        isRemoving ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
                                                    )}
                                                >
                                                    {/* Product Thumbnail */}
                                                    <div className="relative w-20 h-20 sm:w-22 sm:h-22 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-neutral-200/60">
                                                        <Image
                                                            src={item.product.images?.[0] || item.product.image_url || '/placeholder.png'}
                                                            alt={item.product.name}
                                                            fill
                                                            sizes="88px"
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    </div>

                                                    {/* Details Column */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                        {/* Top Line: Category & Delete */}
                                                        <div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 truncate">
                                                                    {item.product.category || "INDUMENTARIA"}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleRemove(item.product.id, item.size)}
                                                                    className="text-neutral-400 hover:text-red-500 p-0.5 transition-colors shrink-0"
                                                                    title="Eliminar producto"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            {/* Product Title */}
                                                            <h3 className="font-bold text-sm text-neutral-900 leading-snug line-clamp-1 mt-0.5">
                                                                {item.product.name}
                                                            </h3>

                                                            {/* Attribute Tags */}
                                                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                                {/* Size / Variant badge or dropdown */}
                                                                {(() => {
                                                                    const availableSizes = item.product.product_stock && item.product.product_stock.length > 0
                                                                        ? item.product.product_stock.filter(s => s.stock_quantity > 0).map(s => s.size)
                                                                        : (["S", "M", "L", "XL", "XXL"].includes(item.size) ? ["S", "M", "L", "XL", "XXL"] : [item.size]);
                                                                    
                                                                    if (availableSizes.length > 1) {
                                                                        return (
                                                                            <div className="flex items-center gap-1">
                                                                                <select
                                                                                    value={item.size}
                                                                                    onChange={(e) => updateSize(item.product.id, item.size, e.target.value)}
                                                                                    className="text-[10px] bg-neutral-100 border border-neutral-200/80 rounded px-1.5 py-0.5 text-neutral-800 font-bold focus:outline-none focus:border-neutral-400 cursor-pointer"
                                                                                >
                                                                                    {availableSizes.map(size => (
                                                                                        <option key={size} value={size}>{size}</option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <span className="text-[10px] font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                                                                            {item.size && item.size !== 'Único' && item.size !== 'Standard' ? item.size : 'Standard'}
                                                                        </span>
                                                                    );
                                                                })()}

                                                                {/* Customization label tag */}
                                                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                                                    Personalizado
                                                                </span>

                                                                {item.isOutOfStock && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-600 border border-red-200">
                                                                        Agotado
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {item.warning && (
                                                                <p className="text-[10px] text-amber-600 mt-1 font-medium leading-tight">{item.warning}</p>
                                                            )}
                                                        </div>

                                                        {/* Bottom Line: Quantity Selector Pill & Total Price */}
                                                        <div className="flex items-center justify-between mt-2 pt-1">
                                                            {/* Quantity selector: - 1 + */}
                                                            <div className="flex items-center border border-neutral-200/90 rounded-full bg-neutral-50 px-1 py-0.5">
                                                                <button
                                                                    onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                                                                    className="w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-200/60 transition-colors"
                                                                    title="Restar uno"
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <span className="px-2 text-xs font-black text-neutral-900 tabular-nums">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                                                                    disabled={item.isOutOfStock || (item.availableStock !== undefined && item.quantity >= item.availableStock)}
                                                                    className="w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-200/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    title="Sumar uno"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>

                                                            {/* Price Display */}
                                                            <div className="text-right">
                                                                <span className={cn(
                                                                    "font-black text-base text-neutral-900 block leading-tight",
                                                                    item.isOutOfStock && "text-neutral-400 line-through"
                                                                )}>
                                                                    $${(item.product.price * item.quantity).toLocaleString("es-AR")}
                                                                </span>
                                                                {item.quantity > 1 && (
                                                                    <span className="text-[10px] text-neutral-400 font-medium block">
                                                                        $${item.product.price.toLocaleString("es-AR")} c/u
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Utility Links Row: Vaciar bolsa & Guardar selección */}
                                    <div className="flex items-center justify-between px-1 py-1 text-xs text-neutral-500 font-medium">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm("¿Estás seguro de que querés vaciar tu bolsa?")) {
                                                    clearCart();
                                                }
                                            }}
                                            className="flex items-center gap-1.5 hover:text-red-600 transition-colors cursor-pointer"
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                            <span>Vaciar bolsa</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (typeof window !== "undefined") {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    toast.success("Enlace de tu carrito copiado al portapapeles");
                                                }
                                            }}
                                            className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors cursor-pointer"
                                        >
                                            <Bookmark className="w-3.5 h-3.5" />
                                            <span>Guardar selección</span>
                                        </button>
                                    </div>

                                    {/* Cross-Sell Upsell Card: "Sumá 1 y subí de Nivel" */}
                                    <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900">
                                                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                                                <span>
                                                    {itemsNeeded > 0 ? `Sumá ${itemsNeeded === 1 ? '1' : itemsNeeded} y subí de Nivel` : "¡Alcanzaste el Nivel Máximo!"}
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-700">
                                                {itemsNeeded > 0 ? `¡Falta ${itemsNeeded}u!` : "¡10% OFF Activo!"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            {QUICK_ADD_SUGGESTIONS.map((sug) => (
                                                <div 
                                                    key={sug.id} 
                                                    className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 flex flex-col justify-between gap-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 border border-neutral-200/60">
                                                            <Image
                                                                src={sug.image_url || "/placeholder.png"}
                                                                alt={sug.name}
                                                                fill
                                                                sizes="36px"
                                                                unoptimized
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="text-xs font-bold text-neutral-900 truncate">
                                                                {sug.name}
                                                            </h4>
                                                            <span className="text-xs font-black text-emerald-700">
                                                                $${sug.price.toLocaleString("es-AR")}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddQuickSuggestion(sug)}
                                                        className="w-full py-1.5 rounded-lg bg-neutral-200/70 hover:bg-neutral-300 text-neutral-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                                                    >
                                                        <span>+ Sumar</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer Summary & Checkout Button */}
                        {items.length > 0 && (
                            <div className="shrink-0 p-4 sm:p-5 border-t border-neutral-200/80 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.05)] space-y-3">
                                {/* Totals calculation */}
                                <div className="space-y-1.5 text-xs text-neutral-500 font-medium">
                                    <div className="flex justify-between">
                                        <span>Subtotal ({totalItems} {totalItems === 1 ? 'prenda' : 'prendas'})</span>
                                        <span className="font-bold text-neutral-800 text-sm">$${totalPrice.toLocaleString("es-AR")}</span>
                                    </div>

                                    {/* Active reward perk GRATIS line */}
                                    {highestUnlocked && (
                                        <div className="flex justify-between items-center text-emerald-800 font-bold">
                                            <span className="flex items-center gap-1.5">
                                                <Gift className="w-3.5 h-3.5 text-emerald-700" />
                                                <span>{highestUnlocked.title}</span>
                                            </span>
                                            <span className="text-emerald-700 font-black tracking-wider text-[11px] uppercase">
                                                GRATIS
                                            </span>
                                        </div>
                                    )}

                                    {/* Total estimado */}
                                    <div className="flex justify-between items-baseline pt-2 border-t border-neutral-200/60">
                                        <span className="text-base font-black text-neutral-900">Total estimado</span>
                                        <span className="text-2xl font-black text-neutral-900">$${totalPrice.toLocaleString("es-AR")}</span>
                                    </div>
                                </div>

                                {/* 10% OFF Transferencia Pill */}
                                <div className="bg-neutral-100/90 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-neutral-800">
                                    <Landmark className="w-4 h-4 text-emerald-700 shrink-0" />
                                    <span>
                                        <strong className="font-extrabold text-emerald-800">10% OFF Transferencia:</strong> pagás <strong className="font-black text-neutral-900">$${Math.round(totalPrice * 0.90).toLocaleString("es-AR")}</strong>.
                                    </span>
                                </div>

                                {items.some(i => i.isOutOfStock) && (
                                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <span>Hay artículos agotados en tu carrito. Por favor elimínalos para continuar.</span>
                                    </div>
                                )}

                                {/* CTA Buttons */}
                                <div className="flex flex-col gap-2 pt-0.5">
                                    <button
                                        type="button"
                                        onClick={handleOrderCartViaWhatsApp}
                                        className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-xl font-black uppercase tracking-wider text-xs flex justify-center items-center gap-2 transition-all shadow-md active:scale-98"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>PEDIR TODA LA BOLSA POR WHATSAPP</span>
                                    </button>

                                    <button
                                        onClick={handleGoToForm}
                                        disabled={items.some(i => i.isOutOfStock) || isValidating}
                                        className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold uppercase tracking-wider text-xs flex justify-center items-center gap-2 transition-all border border-neutral-200/80 shadow-xs active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isValidating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-neutral-700" />
                                                <span>Validando stock...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4 text-neutral-700" />
                                                <span>{items.some(i => i.isOutOfStock) ? "Eliminá productos agotados" : "PAGAR POR TRANSFERENCIA"}</span>
                                                <ChevronRight className="w-4 h-4 ml-auto text-neutral-400" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* 3 Trust Badges at the bottom */}
                                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                                        <span>100% segura</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Truck className="w-3.5 h-3.5 text-emerald-700" />
                                        <span>A todo el país</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Headphones className="w-3.5 h-3.5 text-emerald-700" />
                                        <span>Atención 1 a 1</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Step 2: Customer & Delivery Details Form */}
                {currentStep === 'form' && (
                    <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col justify-between overflow-hidden min-h-0 bg-white">
                        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 custom-scrollbar bg-[#fbfaf8]">
                            <div className="bg-white border border-neutral-200/80 rounded-xl p-3 flex justify-between items-center text-xs shadow-xs">
                                <span className="text-neutral-500">Resumen de tu pedido:</span>
                                <span className="font-bold text-emerald-800">$${totalPrice.toLocaleString("es-AR")} ({totalItems} artículos)</span>
                            </div>

                            {/* Nombre */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                                    Nombre y Apellido *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="Ej: Juan Pérez"
                                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-xs"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                                    Email de Contacto *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    placeholder="tu-email@gmail.com"
                                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-xs"
                                />
                                <p className="text-[10px] text-neutral-500">Allí recibirás el comprobante y seguimiento de tu compra.</p>
                            </div>

                            {/* Teléfono */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                                    Teléfono / WhatsApp *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleFormChange}
                                    placeholder="Ej: 11 2345-6789"
                                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-xs"
                                />
                            </div>

                            {/* Método de Entrega */}
                            <div className="space-y-1.5 pt-1">
                                <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                                    Método de Entrega *
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'shipping' }))}
                                        className={cn(
                                            "p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all shadow-xs",
                                            formData.deliveryMethod === 'shipping'
                                                ? "border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold"
                                                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5 font-bold text-xs">
                                            <Truck className="w-3.5 h-3.5 text-emerald-700" />
                                            <span>Envío a Domicilio</span>
                                        </div>
                                        <span className="text-[10px] text-neutral-500">A coordinar por WhatsApp</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'pickup' }))}
                                        className={cn(
                                            "p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all shadow-xs",
                                            formData.deliveryMethod === 'pickup'
                                                ? "border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold"
                                                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5 font-bold text-xs">
                                            <Store className="w-3.5 h-3.5 text-emerald-700" />
                                            <span>Retiro en Local</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-700 font-bold">Gratis</span>
                                    </button>
                                </div>
                            </div>

                            {/* Dirección de Envío si aplica */}
                            {formData.deliveryMethod === 'shipping' && (
                                <div className="space-y-1 animate-in fade-in duration-200">
                                    <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                                        Dirección de Entrega Completa *
                                    </label>
                                    <input
                                        type="text"
                                        name="shippingAddress"
                                        required
                                        value={formData.shippingAddress}
                                        onChange={handleFormChange}
                                        placeholder="Calle, Número, Depto, Ciudad, CP"
                                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-xs"
                                    />
                                </div>
                            )}

                            {/* Notas Adicionales */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                                    Notas o Instrucciones (Opcional)
                                </label>
                                <input
                                    type="text"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleFormChange}
                                    placeholder="Ej: Timbre B, dejar en portería"
                                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="shrink-0 p-4 sm:p-5 border-t border-neutral-200/80 bg-white space-y-2">
                            <button
                                type="submit"
                                disabled={isCheckingOut}
                                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex justify-center items-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-60"
                            >
                                {isCheckingOut ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <span>Confirmar y Ver Datos de Pago</span>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-neutral-500">
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
