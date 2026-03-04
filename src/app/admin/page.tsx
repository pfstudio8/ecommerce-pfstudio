"use client";

import { Package, TrendingUp, Users, DollarSign, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
}

export default function AdminDashboard() {
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const [stats, setStats] = useState<AdminStats>({ totalRevenue: 0, totalOrders: 0, totalProducts: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isInitialized) return;

        const fetchMetrics = async () => {
            try {
                // Fetch Products count
                const { count: productCount, error: productError } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });

                // Fetch Orders count & total revenue
                // This assumes the admin has RLS permission to read all orders (created in SQL script)
                const { data: orders, error: ordersError } = await supabase
                    .from('orders')
                    .select('total');

                let totalRevenue = 0;
                let totalOrders = 0;

                if (!ordersError && orders) {
                    totalOrders = orders.length;
                    totalRevenue = orders.reduce((acc, order) => acc + Number(order.total), 0);
                }

                setStats({
                    totalProducts: productCount || 0,
                    totalOrders: totalOrders,
                    totalRevenue: totalRevenue
                });

            } catch (err) {
                console.error("Error fetching admin metrics", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [isInitialized]);

    const statCards = [
        { title: "Ingresos Brutos", value: `$${stats.totalRevenue.toLocaleString("es-AR")}`, icon: DollarSign, trend: "Real" },
        { title: "Pedidos Emitidos", value: stats.totalOrders.toString(), icon: TrendingUp, trend: "Real" },
        { title: "Productos Activos", value: stats.totalProducts.toString(), icon: Package, trend: "Real" },
        { title: "Clientes (Roles)", value: "Proximamente", icon: Users, trend: "WIP" },
    ];

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Resumen General</h1>
                <p className="text-gray-500">Bienvenido al panel de administración de PFSTUDIO.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                                <div className="p-2 bg-[var(--color-main)]/10 text-[var(--color-main)] rounded-lg">
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className={stat.value === "Proximamente" ? "text-lg font-semibold text-gray-400" : "text-3xl font-bold"}>
                                    {stat.value}
                                </span>
                                <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Actividad Reciente</h2>
                <div className="text-gray-500 text-sm text-center py-10">
                    <p>En el futuro podrás ver aquí los últimos pedidos generados minuto a minuto.</p>
                </div>
            </div>
        </div>
    );
}
