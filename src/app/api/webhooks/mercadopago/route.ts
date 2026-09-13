import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendPurchaseSuccessEmail } from '@/lib/sendEmail';

export const dynamic = 'force-dynamic';

// Instanciar MercadoPago con el token del usuario
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const type = url.searchParams.get('type') || url.searchParams.get('topic');
        const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');

        // Solo nos importan las actualizaciones de "payment" (pagos)
        if (type === 'payment' && dataId) {
            const payment = new Payment(client);

            // 1. Obtener la información completa del pago desde MP
            const paymentInfo = await payment.get({ id: dataId });

            const status = paymentInfo.status; // 'approved', 'rejected', 'pending'

            // Si el pago no fue aprobado aún, no hacemos cambios de stock
            if (status !== 'approved') {
                return NextResponse.json({ received: true, status: status });
            }

            const supabase = createAdminClient();

            // Evitar duplicación de órdenes
            const { data: existingOrder } = await supabase
                .from('orders')
                .select('id')
                .eq('payment_id', String(paymentInfo.id))
                .maybeSingle();

            if (existingOrder) {
                console.log("Order already processed for payment_id:", paymentInfo.id);
                return NextResponse.json({ received: true, note: "Order already processed" });
            }

            // 2. Extraer los items vendidos para descontar stock
            const itemsToProcess = paymentInfo.metadata?.cart_items || [];
            const userEmail = paymentInfo.metadata?.user_email || paymentInfo.payer?.email || 'invitado@mercadopago.com';
            const billingDetails = paymentInfo.metadata?.billing_details || null;

            // 3. Registrar la orden matriz en la base de datos (estado 'paid')
            const { data: orderResult, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        customer_email: userEmail,
                        status: 'paid', // Standardize 'approved' -> 'paid'
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

            const newOrderId = orderResult.id;

            // 3.1 Registrar los artículos vendidos en order_items
            if (itemsToProcess.length > 0) {
                const orderItemsToInsert = itemsToProcess.map((item: any) => ({
                    order_id: newOrderId,
                    product_id: item.id || null,
                    size: item.size || 'N/A',
                    quantity: item.quantity || 1,
                    price_at_purchase: item.price || 0 // Correct price property
                }));
                
                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItemsToInsert);
                    
                    if (itemsError) {
                        console.error("Error insertando order_items:", itemsError);
                    }
                }
    
                // 3.1.5 Registrar historial de la orden inicial
                const { error: historyError } = await supabase
                    .from('order_history')
                    .insert({
                        order_id: newOrderId,
                        status: 'paid',
                        notes: 'Pago procesado exitosamente vía MercadoPago'
                    });
                
                if (historyError) {
                    console.error("Error insertando order_history:", historyError);
                }
    
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
