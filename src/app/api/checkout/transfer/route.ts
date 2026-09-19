import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { checkoutLimiter } from '@/utils/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!checkoutLimiter.check(ip)) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }

        const body = await request.json();
        const { items, user_email, billingDetails } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items provided" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const productIds = items.map((item: any) => item.product.id);
        
        const { data: dbProducts, error: dbError } = await supabase
            .from('products')
            .select('id, name, price')
            .in('id', productIds);

        if (dbError || !dbProducts) {
            return NextResponse.json({ error: 'Error fetching products from database' }, { status: 500 });
        }

        const productMap = new Map(dbProducts.map(p => [p.id, p]));

        // Early validation to prevent Data Littering
        for (const item of items) {
            if (!productMap.has(item.product.id)) {
                return NextResponse.json({ error: `Product ${item.product.id} not found or unavailable` }, { status: 400 });
            }
        }

        // Calculate total amount based on real prices
        const totalAmount = items.reduce((acc: number, item: any) => {
            const dbProduct = productMap.get(item.product.id);
            const realPrice = dbProduct ? Number(dbProduct.price) : 0;
            return acc + (realPrice * item.quantity);
        }, 0);

        const fakePaymentId = `transfer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Create the order in Supabase with 'pending' status (matches schema constraints)
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    customer_email: user_email || 'invitado@transferencia.com',
                    status: 'pending', 
                    total_amount: totalAmount,
                    payment_method: 'transfer',
                    payment_id: fakePaymentId
                }
            ])
            .select('id')
            .single();

        if (orderError) {
            console.error("Error creating transfer order:", orderError);
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // Insert the line items
        const orderItemsToInsert = items.map((item: any) => {
            const dbProduct = productMap.get(item.product.id);
            const realPrice = dbProduct ? Number(dbProduct.price) : 0;
            return {
                order_id: orderData.id,
                product_id: item.product.id || null,
                size: item.size || 'N/A',
                quantity: item.quantity || 1,
                price_at_purchase: realPrice
            };
        });

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsError) {
            console.error("Error creating transfer line items:", itemsError);
        }

        // Stock will be deducted manually by admin when payment is confirmed
        // Send confirmation email
        if (user_email) {
            try {
                const itemsForEmail = items.map((item: any) => {
                    const dbProduct = productMap.get(item.product.id);
                    return {
                        name: dbProduct ? dbProduct.name : item.product.name,
                        size: item.size,
                        quantity: item.quantity,
                        price: dbProduct ? Number(dbProduct.price) : Number(item.product.price)
                    };
                });
                const { sendPurchaseSuccessEmail } = await import('@/lib/sendEmail');
                await sendPurchaseSuccessEmail(user_email, orderData.id, totalAmount, itemsForEmail, billingDetails);
            } catch (emailError) {
                console.error("Error sending transfer confirmation email:", emailError);
                // We don't fail the whole request if email fails
            }
        }

        // Return the order ID so the frontend can redirect to the success page
        return NextResponse.json({
            success: true,
            order_id: orderData.id
        });

    } catch (error: any) {
        console.error("====== Error processing transfer checkout ======");
        console.error("Error Message:", error.message);
        return NextResponse.json({
            error: "Error al procesar el pago. Intentá nuevamente."
        }, { status: 500 });
    }
}
