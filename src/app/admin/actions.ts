"use server";

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function getDashboardStats() {
    try {
        const supabaseAuth = await createClient();
        const supabase = createAdminClient();

        // Ensure user has admin/employee role before returning data
        const { data: { user } } = await supabaseAuth.auth.getUser();
        if (!user || !user.email) {
            throw new Error("No autenticado");
        }
        
        const { data: profile } = await supabaseAuth
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

        // Fetch minimal data for orders aggregation
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, total_amount, customer_email, created_at, status');

        if (ordersError) throw new Error(ordersError.message);

        // Calculate aggregates: Total revenue ONLY from paid orders ('paid' or 'shipped')
        let totalRevenue = 0;
        let totalOrders = 0;
        let paidOrdersCount = 0;
        let pendingOrdersCount = 0;
        const uniqueUsers = new Set();

        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0,0,0,0);
            return { date: d.getTime(), count: 0, revenue: 0, label: d.toLocaleDateString('es-AR', { weekday: 'short' }).substring(0,3).toUpperCase() };
        });

        if (orders) {
            totalOrders = orders.length;
            orders.forEach(order => {
                const isPaid = order.status === 'paid' || order.status === 'shipped';
                
                if (isPaid) {
                    totalRevenue += Number(order.total_amount || 0);
                    paidOrdersCount++;
                    if (order.customer_email) uniqueUsers.add(order.customer_email);
                } else if (order.status === 'pending') {
                    pendingOrdersCount++;
                }

                const d = new Date(order.created_at);
                d.setHours(0,0,0,0);
                const dayTime = d.getTime();
                const dayObj = last7Days.find(day => day.date === dayTime);
                if (dayObj) {
                    dayObj.count++;
                    if (isPaid) {
                        dayObj.revenue += Number(order.total_amount || 0);
                    }
                }
            });
        }

        // Fetch Recent Orders (Top 5)
        const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, total_amount as total, status, customer_email, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        // Fetch Products count and low stock (considering active products)
        const { count: productCount } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('active', true);

        const { data: lowStockItemsData } = await supabase
            .from('products')
            .select('id, name, stock')
            .eq('active', true)
            .lt('stock', 5)
            .limit(3);

        const { count: lowStockCount } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('active', true)
            .lt('stock', 5);

        // Fetch categories data for pie chart: only include items from paid orders
        const { data: orderItems } = await supabase
            .from('order_items')
            .select('quantity, products(category), orders(status)');
            
        const categorySales: Record<string, number> = {};
        if (orderItems) {
            orderItems.forEach((item: any) => {
                const orderStatus = item.orders?.status;
                if (orderStatus === 'paid' || orderStatus === 'shipped') {
                    const category = item.products?.category || 'Otros';
                    categorySales[category] = (categorySales[category] || 0) + item.quantity;
                }
            });
        }
        const categoryData = Object.keys(categorySales).map(key => ({
            name: key,
            value: categorySales[key]
        }));

        return {
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                paidOrdersCount,
                pendingOrdersCount,
                totalProducts: productCount || 0
            },
            fastStats: {
                users: uniqueUsers.size > 0 ? uniqueUsers.size : 0,
                lowStock: lowStockCount || 0,
                lowStockItems: lowStockItemsData || [],
                todayFormatted: new Date().toLocaleDateString('es-AR', { weekday: 'long', month: 'long', day: 'numeric' }),
                trafficData: last7Days.map(d => ({ label: d.label, count: d.count, revenue: d.revenue })),
                categoryData: categoryData.length > 0 ? categoryData : [{ name: 'Sin Ventas Pagadas', value: 1 }]
            },
            recentOrders: recentOrders || []
        };

    } catch (error: any) {
        console.error("Server Action getDashboardStats error:", error);
        return { success: false, error: error.message };
    }
}
