import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { contactLimiter } from '@/utils/rateLimit';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!contactLimiter.check(ip)) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }

        const body = await request.json();
        const { user_name, user_email, content } = body;

        if (!user_name || !user_email || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { error } = await supabase
            .from('messages')
            .insert([{
                user_name,
                user_email,
                content
            }]);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in contact route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
