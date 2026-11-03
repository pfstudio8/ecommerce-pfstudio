"use client";

import { useCartStore } from "@/features/orders/store/cart";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
    ShoppingCart, 
    ArrowLeft, 
    ShieldCheck, 
    Truck, 
    RotateCcw, 
    X, 
    MessageCircle, 
    Minus, 
    Plus, 
    AlertTriangle, 
    CheckCircle2, 
    Share2 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductClientProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
    const addToCart = useCartStore((state) => state.addItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const setCartOpen = useCartStore((state) => state.setCartOpen);
    
    // Dynamic variants from database
    const variants = (product.product_stock && product.product_stock.length > 0)
        ? product.product_stock
        : [{ id: `fallback-${product.id}`, size: "Único", stock_quantity: product.stock ?? 0 }];

    // Initial selected size (first with stock, or first available)
    const firstInStock = variants.find(v => (v.stock_quantity ?? 0) > 0)?.size || variants[0]?.size || null;
    const [selectedSize, setSelectedSize] = useState<string | null>(variants.length === 1 ? variants[0].size : firstInStock);
    const [quantity, setQuantity] = useState<number>(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [whatsapp, setWhatsapp] = useState("5493704245651");

    // Stock for currently selected size
    const currentVariant = variants.find(v => v.size === selectedSize);
    const currentVariantStock = currentVariant ? (currentVariant.stock_quantity ?? 0) : (product.stock ?? 0);
    const isCurrentOutOfStock = currentVariantStock <= 0;
    const isApparel = ["Oversize", "Boxy Fit", "Clásicas", "Buzos", "Camisetas", "Pantalones", "Shorts"].some(c => 
        (product.category || "").toLowerCase().includes(c.toLowerCase())
    );

    // Adjust quantity when changing size
    useEffect(() => {
        if (currentVariantStock > 0 && quantity > currentVariantStock) {
            setQuantity(currentVariantStock);
        } else if (quantity < 1 && currentVariantStock > 0) {
            setQuantity(1);
        }
    }, [selectedSize, currentVariantStock]);

    // Fetch store WhatsApp
    useEffect(() => {
        const fetchNumber = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'store_info')
                    .single();
                
                if (data?.value?.whatsapp) {
                    setWhatsapp(data.value.whatsapp);
                }
            } catch (err) {
                // Ignore fallback
            }
        };
        fetchNumber();
    }, []);

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error("Por favor selecciona una variante o talle.");
            return;
        }

        if (isCurrentOutOfStock) {
            toast.error(`La variante "${selectedSize}" no tiene stock disponible.`);
            return;
        }

        // Add to cart with desired quantity
        addToCart(product, selectedSize);
        if (quantity > 1) {
            updateQuantity(product.id, selectedSize, quantity);
        }
        setCartOpen(true);
    };

    const handleWhatsAppOrder = () => {
        if (!selectedSize) {
            toast.error("Por favor selecciona un talle para consultar por WhatsApp.");
            return;
        }
        const mensaje = encodeURIComponent(
            `Hola PFSTUDIO! Me interesa consultar por: ${product.name} (Talle/Variante: ${selectedSize}, Cantidad: ${quantity}).`
        );
        window.open(`https://wa.me/${whatsapp}?text=${mensaje}`, '_blank');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Mirá este producto en PFSTUDIO: ${product.name}`,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Enlace del producto copiado al portapapeles.");
        }
    };

    const images = product.images && product.images.length > 0 
        ? product.images 
        : (product.image_url ? [product.image_url] : ['/placeholder.png']);

    return (
        <div className="min-h-screen bg-background pt-28 pb-24 font-sans text-on-surface animate-in fade-in duration-300">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Breadcrumb / Back button */}
                <div className="flex items-center justify-between mb-8">
                    <Link 
                        href="/catalog" 
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-outline hover:text-on-surface transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Catálogo
                    </Link>
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-outline hover:text-primary transition-colors"
                        title="Compartir enlace"
                    >
                        <Share2 className="w-4 h-4" />
                        Compartir
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

                    {/* Left Column: Image Gallery */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div className="relative aspect-4/5 w-full bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant shadow-sm">
                            {product.isNew && (
                                <span className="absolute top-4 left-4 z-10 bg-primary-container text-on-primary-container text-xs font-black px-3 py-1 uppercase tracking-widest rounded-lg shadow-md border border-primary">
                                    Nuevo
                                </span>
                            )}
                            {currentVariantStock > 0 && currentVariantStock <= 3 && (
                                <span className="absolute top-4 right-4 z-10 bg-amber-500 text-black text-xs font-black px-3 py-1 uppercase tracking-widest rounded-lg shadow-md">
                                    ¡Últimas {currentVariantStock}!
                                </span>
                            )}
                            <Image
                                src={images[currentImageIndex] || '/placeholder.png'}
                                alt={product.name}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                                className="object-cover"
                            />
                        </div>

                        {/* Thumbnail Grid */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={cn(
                                            "relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-surface-container-low",
                                            currentImageIndex === idx 
                                                ? "border-primary ring-2 ring-primary/20 opacity-100" 
                                                : "border-outline-variant opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Image src={img} alt={`${product.name} thumb ${idx}`} fill sizes="20vw" className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Product Details & Purchase Form */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-between">
                        <div>
                            {/* Category & Department */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-surface-container px-2.5 py-0.5 rounded-full border border-outline-variant">
                                    {product.category || "General"}
                                </span>
                                {product.department && (
                                    <span className="text-xs font-medium text-outline">
                                        • {product.department}
                                    </span>
                                )}
                            </div>

                            {/* Product Name */}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-on-surface leading-tight font-sans">
                                {product.name}
                            </h1>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-outline-variant">
                                <span className="text-3xl sm:text-4xl font-black text-primary">
                                    ${product.price.toLocaleString("es-AR")}
                                </span>
                                <span className="text-xs font-semibold text-outline uppercase tracking-wider">
                                    ARS / Transferencia
                                </span>
                            </div>

                            {/* Description from Database */}
                            <div className="text-on-surface-variant text-sm sm:text-base leading-relaxed mb-8">
                                <p className="whitespace-pre-line">
                                    {product.description || "Insumo de confección premium y estampado de alta resistencia al lavado. Diseñado para garantizar máxima comodidad, caída estructurada y fidelidad de diseño."}
                                </p>
                            </div>

                            {/* Size / Variant Selector */}
                            <div className="mb-8 p-5 bg-surface-container-low rounded-2xl border border-outline-variant space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-widest text-outline">
                                        {variants.length > 1 ? "Seleccioná tu talle o medida:" : "Variante:"}
                                    </span>
                                    {isApparel && (
                                        <button
                                            onClick={() => setIsSizeGuideOpen(true)}
                                            className="text-xs text-primary underline font-bold hover:text-primary-dark transition-colors"
                                        >
                                            Guía de talles
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2.5">
                                    {variants.map((v) => {
                                        const isOutOfStock = (v.stock_quantity ?? 0) <= 0;
                                        const isSelected = selectedSize === v.size;

                                        return (
                                            <button
                                                key={v.size}
                                                disabled={isOutOfStock}
                                                onClick={() => setSelectedSize(v.size)}
                                                className={cn(
                                                    "min-w-12 h-11 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1",
                                                    isOutOfStock && "border-outline-variant/30 text-outline/40 line-through bg-surface cursor-not-allowed",
                                                    !isOutOfStock && isSelected && "border-primary bg-primary text-on-primary shadow-md shadow-primary/20",
                                                    !isOutOfStock && !isSelected && "border-outline-variant bg-surface text-on-surface hover:border-primary/50"
                                                )}
                                                title={isOutOfStock ? "Agotado" : `${v.stock_quantity} disponibles`}
                                            >
                                                <span>{v.size}</span>
                                                {!isOutOfStock && (
                                                    <span className="text-[10px] opacity-70 font-mono">({v.stock_quantity})</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Stock Helper status text */}
                                <div className="pt-2 flex items-center gap-2 text-xs font-medium">
                                    {isCurrentOutOfStock ? (
                                        <span className="text-red-400 font-bold flex items-center gap-1">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            Sin stock disponible en esta variante.
                                        </span>
                                    ) : currentVariantStock <= 3 ? (
                                        <span className="text-amber-400 font-bold flex items-center gap-1">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            ¡Quedan solo {currentVariantStock} unidades disponibles en talle {selectedSize}!
                                        </span>
                                    ) : (
                                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Stock disponible ({currentVariantStock} unidades en taller).
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            {!isCurrentOutOfStock && (
                                <div className="mb-8 flex items-center gap-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-outline">
                                        Cantidad:
                                    </span>
                                    <div className="flex items-center border border-outline-variant rounded-xl bg-surface-container-low overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                            className="p-2.5 hover:bg-surface-container transition-colors disabled:opacity-30"
                                        >
                                            <Minus className="w-4 h-4 text-on-surface" />
                                        </button>
                                        <span className="px-4 text-sm font-bold font-mono text-on-surface">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.min(currentVariantStock, quantity + 1))}
                                            disabled={quantity >= currentVariantStock}
                                            className="p-2.5 hover:bg-surface-container transition-colors disabled:opacity-30"
                                        >
                                            <Plus className="w-4 h-4 text-on-surface" />
                                        </button>
                                    </div>
                                    <span className="text-xs text-outline font-medium">
                                        Subtotal: <strong className="text-on-surface">${(product.price * quantity).toLocaleString("es-AR")}</strong>
                                    </span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 mb-8">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedSize || isCurrentOutOfStock}
                                    className="w-full py-4 sm:py-4.5 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[1.01] uppercase tracking-widest text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {isCurrentOutOfStock ? "Variante Agotada" : "Agregar a la Bolsa"}
                                </button>

                                <button
                                    onClick={handleWhatsAppOrder}
                                    className="w-full py-3.5 border border-[#25D366]/40 text-[#25D366] bg-[#25D366]/5 rounded-xl font-bold flex items-center justify-center gap-2.5 hover:bg-[#25D366] hover:text-white transition-all uppercase tracking-widest text-xs"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Consultar por WhatsApp
                                </button>
                            </div>

                            {/* Guarantees */}
                            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-outline-variant text-xs text-outline">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                                    <span>Compra protegida y directa</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-primary shrink-0" />
                                    <span>Envíos o retiro en taller</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 pt-12 border-t border-outline-variant">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-secondary">También te puede interesar</span>
                                <h3 className="text-2xl font-black text-on-surface mt-1">Productos Relacionados</h3>
                            </div>
                            <Link href={`/catalog?cat=${encodeURIComponent(product.category || '')}`} className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">
                                Ver más de {product.category}
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(rp => (
                                <Link
                                    href={`/product/${rp.id}`}
                                    key={rp.id}
                                    className="group flex flex-col bg-surface-container-low border border-outline-variant p-3.5 rounded-2xl hover:border-primary transition-all duration-200"
                                >
                                    <div className="relative w-full aspect-4/5 overflow-hidden bg-surface-container rounded-xl mb-3">
                                        <Image 
                                            src={rp.images?.length ? rp.images[0] : (rp.image_url || '/placeholder.png')} 
                                            alt={rp.name} 
                                            fill 
                                            sizes="(max-width: 1024px) 50vw, 25vw" 
                                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">{rp.category}</span>
                                    <h4 className="font-bold text-sm text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-1">{rp.name}</h4>
                                    <span className="text-sm font-black text-primary">${rp.price.toLocaleString("es-AR")}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sizing Guide Modal */}
            <AnimatePresence>
                {isSizeGuideOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSizeGuideOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative z-10 text-left overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
                                <h3 className="text-lg font-black uppercase tracking-wider text-on-surface">
                                    Guía de Talles y Medidas
                                </h3>
                                <button
                                    onClick={() => setIsSizeGuideOpen(false)}
                                    className="p-1.5 hover:bg-surface-container rounded-full transition-colors text-outline hover:text-on-surface"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* size chart table */}
                            <div className="space-y-6">
                                <div className="bg-surface p-4 rounded-xl border border-outline-variant">
                                    <h4 className="font-bold text-xs text-primary mb-1 uppercase tracking-widest">
                                        Remeras Oversize & Regular
                                    </h4>
                                    <p className="text-xs text-outline mb-3">Medidas en centímetros tomadas de plano sobre superficie.</p>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-outline-variant text-[10px] text-outline uppercase tracking-wider font-bold">
                                                <th className="py-2 text-left">Talle</th>
                                                <th className="py-2 text-center">Ancho Pecho</th>
                                                <th className="py-2 text-center">Largo Total</th>
                                                <th className="py-2 text-center">Manga</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant font-medium text-on-surface">
                                            <tr>
                                                <td className="py-2 font-bold text-primary">S</td>
                                                <td className="py-2 text-center">56 cm</td>
                                                <td className="py-2 text-center">72 cm</td>
                                                <td className="py-2 text-center">23 cm</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 font-bold text-primary">M</td>
                                                <td className="py-2 text-center">58 cm</td>
                                                <td className="py-2 text-center">74 cm</td>
                                                <td className="py-2 text-center">24 cm</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 font-bold text-primary">L</td>
                                                <td className="py-2 text-center">60 cm</td>
                                                <td className="py-2 text-center">76 cm</td>
                                                <td className="py-2 text-center">25 cm</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 font-bold text-primary">XL</td>
                                                <td className="py-2 text-center">62 cm</td>
                                                <td className="py-2 text-center">78 cm</td>
                                                <td className="py-2 text-center">26 cm</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 font-bold text-primary">XXL</td>
                                                <td className="py-2 text-center">64 cm</td>
                                                <td className="py-2 text-center">80 cm</td>
                                                <td className="py-2 text-center">27 cm</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="text-xs text-outline leading-relaxed border-t border-outline-variant pt-4 space-y-1">
                                    <p className="font-bold text-on-surface uppercase tracking-wider text-[11px]">¿Cómo medir tu prenda?</p>
                                    <p>📐 <strong>Ancho:</strong> Medí de sisa a sisa sobre una prenda que te quede cómoda.</p>
                                    <p>📏 <strong>Largo:</strong> Medí desde el cuello al dobladillo inferior.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
