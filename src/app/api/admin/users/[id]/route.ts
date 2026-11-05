import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireAdmin } from '@/utils/supabase/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { user } = await requireAdmin(supabase);

        const params = await props.params;
        const { id } = params;

        const supabaseAdmin = createAdminClient();

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
