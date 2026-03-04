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

            // 3. Registrar la orden en la base de datos
            const { error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        mp_payment_id: String(paymentInfo.id),
                        mp_merchant_order_id: paymentInfo.order?.id ? String(paymentInfo.order.id) : null,
                        user_email: userEmail,
                        status: status, // 'approved', 'pending', 'rejected'
                        total_amount: paymentInfo.transaction_amount,
                        items: itemsToProcess,
                        payer_info: paymentInfo.payer || {}
                    }
                ]);

            if (orderError) {
                // Posiblemente el pago ya se registró (Unique Constraint sobre mp_payment_id)
                console.error("Error guardando orden o orden duplicada:", orderError);
                return NextResponse.json({ received: true, note: "Order insertion failed or duplicate" });
            }

            if (status === 'approved') {
                // Enviar el correo electrónico
                if (userEmail && userEmail !== 'invitado@mercadopago.com') {
                    await sendPurchaseSuccessEmail(userEmail, String(paymentInfo.id), paymentInfo.transaction_amount || 0);
                }

                // 4. Descontar Stock
                for (const item of itemsToProcess) {
                    const productId = item.id;
                    const qtyBought = item.quantity;
                    const size = item.size;

                    if (!productId) continue;

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
