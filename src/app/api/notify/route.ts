import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendWelcomeEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, email, name } = body;

        if (!email) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        // Verify that the caller is logged in and matching the requested email
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.email !== email) {
            return NextResponse.json({ error: 'Unauthorized: Session email does not match target email' }, { status: 401 });
        }

        if (type === 'welcome') {
            const userName = name || user.user_metadata?.full_name || user.user_metadata?.name;
            await sendWelcomeEmail(email, userName);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    } catch (error: any) {
        console.error('Error in send-email route:', error);
        return NextResponse.json({ error: error.message || 'Error processing request' }, { status: 500 });
    }
}
