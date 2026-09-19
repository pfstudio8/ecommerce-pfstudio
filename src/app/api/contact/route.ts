import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { contactLimiter } from '@/utils/rateLimit';
import { z } from 'zod';

const contactSchema = z.object({
    user_name: z.string().min(2).max(100),
    user_email: z.string().email(),
    content: z.string().min(10).max(1000)
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!contactLimiter.check(ip)) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }

        const body = await request.json();
        const parseResult = contactSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: 'Validation failed', issues: parseResult.error.format() }, { status: 400 });
        }

        const { user_name, user_email, content } = parseResult.data;

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
