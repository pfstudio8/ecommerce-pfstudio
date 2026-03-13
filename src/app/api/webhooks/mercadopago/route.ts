import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { supabase } from '@/lib/supabase';
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

            // 2. Extraer los items vendidos para descontar stock
            const itemsToProcess = paymentInfo.metadata?.cart_items || [];
            const userEmail = paymentInfo.metadata?.user_email || paymentInfo.payer?.email || 'invitado@mercadopago.com';

            // 3. Registrar la orden matriz en la base de datos
            const { data: orderResult, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        customer_email: userEmail,
                        status: status, // 'approved', 'pending', 'rejected'
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
                    price_at_purchase: item.unit_price || 0
                }));
                
                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItemsToInsert);
                    
                if (itemsError) {
                    console.error("Error insertando order_items:", itemsError);
                }
            }

            if (status === 'approved') {
                // Enviar el correo electrónico
                if (userEmail && userEmail !== 'invitado@mercadopago.com') {
                    await sendPurchaseSuccessEmail(userEmail, String(paymentInfo.id), paymentInfo.transaction_amount || 0, itemsToProcess);
                }

                // 4. Descontar Stock
                for (const item of itemsToProcess) {
                    const productId = item.id;
                    const qtyBought = Number(item.quantity) || 1;
                    const size = item.size;

                    if (!productId) continue;

                    // Deduct from size-specific stock chart (product_stock)
                    if (size) {
                        const { data: sizeStockData } = await supabase
                            .from('product_stock')
                            .select('stock_quantity')
                            .eq('product_id', productId)
                            .eq('size', size)
                            .single();
                        
                        if (sizeStockData && sizeStockData.stock_quantity >= qtyBought) {
                            await supabase
                                .from('product_stock')
                                .update({ stock_quantity: sizeStockData.stock_quantity - qtyBought })
                                .eq('product_id', productId)
                                .eq('size', size);
                        }
                    }

                    // Deduct from legacy parent products.stock
                    const { data: prodData } = await supabase
                        .from('products')
                        .select('stock, name')
                        .eq('id', productId)
                        .single();

                    if (prodData && prodData.stock >= qtyBought) {
                        const newStock = prodData.stock - qtyBought;
                        await supabase
                            .from('products')
                            .update({ stock: newStock })
                            .eq('id', productId);
                    }
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
