import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ isAdmin: false, role: 'customer' }, { status: 200 });
        }

        // Consultar el rol del usuario directamente en profiles
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        let role = profile?.role || 'customer';
        let isAdmin = role === 'admin' || role === 'employee';

        // Fallback de transición si la tabla aún no se ha migrado
        if (!isAdmin) {
            const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
            const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());
            if (adminEmails.includes(user.email.toLowerCase())) {
                isAdmin = true;
                role = 'admin';
            }
        }

        return NextResponse.json({ isAdmin, role }, { status: 200 });
    } catch (error: any) {
        console.error("Error in admin check API:", error);
        return NextResponse.json({ isAdmin: false, role: 'customer', error: error.message }, { status: 500 });
    }
}
