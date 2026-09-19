"use server";

import { createAdminClient } from '@/utils/supabase/admin';

export async function getDashboardStats() {
    const supabase = createAdminClient();

    try {
        // Fetch minimal data for orders aggregation
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('total_amount, customer_email, created_at, status');

        if (ordersError) throw new Error(ordersError.message);

        // Calculate aggregates on the server side
        let totalRevenue = 0;
        let totalOrders = 0;
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
                totalRevenue += Number(order.total_amount || 0);
                if (order.customer_email) uniqueUsers.add(order.customer_email);

                const d = new Date(order.created_at);
                d.setHours(0,0,0,0);
                const dayTime = d.getTime();
                const dayObj = last7Days.find(day => day.date === dayTime);
                if (dayObj) {
                    dayObj.count++;
                    dayObj.revenue += Number(order.total_amount || 0);
                }
            });
        }

        // Fetch Recent Orders (Top 5)
        const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, total_amount as total, status, customer_email, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        // Fetch Products count and low stock
        const { count: productCount } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true });

        const { data: lowStockItemsData } = await supabase
            .from('products')
            .select('id, name, stock')
            .lt('stock', 5)
            .limit(3);

        const { count: lowStockCount } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .lt('stock', 5);

        // Fetch categories data for pie chart
        const { data: orderItems } = await supabase
            .from('order_items')
            .select('quantity, products(category)');
            
        const categorySales: Record<string, number> = {};
        if (orderItems) {
            orderItems.forEach((item: any) => {
                const category = item.products?.category || 'Otros';
                categorySales[category] = (categorySales[category] || 0) + item.quantity;
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
                totalProducts: productCount || 0
            },
            fastStats: {
                users: uniqueUsers.size > 0 ? uniqueUsers.size : 2,
                lowStock: lowStockCount || 0,
                lowStockItems: lowStockItemsData || [],
                todayFormatted: new Date().toLocaleDateString('es-AR', { weekday: 'long', month: 'long', day: 'numeric' }),
                trafficData: last7Days.map(d => ({ label: d.label, count: d.count, revenue: d.revenue })),
                categoryData: categoryData.length > 0 ? categoryData : [{ name: 'Sin Ventas', value: 1 }]
            },
            recentOrders: recentOrders || []
        };

    } catch (error: any) {
        console.error("Server Action getDashboardStats error:", error);
        return { success: false, error: error.message };
    }
}
