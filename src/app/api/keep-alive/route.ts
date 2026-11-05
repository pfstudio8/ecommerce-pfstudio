import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const cronSecret = process.env.CRON_SECRET;
        const authHeader = request.headers.get('authorization');
        
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ error: 'Faltan credenciales de Supabase' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        const { error } = await supabase.from('categories').select('id').limit(1);

        if (error) {
            console.error("Error en cron keep-alive:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ status: 'ok', message: 'Supabase is awake!' });
    } catch (error) {
        console.error("Excepción en cron:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
