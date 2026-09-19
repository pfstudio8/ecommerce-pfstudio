import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Debes iniciar sesión para dejar una reseña" }, { status: 401 });
        }

        const { productId, rating, comment } = await req.json();

        if (!productId || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Datos de reseña inválidos" }, { status: 400 });
        }

        // 1. Check if user already reviewed this product
        const { data: existingReview } = await supabase
            .from("reviews")
            .select("id")
            .eq("product_id", productId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (existingReview) {
            return NextResponse.json({ error: "Ya has dejado una reseña para este producto anteriormente." }, { status: 403 });
        }

        // 2. Check if user has purchased this product
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, status, order_items(product_id)')
            .eq('customer_email', user.email)
            .in('status', ['paid', 'approved', 'shipped', 'Pagado', 'Enviado']);

        if (ordersError) {
            console.error("Error verificando compras:", ordersError);
            return NextResponse.json({ error: "Error al verificar compras." }, { status: 500 });
        }

        const hasPurchased = orders?.some(order => 
            order.order_items?.some((item: any) => item.product_id === productId)
        );

        if (!hasPurchased) {
            return NextResponse.json({ error: "Debes haber comprado este producto para poder dejar una reseña." }, { status: 403 });
        }

        // 3. Insert review
        const { error: insertError } = await supabase.from("reviews").insert({
            product_id: productId,
            user_id: user.id,
            user_email: user.email,
            rating,
            comment: comment?.trim() || ""
        });

        if (insertError) {
            throw insertError;
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: any) {
        console.error("Error en POST /api/reviews:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
