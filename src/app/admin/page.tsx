"use client";

import { Package, TrendingUp, Users, DollarSign, Loader2, ShoppingBag, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
}

export default function AdminDashboard() {
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const [stats, setStats] = useState<AdminStats>({ totalRevenue: 0, totalOrders: 0, totalProducts: 0 });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [fastStats, setFastStats] = useState({ users: 0, lowStock: 0, todayFormatted: "" });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isInitialized) return;

        const fetchMetrics = async () => {
            try {
                // Fetch Products count and low stock
                const { data: allProducts, count: productCount } = await supabase
                    .from('products')
                    .select('id, stock', { count: 'exact' });

                const lowStockCount = allProducts?.filter(p => (p.stock || 0) < 5).length || 0;

                // Fetch Orders count, revenue, and recent ones
                const { data: orders, error: ordersError } = await supabase
                    .from('orders')
                    .select('id, total, status, user_email, created_at')
                    .order('created_at', { ascending: false });

                let totalRevenue = 0;
                let totalOrders = 0;
                let uniqueUsers = new Set();
                if (!ordersError && orders) {
                    totalOrders = orders.length;
                    totalRevenue = orders.reduce((acc, order) => acc + Number(order.total || 0), 0);
                    // Extract unique emails from orders to simulate User count
                    orders.forEach(o => { if (o.user_email) uniqueUsers.add(o.user_email) });

                    setRecentOrders(orders.slice(0, 3)); // Top 3
                }

                setStats({
                    totalProducts: productCount || 0,
                    totalOrders: totalOrders,
                    totalRevenue: totalRevenue
                });

                setFastStats({
                    users: uniqueUsers.size > 0 ? uniqueUsers.size : 2, // Fallback si no hay compras
                    lowStock: lowStockCount,
                    todayFormatted: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
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
        { title: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingBag, color: "bg-blue-600", shadow: "shadow-[0_0_20px_rgba(37,99,235,0.15)]", trend: "+12% this month" },
        { title: "Total Products", value: stats.totalProducts.toString(), icon: Package, color: "bg-emerald-600", shadow: "shadow-[0_0_20px_rgba(5,150,105,0.15)]", trend: "+5% this month" },
        { title: "Active Users", value: fastStats.users.toString(), icon: Users, color: "bg-purple-600", shadow: "shadow-[0_0_20px_rgba(147,51,234,0.15)]", trend: "+24% this month" },
        { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: "bg-orange-500", shadow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]", trend: "+18% this month" },
    ];

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Dashboard</h1>
                    <p className="text-sm text-gray-400">Welcome back! Here's what's happening with your store today.</p>
                </div>
                <div className="bg-[#1e212b] border border-[#2a2e3b] px-4 py-2 rounded-lg text-sm text-gray-300 flex items-center gap-2 w-fit">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {fastStats.todayFormatted || 'Today'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className={`${stat.color} ${stat.shadow} p-6 rounded-2xl text-white relative overflow-hidden group border border-white/10`}>
                            {/* Decorative background element */}
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>

                            <div className="flex flex-col h-full relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-white/80 text-sm font-medium">{stat.title}</h3>
                                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/10">
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold mb-1 tracking-tight">
                                        {stat.value}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
                                        <TrendingUp className="w-3 h-3" />
                                        {stat.trend}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-[#0c0e15] p-6 rounded-2xl border border-[#1e212b] shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e212b]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#1e212b] rounded-lg text-blue-400">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                        </div>
                        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
                            View all →
                        </button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                <ShoppingBag className="w-8 h-8 opacity-20 mb-2" />
                                <p>No hay pedidos recientes</p>
                            </div>
                        ) : (
                            recentOrders.map((order) => {
                                const statusColors: Record<string, any> = {
                                    'Pendiente': { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
                                    'Pagado': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
                                    'Preparando': { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
                                    'Enviado': { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
                                    'Entregado': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
                                    'Cancelado': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
                                };
                                const sColor = statusColors[order.status || 'Pendiente'] || statusColors['Pendiente'];

                                return (
                                    <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#141722] border border-[#1e212b] rounded-xl hover:border-gray-700 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-[#1e212b] border border-[#2a2e3b] flex items-center justify-center text-sm font-medium text-gray-400 shrink-0">
                                                {order.user_email?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex flex-col w-[120px] sm:w-[150px]">
                                                <p className="font-semibold text-gray-200 truncate" title={order.id}>{order.id.split('-')[0]}</p>
                                                <p className="text-sm text-gray-500 truncate" title={order.user_email}>{order.user_email}</p>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                                            <p className="font-bold text-gray-200">${Number(order.total || 0).toLocaleString("es-AR")}</p>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${sColor.color} ${sColor.bg} ${sColor.border}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-[#0c0e15] p-6 rounded-2xl border border-[#1e212b] shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e212b]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Low Stock Alert</h2>
                        </div>
                        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
                            View all →
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                            fastStats.lowStock > 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                        )}>
                            <Package className="w-8 h-8" />
                        </div>
                        {fastStats.lowStock > 0 ? (
                            <>
                                <p className="text-white font-bold text-2xl">{fastStats.lowStock}</p>
                                <p className="text-red-400 text-sm mt-1">productos con bajo stock</p>
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">Todo el catálogo tiene stock normal</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
