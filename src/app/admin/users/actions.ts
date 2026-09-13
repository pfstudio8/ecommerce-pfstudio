"use server";

import { createClient } from '@/utils/supabase/server';

export async function getAdminUsers() {
    try {
        const supabase = await createClient();
        
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

        // Aggregate customer profiles from orders
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('customer_email, total_amount, created_at, user_id');

        if (ordersError) {
            throw new Error("Could not fetch orders: " + ordersError.message);
        }

        const statsMap = new Map<string, any>();
        (ordersData || []).forEach((o: any) => {
            const email = o.customer_email || 'Sin Correo';
            const existing = statsMap.get(email) || {
                id: o.user_id,
                email,
                totalOrders: 0,
                totalSpent: 0,
                firstSeen: o.created_at,
                lastSeen: o.created_at,
                isAdmin: adminEmails.includes(email.toLowerCase())
            };
            existing.totalOrders += 1;
            existing.totalSpent += Number(o.total_amount || 0);
            if (new Date(o.created_at) < new Date(existing.firstSeen)) existing.firstSeen = o.created_at;
            if (new Date(o.created_at) > new Date(existing.lastSeen)) existing.lastSeen = o.created_at;
            statsMap.set(email, existing);
        });

        const userList = Array.from(statsMap.values());
        userList.sort((a: any, b: any) => b.totalSpent - a.totalSpent);

        return { success: true, data: userList };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
