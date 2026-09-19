"use server";

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function getAdminUsers() {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();
        
        // Ensure user is admin before returning data
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
            throw new Error("No autenticado");
        }
        
        const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
        const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());
        
        if (!adminEmails.includes(user.email.toLowerCase())) {
            throw new Error("No autorizado");
        }

        // Fetch all registered users
        const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
        if (authError) {
            throw new Error("Could not fetch auth users: " + authError.message);
        }

        const userList: any[] = [];
        if (authUsers && authUsers.users) {
            authUsers.users.forEach((u) => {
                const email = u.email || 'Sin Correo';
                userList.push({
                    id: u.id,
                    email,
                    firstSeen: u.created_at,
                    lastSeen: u.last_sign_in_at || u.created_at,
                    isAdmin: adminEmails.includes(email.toLowerCase())
                });
            });
        }

        userList.sort((a: any, b: any) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime());

        return { success: true, data: userList };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
