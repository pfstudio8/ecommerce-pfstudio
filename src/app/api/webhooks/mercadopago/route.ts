import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendPurchaseSuccessEmail } from '@/lib/sendEmail';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Instanciar MercadoPago con el token del usuario
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const type = url.searchParams.get('type') || url.searchParams.get('topic');
        const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');

        // Verify Webhook Signature (Security)
        const xSignature = request.headers.get('x-signature');
        const xRequestId = request.headers.get('x-request-id');

        if (!xSignature || !xRequestId || !dataId) {
            return NextResponse.json({ error: 'Missing signature headers' }, { status: 403 });
        }

        const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
        if (!secret || secret === 'your_webhook_secret_here') {
            console.error('MERCADOPAGO_WEBHOOK_SECRET is not properly configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const parts = xSignature.split(',');
        let ts, v1;
        for (const part of parts) {
            const [key, value] = part.split('=');
            if (key === 'ts') ts = value;
            if (key === 'v1') v1 = value;
        }

        if (!ts || !v1) {
            return NextResponse.json({ error: 'Invalid signature format' }, { status: 403 });
        }

        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(manifest);
        const calculatedSignature = hmac.digest('hex');

        if (calculatedSignature !== v1) {
            console.error('Invalid MercadoPago webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Solo nos importan las actualizaciones de "payment" (pagos)
        if (type === 'payment' && dataId) {
            const payment = new Payment(client);

            // 1. Obtener la información completa del pago desde MP
            const paymentInfo = await payment.get({ id: dataId });

            const status = paymentInfo.status; // 'approved', 'rejected', 'pending', etc.

            let internalStatus = 'pending';
            if (status === 'approved') internalStatus = 'paid';
            else if (status === 'rejected' || status === 'cancelled') internalStatus = 'rejected';
            else if (status === 'refunded') internalStatus = 'refunded';
            else if (status === 'in_process' || status === 'in_mediation') internalStatus = 'pending';
            else internalStatus = status || 'pending';

            const supabase = createAdminClient();

            // Evitar duplicación del MISMO estado
            const { data: existingOrder } = await supabase
                .from('orders')
                .select('id, status')
                .eq('payment_id', String(paymentInfo.id))
                .maybeSingle();

            if (existingOrder && existingOrder.status === internalStatus) {
                console.log(`Order already processed for payment_id: ${paymentInfo.id} with status: ${internalStatus}`);
                return NextResponse.json({ received: true, note: "Order already processed with same status" });
            }

            const itemsToProcess = paymentInfo.metadata?.cart_items || [];
            const userEmail = paymentInfo.metadata?.user_email || paymentInfo.payer?.email || 'invitado@mercadopago.com';
            const billingDetails = paymentInfo.metadata?.billing_details || null;
            const internalOrderId = paymentInfo.metadata?.internal_order_id || null;

            let finalOrderId: string | null = null;

            if (internalOrderId) {
                // Flow for newly created pending orders (Phase 3 improvements)
                const { data: orderResult, error: orderError } = await supabase
                    .from('orders')
                    .update({
                        status: internalStatus,
                        payment_id: String(paymentInfo.id),
                        shipping_address: paymentInfo.payer?.address ? JSON.stringify(paymentInfo.payer.address) : null
                    })
                    .eq('id', internalOrderId)
                    .select('id')
                    .single();
                
                if (orderError) {
                    console.error(`Error updating order to ${internalStatus}:`, orderError);
                    return NextResponse.json({ received: true, note: "Order update failed" });
                }

                finalOrderId = orderResult.id;

                await supabase.from('order_history').insert({
                    order_id: finalOrderId,
                    status: internalStatus,
                    notes: `Webhook MP: Estado actualizado a ${internalStatus}`
                });
                
                // Note: We do NOT insert order_items here because they were inserted during checkout/route.ts
            } else {
                // Flow for backward compatibility (Orders created BEFORE this Phase 3 update)
                const { data: orderResult, error: orderError } = await supabase
                    .from('orders')
                    .insert([
                        {
                            customer_email: userEmail,
                            status: internalStatus,
                            total_amount: paymentInfo.transaction_amount,
                            payment_method: 'mercadopago',
                            payment_id: String(paymentInfo.id),
                            shipping_address: paymentInfo.payer?.address ? JSON.stringify(paymentInfo.payer.address) : null
                        }
                    ])
                    .select('id')
                    .single();

                if (orderError || !orderResult) {
                    console.error("Error guardando orden o orden duplicada:", orderError);
                    return NextResponse.json({ received: true, note: "Order insertion failed or duplicate" });
                }

                finalOrderId = orderResult.id;

                if (itemsToProcess.length > 0) {
                    const orderItemsToInsert = itemsToProcess.map((item: any) => ({
                        order_id: finalOrderId,
                        product_id: item.id || null,
                        size: item.size || 'N/A',
                        quantity: item.quantity || 1,
                        price_at_purchase: item.price || 0
                    }));
                    await supabase.from('order_items').insert(orderItemsToInsert);
                }

                await supabase.from('order_history').insert({
                    order_id: finalOrderId,
                    status: internalStatus,
                    notes: `Webhook MP: Estado actualizado a ${internalStatus} (Legacy Flow)`
                });
            }

            if (status === 'approved') {
                // 3.2 Enviar el correo electrónico
                if (userEmail && userEmail !== 'invitado@mercadopago.com') {
                    const itemsForEmail = itemsToProcess.map((item: any) => ({
                        name: item.name || `Prenda Talle ${item.size}`,
                        size: item.size,
                        quantity: item.quantity,
                        price: item.price || 0
                    }));
                    await sendPurchaseSuccessEmail(
                        userEmail, 
                        String(paymentInfo.id), 
                        paymentInfo.transaction_amount || 0, 
                        itemsForEmail, 
                        billingDetails
                    );
                }

                // 4. Descontar Stock de forma atómica usando la función RPC
                let stockErrorOccurred = false;
                for (const item of itemsToProcess) {
                    const productId = item.id;
                    const qtyBought = Number(item.quantity) || 1;
                    const size = item.size;

                    if (!productId || !size) continue;

                    const { error: rpcError } = await supabase.rpc('decrement_stock', {
                        p_id: productId,
                        p_size: size,
                        p_qty: qtyBought
                    });

                    if (rpcError) {
                        console.error(`Error executing decrement_stock RPC for product ${productId}:`, rpcError);
                        stockErrorOccurred = true;
                        // Alertar en el historial
                        await supabase.from('order_history').insert({
                            order_id: finalOrderId,
                            status: 'paid',
                            notes: `⚠️ ALERTA DE STOCK: Falló el descuento de inventario para ${item.name || productId}. Posible Overselling. Requiere revisión manual.`
                        });
                    }
                }

                if (stockErrorOccurred) {
                    // Marcar la orden como problemática para que el admin la vea
                    await supabase.from('orders').update({
                        status: 'paid_but_no_stock'
                    }).eq('id', finalOrderId);
                }
            }
        }

        // MP requiere que respondamos 200 OK rápido
        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json(
            { error: "Webhook Error", message: error.message },
            { status: 500 }
        );
    }
}
