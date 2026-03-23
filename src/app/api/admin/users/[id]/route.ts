import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { error: 'La configuración de Supabase está incompleta (Falta agregar SUPABASE_SERVICE_ROLE_KEY en .env.local)' }, 
                { status: 500 }
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { data, error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) {
            if (error.message === 'User not found' || error.status === 404) {
                console.log("User not found in Auth, but we will try to delete from profiles table anyway.");
            } else {
                console.error("Error deleting user via Admin API:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        // Eliminar también de la tabla profiles por si quedó huérfano (sin cascade delete)
        const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', id);

        if (profileError) {
            console.error("Error deleting profile directly:", profileError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Unexpected error in delete user API:", error);
        return NextResponse.json({ error: error.message || 'Error inesperado del servidor' }, { status: 500 });
    }
}
