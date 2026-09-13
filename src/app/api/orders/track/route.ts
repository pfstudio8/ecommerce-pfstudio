import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { orderId, email } = body;

        const cleanOrderId = orderId ? String(orderId).trim() : null;
        const cleanEmail = email ? String(email).trim().toLowerCase() : null;

        if (!cleanOrderId && !cleanEmail) {
            return NextResponse.json(
                { error: "Por favor ingresá tu número de pedido o correo electrónico." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        let query = supabase
            .from('orders')
            .select(`
                *,
                items:order_items(
                    *,
                    product:products(*)
                )
            `)
            .order('created_at', { ascending: false });

        if (cleanEmail && !cleanOrderId) {
            // Search all orders for this email
            query = query.ilike('customer_email', cleanEmail);
        } else if (cleanOrderId && !cleanEmail) {
            // Check if full UUID or short UUID prefix
            if (cleanOrderId.length > 20) {
                query = query.eq('id', cleanOrderId);
            } else {
                query = query.ilike('id', `${cleanOrderId}%`);
            }
        } else if (cleanOrderId && cleanEmail) {
            // Search by both for exact precision
            if (cleanOrderId.length > 20) {
                query = query.eq('id', cleanOrderId).ilike('customer_email', cleanEmail);
            } else {
                query = query.ilike('id', `${cleanOrderId}%`).ilike('customer_email', cleanEmail);
            }
        }

        const { data: orders, error } = await query;

        if (error) {
            console.error("Error fetching order tracking info:", error);
            return NextResponse.json(
                { error: "Ocurrió un error al buscar la información del pedido." },
                { status: 500 }
            );
        }

        if (!orders || orders.length === 0) {
            return NextResponse.json(
                { orders: [], message: "No se encontraron pedidos con los datos ingresados." },
                { status: 200 }
            );
        }

        return NextResponse.json({ orders }, { status: 200 });

    } catch (error: any) {
        console.error("Order tracking API error:", error);
        return NextResponse.json(
            { error: "Error en el servidor al procesar la búsqueda." },
            { status: 500 }
        );
    }
}
