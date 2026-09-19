import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendAbandonedCartEmail } from '@/lib/sendEmail';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Verify Cron Secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret';
    
    if (authHeader !== `Bearer ${cronSecret}` && request.headers.get('x-cron-secret') !== cronSecret) {
        // Permit alternative header for standard cron jobs
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createAdminClient();

        // 2. Fetch pending orders older than 2 hours
        const twoHoursAgo = new Date();
        twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

        const { data: pendingOrders, error: ordersError } = await supabase
            .from('orders')
            .select('id, customer_email, created_at')
            .eq('status', 'pending')
            .lt('created_at', twoHoursAgo.toISOString());

        if (ordersError || !pendingOrders) {
            console.error("Error fetching pending orders:", ordersError);
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        if (pendingOrders.length === 0) {
            return NextResponse.json({ message: 'No abandoned carts found' });
        }

        let sentCount = 0;

        for (const order of pendingOrders) {
            if (!order.customer_email || order.customer_email === 'invitado@mercadopago.com') continue;

            // 3. Check if we already sent an email for this order
            const { data: history } = await supabase
                .from('order_history')
                .select('id')
                .eq('order_id', order.id)
                .eq('notes', 'abandoned_email_sent')
                .maybeSingle();

            if (!history) {
                // 4. Send Email
                await sendAbandonedCartEmail(order.customer_email);
                sentCount++;

                // 5. Register in history so we don't send it again
                await supabase.from('order_history').insert({
                    order_id: order.id,
                    status: 'pending',
                    notes: 'abandoned_email_sent'
                });
            }
        }

        return NextResponse.json({ success: true, emails_sent: sentCount });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
