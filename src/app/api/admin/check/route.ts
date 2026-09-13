import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ isAdmin: false }, { status: 200 });
        }

        const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
        const adminEmails = adminEmailsEnv.split(',').map(e => e.trim());
        const isAdmin = adminEmails.includes(user.email);

        return NextResponse.json({ isAdmin }, { status: 200 });
    } catch (error: any) {
        console.error("Error in admin check API:", error);
        return NextResponse.json({ isAdmin: false, error: error.message }, { status: 500 });
    }
}
