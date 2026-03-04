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
            // Extraer items del webhook de MP es complejo a través de additional_info
            // Extraeremos directamente desde la metadata que enviamos al crear la preferencia
            const itemsToProcess = paymentInfo.metadata?.items || [];

            // Si no hay items formados en metadata, tratamos de sacarlos de description o fallback a nothing
            if (itemsToProcess.length === 0 && paymentInfo.additional_info?.items) {
                paymentInfo.additional_info.items.forEach((i: any) => {
                    itemsToProcess.push({
                        id: i.id, // ID del producto de Supabase
                        quantity: Number(i.quantity) || 1
                    });
                });
            }

            // 3. Registrar la orden en la base de datos (Requiere tabla 'orders')
            // Ajustado al esquema visual provisto por el usuario:
            // user_id, user_email, status, total, items
            const payerEmail = paymentInfo.payer?.email || 'pago_invitado@mercadopago.com';

            const { error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        // IMPORTANTE: Tu base de datos tiene `user_id` como NOT NULL en el esquema de la foto.
                        // Para compras de invitados (sin login), esto va a dar error.
                        // Debes ir a Supabase y hacer que `user_id` sea opcional (Nullable)
                        user_email: payerEmail,
                        status: status === 'approved' ? 'Aprobado' : 'Pendiente',
                        total: paymentInfo.transaction_amount,
                        items: itemsToProcess
                    }
                ]);

            if (orderError) {
                console.error("Error guardando orden:", orderError);
            } else if (status === 'approved' && payerEmail) {
                // Enviar el correo solo si se guardó bien y se aprobó
                await sendPurchaseSuccessEmail(payerEmail, String(paymentInfo.id), paymentInfo.transaction_amount || 0);
            }

            // 4. Descontar Stock si la inserción fue exitosa (Incluso si da error de clave única)
            for (const item of itemsToProcess) {
                const productId = item.id;
                const qtyBought = item.quantity;

                if (!productId) continue;

                // Restar stock usando una función básica, lee -> resta -> escribe
                // Ideally this would be an RPC call in Supabase to be atomic
                const { data: prodData } = await supabase
                    .from('products')
                    .select('stock')
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
