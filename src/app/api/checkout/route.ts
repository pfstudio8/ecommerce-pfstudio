import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export const dynamic = 'force-dynamic';

// Instanciar MercadoPago con el token del usuario
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, billingDetails } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items provided" }, { status: 400 });
        }

        const preference = new Preference(client);

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        // Convertir los items del carrito al formato de MercadoPago
        const mpItems = items.map((item: any) => {
            let pictureUrl = item.product.images[0] || '';
            if (pictureUrl && !pictureUrl.startsWith('http')) {
                pictureUrl = `${origin}${pictureUrl.startsWith('/') ? '' : '/'}${pictureUrl}`;
            }

            return {
                id: item.product.id,
                title: `${item.product.name} - Talle ${item.size}`,
                quantity: item.quantity,
                unit_price: Number(item.product.price),
                currency_id: 'ARS',
                picture_url: pictureUrl,
                description: item.product.category || 'Product'
            };
        });

        const isLocalhost = origin.includes('localhost');
        const bodyPayload: any = {
            items: mpItems,
            metadata: {
                user_email: body.user_email || null,
                billing_details: billingDetails,
                cart_items: items.map((item: any) => ({
                    id: item.product.id,
                    quantity: item.quantity,
                    size: item.size
                }))
            },
            back_urls: {
                success: `${origin}/success`,
                failure: `${origin}/?status=failure`,
                pending: `${origin}/?status=pending`
            }
        };

        if (!isLocalhost) {
            bodyPayload.auto_return = 'approved';
        }

        const response = await preference.create({
            body: bodyPayload
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
