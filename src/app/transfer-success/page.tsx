"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/features/orders/store/cart';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Copy, MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import styles from '@/app/success/TransactionAnimation.module.css';

function TransferSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { clearCart } = useCartStore();
    const [copied, setCopied] = useState<'cbu' | 'alias' | 'total' | null>(null);
    const [storeInfo, setStoreInfo] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'store_info')
                .single();
            if (data?.value) setStoreInfo(data.value);
        };
        fetchSettings();
    }, []);

    // Fallback bank details if not stored yet
    const bankDetails = {
        bankName: storeInfo?.bankName || "Naranja X",
        accountHolder: storeInfo?.accountHolder || "Paula Alvarenga",
        cbu: storeInfo?.cbu || "4530000800010655590139",
        alias: storeInfo?.alias || "PFSTUDIO.VENTAS",
        cuit: storeInfo?.cuit || "27-44685115-8"
    };

    const whatsappNumber = storeInfo?.whatsapp || "5493704724837";

    useEffect(() => {
        // Clear the cart when they land on the success page
        clearCart();
    }, [clearCart]);

    const handleCopy = (text: string, type: 'cbu' | 'alias' | 'total') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        toast.success("Copiado al portapapeles");
        setTimeout(() => setCopied(null), 2000);
    };

    if (!orderId) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <p className="text-xl font-medium mb-4">No se encontró el número de orden.</p>
                <Link href="/" className="text-main hover:underline flex items-center gap-2">
                    Volver al inicio <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    const whatsappMessage = encodeURIComponent(`Hola! Acabo de realizar una compra en la web. Mi número de orden es: ${orderId.split('-')[0].toUpperCase()}. Te adjunto el comprobante de transferencia.`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center bg-background text-on-background">
            <div className="max-w-xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header Success Section */}
                <div className="text-center space-y-4">
                    {/* Clean Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-primary-container/30 border border-primary/20 rounded-full flex items-center justify-center animate-pulse">
                            <CheckCircle className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface">
                        ¡Tu pedido fue registrado!
                    </h1>
                    <p className="text-on-surface-variant text-lg">
                        Para recibir tus productos, recordá que debés abonar mediante transferencia bancaria.
                    </p>
                </div>

                {/* Order ID Banner */}
                <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div>
                        <p className="text-sm font-medium text-on-surface-variant mb-1">
                            Número de Orden
                        </p>
                        <p className="text-2xl font-mono font-bold text-on-surface">
                            #{orderId.split('-')[0].toUpperCase()}
                        </p>
                    </div>
                    <div className="text-primary font-bold bg-primary-container/30 px-4 py-2 rounded-full border border-primary/20 shadow-sm text-sm uppercase tracking-widest">
                        Pendiente de Pago
                    </div>
                </div>

                {/* Bank Details Card */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-(--foreground)">
                        Datos para la Transferencia
                    </h2>

                    <div className="space-y-6">
                        {/* Info Rows */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Banco</p>
                                <p className="font-medium">{bankDetails.bankName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Titular</p>
                                <p className="font-medium">{bankDetails.accountHolder}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">CUIT</p>
                                <p className="font-medium">{bankDetails.cuit}</p>
                            </div>
                        </div>

                        <div className="h-px w-full bg-outline-variant my-4" />

                        {/* Copyable Rows */}
                        <div className="space-y-4">
                            {/* CBU */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface-container border border-surface-container">
                                <div>
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">CBU</p>
                                    <p className="font-mono font-bold text-lg text-on-surface">{bankDetails.cbu}</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(bankDetails.cbu, 'cbu')}
                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors w-full sm:w-auto text-on-surface shadow-sm"
                                >
                                    {copied === 'cbu' ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
                                    {copied === 'cbu' ? 'Copiado' : 'Copiar'}
                                </button>
                            </div>

                            {/* Alias */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface-container border border-surface-container">
                                <div>
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Alias</p>
                                    <p className="font-mono font-bold text-lg text-on-surface">{bankDetails.alias}</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(bankDetails.alias, 'alias')}
                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors w-full sm:w-auto text-on-surface shadow-sm"
                                >
                                    {copied === 'alias' ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
                                    {copied === 'alias' ? 'Copiado' : 'Copiar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions & Actions */}
                <div className="space-y-6">
                    <div className="bg-primary-container/20 border border-primary/20 rounded-2xl p-6">
                        <h3 className="font-bold text-primary mb-2">Importante</h3>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                            Una vez que realices la transferencia, envianos el <strong>comprobante</strong> indicando tu <strong>número de orden</strong> a nuestro WhatsApp para que podamos procesar tu pedido y preparar el envío.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-lg shadow-[#25D366]/20"
                        >
                            <MessageCircle className="w-5 h-5 fill-current" />
                            Enviar Comprobante
                        </Link>

                        <Link
                            href="/"
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-surface-container transition-colors shadow-sm"
                        >
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

import ProcessingOverlay from '@/components/ProcessingOverlay';

export default function TransferSuccessPage() {
    return (
        <Suspense fallback={
            <ProcessingOverlay
                isOpen={true}
                type="transfer"
                title="Cargando tu orden..."
                subtitle="Obteniendo la información bancaria e instrucciones de pago."
            />
        }>
            <TransferSuccessContent />
        </Suspense>
    );
}
