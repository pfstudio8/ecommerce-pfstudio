import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Consultar rol en profiles (fuente de verdad)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        let isSuperAdmin = profile?.role === 'admin';
        if (!isSuperAdmin) {
            const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
            const adminEmailsList = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());
            if (adminEmailsList.includes(user.email.toLowerCase())) {
                isSuperAdmin = true;
            }
        }
        
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Prohibido: Se requiere rol de administrador' }, { status: 403 });
        }

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

        const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
        
        if (!userError && userData?.user?.email) {
            // Protección contra auto-eliminación
            if (userData.user.id === user.id) {
                return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta de administrador.' }, { status: 400 });
            }
        }

        // Intentar eliminar del motor de Auth
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) {
            if (error.message === 'User not found' || (error as any).status === 404) {
                console.log("User not found in Auth, deleting from profiles table anyway.");
            } else {
                console.error("Error deleting user via Admin API:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        // Eliminar también de la tabla profiles por si quedó huérfano
        const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', id);

        if (profileError) {
            console.error("Error deleting profile directly:", profileError);
        }

        return NextResponse.json({ success: true, message: 'Usuario eliminado exitosamente' });

    } catch (error: any) {
        console.error("Internal API error deleting user:", error);
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}
