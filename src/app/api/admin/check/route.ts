import { createClient } from '@/utils/supabase/server';
import { getAuthContext } from '@/utils/supabase/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const auth = await getAuthContext(supabase);

        if (!auth) {
            return NextResponse.json({ isAdmin: false, role: 'customer' }, { status: 200 });
        }

        return NextResponse.json({ isAdmin: auth.isAdmin, role: auth.role }, { status: 200 });
    } catch (error: any) {
        console.error("Error in admin check API:", error);
        return NextResponse.json({ isAdmin: false, role: 'customer', error: error.message }, { status: 500 });
    }
}
