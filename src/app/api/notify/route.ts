import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendWelcomeEmail } from '@/lib/sendEmail';
import { z } from 'zod';
import { notifyLimiter } from '@/utils/rateLimit';

const notifySchema = z.object({
    type: z.enum(['welcome']),
    email: z.string().email('Invalid email address format'),
    name: z.string().optional()
});

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const { success } = await notifyLimiter.limit(`notify_${ip}`);
        if (!success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }

        const body = await req.json();
        
        const parseResult = notifySchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: 'Validation failed', issues: parseResult.error.format() }, { status: 400 });
        }
        
        const { type, email, name } = parseResult.data;

        // For welcome emails, the session might not be established yet on the server, 
        // or the user might not be logged in (if email confirmation is required).
        // So we use the admin client to verify the user exists instead of relying on session cookies.
        if (type === 'welcome') {
            const { createAdminClient } = await import('@/utils/supabase/admin');
            const adminClient = createAdminClient();
            
            const { data: userProfile, error: profileError } = await adminClient
                .from('profiles')
                .select('id, email, full_name')
                .eq('email', email)
                .maybeSingle();
            
            if (profileError || !userProfile) {
                return NextResponse.json({ error: 'Unauthorized: User not found in system' }, { status: 401 });
            }

            const { data: { user }, error: userError } = await adminClient.auth.admin.getUserById(userProfile.id);

            if (userError || !user) {
                return NextResponse.json({ error: 'Failed to fetch user auth data' }, { status: 500 });
            }

            // Verify if it was already sent
            if (user.user_metadata?.welcome_email_sent) {
                return NextResponse.json({ success: true, message: 'Welcome email already sent' });
            }

            const userName = name || userProfile.full_name || user.user_metadata?.full_name || user.user_metadata?.name;
            await sendWelcomeEmail(email, userName);

            // Mark as sent in Supabase auth metadata
            await adminClient.auth.admin.updateUserById(user.id, {
                user_metadata: { welcome_email_sent: true }
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    } catch (error: any) {
        console.error('Error in send-email route:', error);
        return NextResponse.json({ error: error.message || 'Error processing request' }, { status: 500 });
    }
}
