import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { checkoutLimiter } from '@/utils/rateLimit';
import { CUSTOM_PRICING } from '@/utils/customPricing';

export const dynamic = 'force-dynamic';

const checkoutItemSchema = z.object({
    product: z.object({
        id: z.string(),
        name: z.string().optional(),
        price: z.number().or(z.string().transform(Number)).optional(),
        images: z.array(z.string()).optional()
    }),
    size: z.string().min(1, 'El talle es requerido'),
    quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0')
});

const customerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(6, 'Número de teléfono inválido'),
    deliveryMethod: z.enum(['shipping', 'pickup']),
    shippingAddress: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
});

const checkoutPayloadSchema = z.object({
    items: z.array(checkoutItemSchema).min(1, 'El carrito no puede estar vacío'),
    customer: customerSchema
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const { success: rateLimitOk } = await checkoutLimiter.limit(`checkout_${ip}`);
        if (!rateLimitOk) {
            return NextResponse.json({ error: 'Demasiadas solicitudes. Por favor, aguarda un instante.' }, { status: 429 });
        }

        const body = await request.json();
        const parseResult = checkoutPayloadSchema.safeParse(body);
        if (!parseResult.success) {
            const firstError = parseResult.error.issues[0]?.message || 'Datos de checkout inválidos';
            return NextResponse.json({ error: firstError, issues: parseResult.error.issues }, { status: 400 });
        }

        const { items, customer } = parseResult.data;

        // Validar dirección en caso de envío
        if (customer.deliveryMethod === 'shipping' && (!customer.shippingAddress || customer.shippingAddress.trim().length < 5)) {
            return NextResponse.json({ error: 'Por favor, ingresá una dirección de envío completa.' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Separar productos estándar y personalizados
        const normalItems = items.filter(item => !item.product.id.startsWith('custom-'));
        const customItems = items.filter(item => item.product.id.startsWith('custom-'));
        const productIds = normalItems.map(item => item.product.id);

        // 1. Recalcular precios desde la base de datos (seguridad estricta contra client tampering)
        let dbProducts: any[] = [];
        if (productIds.length > 0) {
            const { data, error: dbError } = await supabase
                .from('products')
                .select('id, name, price, active')
                .in('id', productIds);

            if (dbError) {
                console.error("Error consultando productos:", dbError);
                return NextResponse.json({ error: 'Error al consultar catálogo de productos.' }, { status: 500 });
            }
            dbProducts = data || [];
        }

        const productMap = new Map(dbProducts.map(p => [p.id, p]));

        // Validar existencia y estado activo de productos normales
        for (const item of normalItems) {
            const dbProduct = productMap.get(item.product.id);
            if (!dbProduct) {
                return NextResponse.json({ error: `El producto "${item.product.name || item.product.id}" no existe en el catálogo.` }, { status: 400 });
            }
            if (dbProduct.active === false) {
                return NextResponse.json({ error: `El producto "${dbProduct.name}" no se encuentra disponible actualmente.` }, { status: 400 });
            }
        }

        // Validar productos personalizados
        for (const item of customItems) {
            const match = item.product.id.match(/^custom-(.+?)-\d+$/);
            if (!match || !(match[1] in CUSTOM_PRICING)) {
                return NextResponse.json({ error: 'Producto personalizado inválido o no disponible.' }, { status: 400 });
            }
        }

        // 2. Validar stock disponible en product_stock para cada variante
        if (normalItems.length > 0) {
            const { data: stockRecords, error: stockError } = await supabase
                .from('product_stock')
                .select('product_id, size, stock_quantity')
                .in('product_id', productIds);

            if (stockError) {
                console.error("Error validando stock:", stockError);
                return NextResponse.json({ error: 'Error al verificar disponibilidad de stock.' }, { status: 500 });
            }

            const stockMap = new Map<string, number>();
            (stockRecords || []).forEach(s => {
                stockMap.set(`${s.product_id}_${s.size.toUpperCase()}`, s.stock_quantity);
            });

            for (const item of normalItems) {
                const stockKey = `${item.product.id}_${item.size.toUpperCase()}`;
                const availableStock = stockMap.get(stockKey) ?? 0;
                const dbProduct = productMap.get(item.product.id);
                const productName = dbProduct?.name || item.product.name || 'Producto';

                if (availableStock < item.quantity) {
                    return NextResponse.json({
                        error: `No hay suficiente stock para "${productName}" (Talle ${item.size}). Stock disponible: ${availableStock}.`
                    }, { status: 400 });
                }
            }
        }

        // 3. Recalcular total exacto
        let totalAmount = 0;
        const processedItems = items.map(item => {
            let realPrice = 0;
            let realName = '';

            if (item.product.id.startsWith('custom-')) {
                const match = item.product.id.match(/^custom-(.+?)-\d+$/);
                realPrice = (match && (CUSTOM_PRICING as any)[match[1]]) || 0;
                realName = item.product.name || 'Prenda Personalizada';
            } else {
                const dbProduct = productMap.get(item.product.id);
                realPrice = dbProduct ? Number(dbProduct.price) : 0;
                realName = dbProduct?.name || item.product.name || 'Producto';
            }

            totalAmount += realPrice * item.quantity;

            return {
                product_id: item.product.id.startsWith('custom-') ? null : item.product.id,
                product_name: realName,
                size: item.size,
                quantity: item.quantity,
                price_at_purchase: realPrice
            };
        });

        // 4. Crear el pedido en estado 'pending' (transferencia bancaria)
        const paymentReference = `transfer_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const shippingDetails = customer.deliveryMethod === 'shipping'
            ? `Envío a: ${customer.shippingAddress} | Contacto: ${customer.name} (Tel: ${customer.phone})`
            : `Retiro en Local/Punto de Entrega | Contacto: ${customer.name} (Tel: ${customer.phone})`;

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    customer_email: customer.email,
                    status: 'pending',
                    total_amount: totalAmount,
                    payment_method: 'transfer',
                    payment_id: paymentReference,
                    shipping_address: customer.deliveryMethod === 'shipping' ? customer.shippingAddress : 'Retiro en Local'
                }
            ])
            .select('id, created_at')
            .single();

        if (orderError || !orderData) {
            console.error("Error creando pedido:", orderError);
            return NextResponse.json({ error: "No se pudo registrar el pedido en el sistema." }, { status: 500 });
        }

        const finalOrderId = orderData.id;

        // 5. Guardar los items con snapshot de nombre y precio
        const orderItemsToInsert = processedItems.map(item => ({
            order_id: finalOrderId,
            product_id: item.product_id,
            product_name: item.product_name,
            size: item.size,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsError) {
            console.error("Error insertando order_items:", itemsError);
        }

        // 6. Registrar en el historial de pedidos (order_history)
        await supabase.from('order_history').insert({
            order_id: finalOrderId,
            status: 'pending',
            notes: `Pedido registrado por transferencia. Método: ${customer.deliveryMethod === 'shipping' ? 'Envío' : 'Retiro'}. ${customer.notes ? `Nota: "${customer.notes}"` : ''}`
        });

        // 7. Enviar correo de confirmación de pedido pendiente
        try {
            const { sendPurchaseSuccessEmail } = await import('@/lib/sendEmail');
            await sendPurchaseSuccessEmail(
                customer.email, 
                finalOrderId, 
                totalAmount, 
                processedItems.map(i => ({ name: i.product_name, size: i.size, quantity: i.quantity, price: i.price_at_purchase })),
                { name: customer.name, phone: customer.phone, address: customer.shippingAddress || 'Retiro en punto de entrega' }
            );
        } catch (emailErr) {
            console.error("Error enviando email de confirmación:", emailErr);
        }

        return NextResponse.json({
            success: true,
            orderId: finalOrderId,
            totalAmount: totalAmount,
            reference: finalOrderId.split('-')[0].toUpperCase()
        });

    } catch (error: any) {
        console.error("Error en POST /api/checkout:", error);
        return NextResponse.json({ error: error.message || 'Error procesando la solicitud de compra.' }, { status: 500 });
    }
}
