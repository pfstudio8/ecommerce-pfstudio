import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { checkoutLimiter } from '@/utils/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const { success } = await checkoutLimiter.limit(`transfer_${ip}`);
        if (!success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }

        const body = await request.json();
        const { items, user_email, billingDetails } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items provided" }, { status: 400 });
        }

        const normalItems = items.filter((item: any) => !item.product.id.startsWith('custom-'));
        const customItems = items.filter((item: any) => item.product.id.startsWith('custom-'));

        const supabase = createAdminClient();
        const productIds = normalItems.map((item: any) => item.product.id);
        
        let dbProducts: any[] = [];
        if (productIds.length > 0) {
            const { data, error: dbError } = await supabase
                .from('products')
                .select('id, name, price')
                .in('id', productIds);

            if (dbError) {
                return NextResponse.json({ error: 'Error fetching products from database' }, { status: 500 });
            }
            if (data) dbProducts = data;
        }

        const productMap = new Map(dbProducts.map(p => [p.id, p]));

        // Early validation to prevent Data Littering
        for (const item of normalItems) {
            if (!productMap.has(item.product.id)) {
                return NextResponse.json({ error: `Product ${item.product.id} not found or unavailable` }, { status: 400 });
            }
        }

        // Validate custom items
        const { CUSTOM_PRICING } = await import('@/utils/customPricing');
        for (const item of customItems) {
            const match = item.product.id.match(/^custom-(.+?)-\d+$/);
            if (!match || !(match[1] in CUSTOM_PRICING)) {
                return NextResponse.json({ error: `Custom product invalid or unavailable` }, { status: 400 });
            }
        }

        // Calculate total amount based on real prices
        const totalAmount = items.reduce((acc: number, item: any) => {
            let realPrice = 0;
            if (item.product.id.startsWith('custom-')) {
                const match = item.product.id.match(/^custom-(.+?)-\d+$/);
                if (match && CUSTOM_PRICING[match[1]]) {
                    realPrice = CUSTOM_PRICING[match[1]];
                }
            } else {
                const dbProduct = productMap.get(item.product.id);
                realPrice = dbProduct ? Number(dbProduct.price) : 0;
            }
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
            let realPrice = 0;
            if (item.product.id.startsWith('custom-')) {
                const match = item.product.id.match(/^custom-(.+?)-\d+$/);
                if (match && CUSTOM_PRICING[match[1]]) {
                    realPrice = CUSTOM_PRICING[match[1]];
                }
            } else {
                const dbProduct = productMap.get(item.product.id);
                realPrice = dbProduct ? Number(dbProduct.price) : 0;
            }
            
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
                    let name = item.product.name;
                    let price = Number(item.product.price);

                    if (item.product.id.startsWith('custom-')) {
                        const match = item.product.id.match(/^custom-(.+?)-\d+$/);
                        if (match && CUSTOM_PRICING[match[1]]) {
                            price = CUSTOM_PRICING[match[1]];
                        }
                    } else {
                        const dbProduct = productMap.get(item.product.id);
                        if (dbProduct) {
                            name = dbProduct.name;
                            price = Number(dbProduct.price);
                        }
                    }

                    return {
                        name: name,
                        size: item.size,
                        quantity: item.quantity,
                        price: price
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
