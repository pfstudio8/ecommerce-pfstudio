"use server";

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function getAdminCustomers() {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();
        
        // Ensure user has admin/employee role
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
            throw new Error("No autenticado");
        }
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthorized = profile && ['admin', 'employee'].includes(profile.role);
        if (!isAuthorized) {
            const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
            const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());
            if (!adminEmails.includes(user.email.toLowerCase())) {
                throw new Error("No autorizado");
            }
        }

        // Fetch profiles to map roles and full names
        const { data: profilesData } = await adminClient
            .from('profiles')
            .select('id, email, full_name, role');

        const profileByEmail = new Map<string, any>();
        (profilesData || []).forEach(p => {
            if (p.email) profileByEmail.set(p.email.toLowerCase(), p);
        });

        // Fetch orders and aggregate by email
        const { data: ordersData, error: ordersError } = await adminClient
            .from('orders')
            .select('customer_email, total_amount, created_at, user_id, status');

        if (ordersError) {
            throw new Error("Could not fetch orders: " + ordersError.message);
        }

        const statsMap = new Map<string, any>();
        
        (ordersData || []).forEach((o: any) => {
            const email = o.customer_email || 'Sin Correo';
            const emailKey = email.toLowerCase();
            const matchedProfile = profileByEmail.get(emailKey);
            const userRole = matchedProfile?.role || 'customer';

            const existing = statsMap.get(emailKey) || {
                id: o.user_id || matchedProfile?.id,
                email,
                name: matchedProfile?.full_name || '',
                role: userRole,
                totalOrders: 0,
                totalSpent: 0,
                firstSeen: o.created_at,
                lastSeen: o.created_at,
                isAdmin: userRole === 'admin' || userRole === 'employee'
            };
            existing.totalOrders += 1;
            existing.totalSpent += Number(o.total_amount || 0);
            if (new Date(o.created_at) < new Date(existing.firstSeen)) existing.firstSeen = o.created_at;
            if (new Date(o.created_at) > new Date(existing.lastSeen)) existing.lastSeen = o.created_at;
            statsMap.set(emailKey, existing);
        });

        const userList = Array.from(statsMap.values());
        userList.sort((a: any, b: any) => b.totalSpent - a.totalSpent);

        return { success: true, data: userList };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
