import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Forzamos a que esta ruta sea dinámica (no se guarde en caché)
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Faltan credenciales de Supabase' }, { status: 500 });
    }

    // Creamos un cliente de Supabase básico
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Hacemos una consulta muy ligera a la base de datos (ej. tabla categories)
    // Esto es suficiente para que Supabase registre actividad
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
