import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, user_email } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items provided" }, { status: 400 });
        }

        // Calculate total amount
        const totalAmount = items.reduce((acc: number, item: any) => acc + (Number(item.product.price) * item.quantity), 0);

        // Format items for the database
        const cartItems = items.map((item: any) => ({
            id: item.product.id,
            quantity: item.quantity,
            size: item.size
        }));

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
        const orderItemsToInsert = items.map((item: any) => ({
            order_id: orderData.id,
            product_id: item.product.id || null,
            size: item.size || 'N/A',
            quantity: item.quantity || 1,
            price_at_purchase: item.product.price || 0
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsError) {
            console.error("Error creating transfer line items:", itemsError);
        }

        // Reserve Stock Eagerly to prevent overselling on pending transfers
        for (const item of items) {
            const productId = item.product.id;
            const qtyBought = Number(item.quantity) || 1;
            const size = item.size;

            if (!productId) continue;

            if (size) {
                const { data: sizeStockData } = await supabase
                    .from('product_stock')
                    .select('stock_quantity')
                    .eq('product_id', productId)
                    .eq('size', size)
                    .single();
                
                if (sizeStockData && sizeStockData.stock_quantity >= qtyBought) {
                    await supabase
                        .from('product_stock')
                        .update({ stock_quantity: sizeStockData.stock_quantity - qtyBought })
                        .eq('product_id', productId)
                        .eq('size', size);
                }
            }

            const { data: prodData } = await supabase
                .from('products')
                .select('stock')
                .eq('id', productId)
                .single();

            if (prodData && prodData.stock >= qtyBought) {
                await supabase
                    .from('products')
                    .update({ stock: prodData.stock - qtyBought })
                    .eq('id', productId);
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
            error: "An unexpected error occurred",
            details: error.message || error,
        }, { status: 500 });
    }
}
