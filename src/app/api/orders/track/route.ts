import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient as createServerClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { orderId, email } = body;

        const cleanOrderId = orderId ? String(orderId).trim() : null;
        const cleanEmail = email ? String(email).trim().toLowerCase() : null;

        if (!cleanOrderId || !cleanEmail) {
            return NextResponse.json(
                { error: "Por favor ingresá tu número de pedido Y tu correo electrónico para buscar tu orden." },
                { status: 400 }
            );
        }

        const serverSupabase = await createServerClient();
        const { data: { session } } = await serverSupabase.auth.getSession();

        const supabase = session ? serverSupabase : createAdminClient();

        let query = supabase
            .from('orders')
            .select(`
                id, status, total_amount, created_at, tracking_number, carrier,
                items:order_items(
                    quantity, size, product_id, price_at_purchase,
                    product:products(name, images)
                )
            `)
            .order('created_at', { ascending: false });

        // Search by both for exact precision to prevent PII leaks
        if (cleanOrderId.length < 8) {
            return NextResponse.json(
                { error: "El número de pedido ingresado es muy corto. Por seguridad, ingresa al menos los primeros 8 caracteres." },
                { status: 400 }
            );
        }

        if (cleanOrderId.length > 20) {
            query = query.eq('id', cleanOrderId).eq('customer_email', cleanEmail);
        } else {
            query = query.ilike('id', `${cleanOrderId}%`).eq('customer_email', cleanEmail);
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
