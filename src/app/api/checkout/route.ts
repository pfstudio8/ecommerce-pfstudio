import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { checkoutLimiter } from '@/utils/rateLimit';

const checkoutItemSchema = z.object({
    product: z.object({
        id: z.string(),
        name: z.string(),
        price: z.number().or(z.string().transform(Number)),
        images: z.array(z.string()).optional().default([]),
        category: z.string().optional()
    }),
    size: z.string(),
    quantity: z.number().min(1)
});

type CheckoutItemType = z.infer<typeof checkoutItemSchema>;

const checkoutSchema = z.object({
    items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
    billingDetails: z.any().optional(),
    user_email: z.string().email().optional().nullable()
});

export const dynamic = 'force-dynamic';

// Instanciar MercadoPago con el token del usuario
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!checkoutLimiter.check(ip)) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }

        const body = await request.json();
        const parseResult = checkoutSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: 'Invalid checkout payload', issues: parseResult.error.format() }, { status: 400 });
        }
        
        const { items, billingDetails, user_email } = parseResult.data;

        const supabase = createAdminClient();
        const productIds = items.map(item => item.product.id);
        
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
        const totalAmount = items.reduce((acc: number, item: CheckoutItemType) => {
            const dbProduct = productMap.get(item.product.id);
            const realPrice = dbProduct ? Number(dbProduct.price) : 0;
            return acc + (realPrice * item.quantity);
        }, 0);

        const fakePaymentId = `mp_pref_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Create the order in Supabase with 'pending' status
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    customer_email: user_email || 'invitado@mercadopago.com',
                    status: 'pending', 
                    total_amount: totalAmount,
                    payment_method: 'mercadopago',
                    payment_id: fakePaymentId
                }
            ])
            .select('id')
            .single();

        if (orderError) {
            console.error("Error creating pending order:", orderError);
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // Insert the line items
        const orderItemsToInsert = items.map((item: CheckoutItemType) => {
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

        await supabase.from('order_items').insert(orderItemsToInsert);

        const preference = new Preference(client);

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        // Convertir los items del carrito al formato de MercadoPago
        const mpItems = items.map((item: CheckoutItemType) => {
            const dbProduct = productMap.get(item.product.id);
            if (!dbProduct) {
                throw new Error(`Product ${item.product.id} not found in database`);
            }
            
            let pictureUrl = item.product.images[0] || '';
            if (pictureUrl && !pictureUrl.startsWith('http')) {
                pictureUrl = `${origin}${pictureUrl.startsWith('/') ? '' : '/'}${pictureUrl}`;
            }

            return {
                id: item.product.id,
                title: `${dbProduct.name} - Talle ${item.size}`,
                quantity: item.quantity,
                unit_price: Number(dbProduct.price),
                currency_id: 'ARS',
                picture_url: pictureUrl,
                description: item.product.category || 'Product'
            };
        });

        const isLocalhost = origin.includes('localhost');
        const bodyPayload = {
            items: mpItems,
            metadata: {
                internal_order_id: orderData.id,
                user_email: user_email || null,
                billing_details: billingDetails,
                cart_items: items.map((item: CheckoutItemType) => {
                    const dbProduct = productMap.get(item.product.id);
                    return {
                        id: item.product.id,
                        name: dbProduct.name,
                        price: Number(dbProduct.price),
                        quantity: item.quantity,
                        size: item.size
                    };
                })
            },
            back_urls: {
                success: `${origin}/success`,
                failure: `${origin}/?status=failure`,
                pending: `${origin}/?status=pending`
            },
            ...(isLocalhost ? {} : { auto_return: 'approved' })
        };

        const response = await preference.create({
            body: bodyPayload as any
        });

        // Retornar la URL de la pasarela de pagos al frontend
        return NextResponse.json({ init_point: response.init_point });

    } catch (error: any) {
        console.error("====== Error creating MercadoPago preference ======");
        console.error("Error Message:", error.message);
        if (error.cause) {
            console.error("Error Cause:", JSON.stringify(error.cause, null, 2));
        }
        if (error.response) {
            console.error("Error Response:", JSON.stringify(error.response, null, 2));
        }
        console.error("===================================================");
        return NextResponse.json({
            error: "Failed to create preference",
            details: error.message || error,
            validation_errors: error.cause || error.response
        }, { status: 500 });
    }
}
