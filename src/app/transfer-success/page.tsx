"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Copy, MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sileo } from 'sileo';

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
        bankName: storeInfo?.bankName || "Banco Galicia",
        accountHolder: storeInfo?.accountHolder || "PF Studio SA",
        cbu: storeInfo?.cbu || "1234567890123456789012",
        alias: storeInfo?.alias || "PFSTUDIO.VENTAS",
        cuit: storeInfo?.cuit || "30-12345678-9"
    };

    const whatsappNumber = storeInfo?.whatsapp || "5491100000000";

    useEffect(() => {
        // Clear the cart when they land on the success page
        clearCart();
    }, [clearCart]);

    const handleCopy = (text: string, type: 'cbu' | 'alias' | 'total') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        sileo.success({ title: "Copiado al portapapeles" });
        setTimeout(() => setCopied(null), 2000);
    };

    if (!orderId) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <p className="text-xl font-medium mb-4">No se encontró el número de orden.</p>
                <Link href="/" className="text-[var(--color-main)] hover:underline flex items-center gap-2">
                    Volver al inicio <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    const whatsappMessage = encodeURIComponent(`Hola! Acabo de realizar una compra en la web. Mi número de orden es: ${orderId.split('-')[0].toUpperCase()}. Te adjunto el comprobante de transferencia.`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="max-w-xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header Success Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100/50 dark:bg-green-900/20 text-green-600 dark:text-green-500 mb-2">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--foreground)]">
                        ¡Tu pedido fue registrado!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Para recibir tus productos, recordá que debés abonar mediante transferencia bancaria.
                    </p>
                </div>

                {/* Order ID Banner */}
                <div className="bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Número de Orden
                        </p>
                        <p className="text-2xl font-mono font-bold text-[var(--foreground)]">
                            #{orderId.split('-')[0].toUpperCase()}
                        </p>
                    </div>
                    <div className="text-[var(--color-main)] font-medium bg-[var(--color-main)]/10 px-4 py-2 rounded-full">
                        Pendiente de Pago
                    </div>
                </div>

                {/* Bank Details Card */}
                <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--foreground)]">
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

                        <div className="h-px w-full bg-gray-100 dark:bg-zinc-800 my-4" />

                        {/* Copyable Rows */}
                        <div className="space-y-4">
                            {/* CBU */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">CBU</p>
                                    <p className="font-mono font-bold text-lg">{bankDetails.cbu}</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(bankDetails.cbu, 'cbu')}
                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto"
                                >
                                    {copied === 'cbu' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                    {copied === 'cbu' ? 'Copiado' : 'Copiar'}
                                </button>
                            </div>

                            {/* Alias */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Alias</p>
                                    <p className="font-mono font-bold text-lg">{bankDetails.alias}</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(bankDetails.alias, 'alias')}
                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto"
                                >
                                    {copied === 'alias' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                    {copied === 'alias' ? 'Copiado' : 'Copiar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions & Actions */}
                <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6">
                        <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2">Importante</h3>
                        <p className="text-blue-800/80 dark:text-blue-300/80 text-sm leading-relaxed">
                            Una vez que realices la transferencia, envianos el <strong>comprobante</strong> indicando tu <strong>número de orden</strong> a nuestro WhatsApp para que podamos procesar tu pedido y preparar el envío.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20BE5A] transition-colors shadow-lg shadow-[#25D366]/20"
                        >
                            <MessageCircle className="w-5 h-5 fill-current" />
                            Enviar Comprobante
                        </Link>

                        <Link
                            href="/"
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white dark:bg-zinc-900 text-[var(--foreground)] border border-gray-200 dark:border-zinc-800 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TransferSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" />
            </div>
        }>
            <TransferSuccessContent />
        </Suspense>
    );
}
