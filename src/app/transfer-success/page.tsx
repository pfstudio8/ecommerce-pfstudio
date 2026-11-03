"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/features/orders/store/cart';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Copy, MessageCircle, ArrowRight, Landmark, CreditCard, Hash, DollarSign, User, ShieldCheck } from 'lucide-react';
import { toast } from "sonner";
import ProcessingOverlay from '@/components/ProcessingOverlay';

function TransferSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const amountParam = searchParams.get('amount');
    const parsedAmount = amountParam ? Number(amountParam) : 0;
    const { clearCart } = useCartStore();
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [storeInfo, setStoreInfo] = useState<any>(null);
    const [bankInfo, setBankInfo] = useState<any>(null);
    const [orderData, setOrderData] = useState<{ total_amount: number; status: string; customer_email: string } | null>(null);

    useEffect(() => {
        const fetchSettingsAndOrder = async () => {
            // 1. Cargar configuraciones de tienda y banco
            const { data: settingsData } = await supabase
                .from('settings')
                .select('key, value')
                .in('key', ['store_info', 'bank_info']);
            
            if (settingsData) {
                const store = settingsData.find(item => item.key === 'store_info')?.value;
                const bank = settingsData.find(item => item.key === 'bank_info')?.value;
                if (store) setStoreInfo(store);
                if (bank) setBankInfo(bank);
            }

            // 2. Cargar datos del pedido
            if (orderId) {
                const { data: order } = await supabase
                    .from('orders')
                    .select('total_amount, status, customer_email')
                    .eq('id', orderId)
                    .single();

                if (order) setOrderData(order);
            }
        };

        fetchSettingsAndOrder();
    }, [orderId]);

    // Vaciar el carrito al llegar a la página de éxito
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    const bankDetails = {
        bankName: bankInfo?.bank || bankInfo?.bankName || storeInfo?.bankName || "Naranja X",
        accountHolder: bankInfo?.holder || bankInfo?.accountHolder || storeInfo?.accountHolder || "Paula Alvarenga",
        cbu: bankInfo?.cbu || storeInfo?.cbu || "4530000800010655590139",
        alias: bankInfo?.alias || storeInfo?.alias || "PFSTUDIO.VENTAS",
        cuit: bankInfo?.cuit || storeInfo?.cuit || "27-44685115-8"
    };

    const whatsappNumber = storeInfo?.whatsapp || "5493704245651";
    const orderReference = orderId ? orderId.split('-')[0].toUpperCase() : "";
    const totalAmount = orderData?.total_amount || parsedAmount || 0;

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        toast.success(`"${text}" copiado al portapapeles`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (!orderId) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <p className="text-xl font-medium mb-4">No se encontró el número de pedido.</p>
                <Link href="/" className="text-primary hover:underline flex items-center gap-2">
                    Volver al inicio <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    const whatsappMessage = encodeURIComponent(
        `¡Hola PF STUDIO! Realicé el pedido #${orderReference} por un total de $${totalAmount.toLocaleString('es-AR')}. Te adjunto el comprobante de la transferencia para confirmar el pago.`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 flex flex-col items-center bg-background text-on-surface">
            <div className="max-w-xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                
                {/* Header Success Section */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary-container border border-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                            <CheckCircle className="w-8 h-8 text-on-primary-container" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface font-sans">
                        ¡Pedido #{orderReference} Registrado!
                    </h1>
                    <p className="text-on-surface-variant text-sm sm:text-base max-w-md mx-auto">
                        Para comenzar a preparar tu pedido, transferí el monto exacto a la siguiente cuenta bancaria.
                    </p>
                </div>

                {/* Card de Datos Bancarios y Pago */}
                <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                    
                    {/* Monto Exacto y Referencia Destacados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-outline-variant">
                        <div className="bg-surface p-4 rounded-2xl border border-outline-variant flex flex-col justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-outline">Monto Exacto a Transferir</span>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-2xl font-black text-primary font-sans">
                                    ${totalAmount.toLocaleString("es-AR")}
                                </span>
                                <button
                                    onClick={() => handleCopy(totalAmount.toString(), 'amount')}
                                    className="p-2 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
                                    title="Copiar monto"
                                >
                                    {copiedField === 'amount' ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-surface p-4 rounded-2xl border border-outline-variant flex flex-col justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-outline">Referencia / N° de Pedido</span>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xl font-black font-mono text-on-surface">
                                    #{orderReference}
                                </span>
                                <button
                                    onClick={() => handleCopy(orderReference, 'reference')}
                                    className="p-2 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
                                    title="Copiar referencia"
                                >
                                    {copiedField === 'reference' ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Datos de la Cuenta */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-outline flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-primary" />
                            Datos para la Transferencia
                        </h2>

                        {/* Banco y Titular */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="p-3.5 bg-surface rounded-xl border border-outline-variant flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Banco / App</p>
                                    <p className="font-bold text-on-surface mt-0.5">{bankDetails.bankName}</p>
                                </div>
                            </div>

                            <div className="p-3.5 bg-surface rounded-xl border border-outline-variant flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Titular</p>
                                    <p className="font-bold text-on-surface mt-0.5">{bankDetails.accountHolder}</p>
                                </div>
                            </div>
                        </div>

                        {/* Alias con botón Copiar */}
                        <div className="p-4 bg-surface rounded-2xl border border-outline-variant flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Alias de Transferencia</p>
                                <p className="font-mono font-black text-lg text-primary mt-0.5">{bankDetails.alias}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(bankDetails.alias, 'alias')}
                                className="flex items-center gap-1.5 px-4 py-2 bg-primary-container text-on-primary-container border border-primary rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-all shadow-sm"
                            >
                                {copiedField === 'alias' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedField === 'alias' ? 'Copiado' : 'Copiar Alias'}
                            </button>
                        </div>

                        {/* CBU con botón Copiar */}
                        <div className="p-4 bg-surface rounded-2xl border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">CBU / CVU</p>
                                <p className="font-mono font-bold text-sm text-on-surface mt-0.5 truncate">{bankDetails.cbu}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(bankDetails.cbu, 'cbu')}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-surface-container-high transition-colors shrink-0"
                            >
                                {copiedField === 'cbu' ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedField === 'cbu' ? 'Copiado' : 'Copiar CBU'}
                            </button>
                        </div>

                        {/* CUIT */}
                        {bankDetails.cuit && (
                            <p className="text-[11px] text-outline text-right">
                                CUIT: <span className="font-mono font-semibold">{bankDetails.cuit}</span>
                            </p>
                        )}
                    </div>

                    {/* Botón de Enviar Comprobante por WhatsApp */}
                    <div className="pt-2">
                        <Link
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#25D366]/20 active:scale-[1.01]"
                        >
                            <MessageCircle className="w-5 h-5 fill-current" />
                            Enviar Comprobante por WhatsApp
                        </Link>
                        <p className="text-[11px] text-center text-outline mt-2.5">
                            Tu pedido cambiará a <strong>Pagado</strong> tan pronto como nuestro equipo confirme la acreditación.
                        </p>
                    </div>
                </div>

                {/* Back to Home / Orders */}
                <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-wider">
                    <Link href="/profile" className="text-on-surface-variant hover:text-primary transition-colors py-2">
                        Ver Mis Pedidos
                    </Link>
                    <span className="text-outline py-2">•</span>
                    <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors py-2">
                        Seguir Comprando
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function TransferSuccessPage() {
    return (
        <Suspense fallback={
            <ProcessingOverlay
                isOpen={true}
                type="transfer"
                title="Cargando tu pedido..."
                subtitle="Obteniendo la información bancaria e instrucciones de pago."
            />
        }>
            <TransferSuccessContent />
        </Suspense>
    );
}
