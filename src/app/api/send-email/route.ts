import { NextResponse } from 'next/server';
import { sendPurchaseSuccessEmail, sendWelcomeEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, email, orderId, totalAmount, items } = body;

        if (!email) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        if (type === 'welcome') {
            await sendWelcomeEmail(email);
            return NextResponse.json({ success: true });
        } else if (type === 'order') {
            await sendPurchaseSuccessEmail(email, orderId, totalAmount, items || []);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error: any) {
        console.error('Error in send-email route:', error);
        return NextResponse.json({ error: error.message || 'Error processing request' }, { status: 500 });
    }
}
