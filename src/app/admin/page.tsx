"use client";

import { Package, TrendingUp, Users, DollarSign, Loader2, ShoppingBag, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
}

export default function AdminDashboard() {
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const [stats, setStats] = useState<AdminStats>({ totalRevenue: 0, totalOrders: 0, totalProducts: 0 });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [fastStats, setFastStats] = useState({ users: 0, lowStock: 0, lowStockItems: [] as any[], todayFormatted: "", trafficData: [] as {label: string, count: number}[] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isInitialized) return;

        const fetchMetrics = async () => {
            try {
                // Fetch Products count and low stock
                const { data: allProducts, count: productCount } = await supabase
                    .from('products')
                    .select('id, name, stock', { count: 'exact' });

                const lowStockItemsData = allProducts?.filter(p => (p.stock || 0) < 5) || [];

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

                const last7Days = Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    d.setHours(0,0,0,0);
                    return { date: d, count: 0, label: d.toLocaleDateString('en-US', { weekday: 'short' }).substring(0,3).toUpperCase() };
                });

                orders?.forEach(order => {
                    const d = new Date(order.created_at);
                    d.setHours(0,0,0,0);
                    const dayObj = last7Days.find(day => day.date.getTime() === d.getTime());
                    if(dayObj) {
                        dayObj.count++;
                    }
                });

                const tData = last7Days.map(day => ({ label: day.label, count: day.count }));

                setFastStats({
                    users: uniqueUsers.size > 0 ? uniqueUsers.size : 2, // Fallback si no hay compras
                    lowStock: lowStockItemsData.length,
                    lowStockItems: lowStockItemsData.slice(0, 3),
                    todayFormatted: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                    trafficData: tData
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
        { title: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingBag, color: "bg-blue-600", colorLight: "bg-black/20", trend: "+12.5%" },
        { title: "Active Products", value: stats.totalProducts.toString(), icon: Package, color: "bg-emerald-500", colorLight: "bg-black/20", trend: "+3.2%" },
        { title: "Total Users", value: `${fastStats.users}`, icon: Users, color: "bg-purple-500", colorLight: "bg-black/20", trend: "+18.1%" },
        { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: "bg-[#ffb37e]", colorLight: "bg-black/10", textColor: "text-black", trend: "+24%" },
    ];

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">Executive Summary</h2>
                    <p className="text-gray-400 mt-1 font-medium">{fastStats.todayFormatted ? `Real-time performance analytics for ${fastStats.todayFormatted}.` : 'Real-time performance analytics.'}</p>
                </div>
            </div>

            {/* Stats Grid: Jewel Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    const isDarkText = stat.textColor === "text-black";
                    return (
                        <div key={stat.title} className={`${stat.color} p-6 rounded-xl relative overflow-hidden group border border-white/5`}>
                            <div className={`relative z-10 ${isDarkText ? 'text-black' : 'text-white'}`}>
                                <div className={`w-12 h-12 rounded-full ${stat.colorLight} flex items-center justify-center mb-4`}>
                                    <Icon className={`w-6 h-6 ${isDarkText ? 'text-black' : 'text-white'}`} />
                                </div>
                                <p className={`${isDarkText ? 'text-black/70' : 'text-white/70'} text-sm font-bold uppercase tracking-widest`}>{stat.title}</p>
                                <div className="flex items-baseline gap-3 mt-1">
                                    <h3 className={`text-3xl font-black ${isDarkText ? 'text-black' : 'text-white'}`}>{stat.value}</h3>
                                    <span className={`text-xs font-bold ${stat.colorLight} px-2 py-0.5 rounded-full`}>{stat.trend}</span>
                                </div>
                            </div>
                            <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                                <Icon className={`w-36 h-36 ${isDarkText ? 'text-black' : 'text-black'}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dashboard Body: Bento Layout */}
            <div className="grid grid-cols-12 gap-8">
                {/* Recent Orders Table Section */}
                <div className="col-span-12 lg:col-span-8 bg-[#0c0e15] border border-[#1e212b] rounded-xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xl font-bold text-white">Recent Orders</h4>
                        <Link href="/admin/orders" className="text-blue-500 text-sm font-bold flex items-center gap-1 hover:underline">
                            View All <span className="text-sm">→</span>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {/* Table Header */}
                        <div className="grid grid-cols-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-4 border-b border-[#1e212b] pb-4">
                            <div className="col-span-2">Customer</div>
                            <div className="hidden sm:block">Order ID</div>
                            <div>Status</div>
                            <div className="text-right">Amount</div>
                        </div>
                        {/* Order Rows */}
                        {recentOrders.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 font-medium">No hay pedidos recientes</div>
                        ) : (
                            recentOrders.map((order) => {
                                const statusColors: Record<string, any> = {
                                    'pending': { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
                                    'paid': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
                                    'shipped': { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
                                    'cancelled': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
                                };
                                const sColor = statusColors[order.status || 'pending'] || statusColors['pending'];
                                
                                const STATUS_LABELS: Record<string, string> = {
                                    'pending': 'PENDIENTE',
                                    'paid': 'PAGADO',
                                    'shipped': 'ENVIADO',
                                    'cancelled': 'CANCELADO'
                                };

                                return (
                                    <div key={order.id} className="grid grid-cols-5 items-center px-4 py-4 rounded-lg hover:bg-[#141722] transition-all cursor-pointer group border border-transparent hover:border-[#1e212b]">
                                        <div className="col-span-2 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-[#1e212b] border border-[#2a2e3b] flex items-center justify-center font-bold text-white shrink-0">
                                                {order.user_email?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-white truncate px-1 text-sm">{order.user_email?.split('@')[0] || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500 truncate px-1 hidden sm:block">{order.user_email}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-400 hidden sm:block">#{order.id.split('-')[0].toUpperCase()}</div>
                                        <div>
                                            <span className={`px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider border ${sColor.color} ${sColor.bg} ${sColor.border}`}>
                                                {STATUS_LABELS[order.status] || 'PENDIENTE'}
                                            </span>
                                        </div>
                                        <div className="text-right font-bold text-white">${Number(order.total || 0).toLocaleString("es-AR")}</div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Stock Alert & Quick Actions Section */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Low Stock Alert */}
                    <section className="bg-[#1a0f0f] border border-red-500/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <h4 className="text-lg font-bold text-red-500">Low Stock Alert</h4>
                        </div>
                        <div className="space-y-4">
                            {fastStats.lowStockItems.length === 0 ? (
                                <div className="text-gray-400 text-sm text-center py-4 bg-[#0c0e15]/50 rounded-lg">All items are sufficiently stocked</div>
                            ) : (
                                fastStats.lowStockItems.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-[#0c0e15]/80 border border-[#1e212b] gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 shrink-0 bg-[#1e212b] rounded-lg flex items-center justify-center text-xs text-gray-400 font-bold">
                                                {item.name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate" title={item.name}>{item.name}</p>
                                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Only {item.stock} left</p>
                                            </div>
                                        </div>
                                        <Link href="/admin/products" className="text-xs font-black text-blue-500 hover:underline uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded w-fit self-end sm:self-auto shrink-0">Restock</Link>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="w-full mt-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-black rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500">
                            Resolve All Critical
                        </button>
                    </section>

                    {/* Quick Insights Chart (Real Data) */}
                    <div className="bg-[#0c0e15] border border-[#1e212b] rounded-xl p-6 shadow-sm h-64 flex flex-col">
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-1">Order Volume (7 Days)</h4>
                        
                        {fastStats.trafficData.every(d => d.count === 0) ? (
                             <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                 <ShoppingBag className="w-8 h-8 mb-2 opacity-20" />
                                 <p className="text-xs font-bold uppercase tracking-widest">No activity yet</p>
                             </div>
                        ) : (
                            <>
                                <div className="flex-1 flex items-end gap-1.5 pb-2 mt-4">
                                    {fastStats.trafficData.map((d, i) => {
                                        const maxCount = Math.max(...fastStats.trafficData.map(data => data.count), 1);
                                        const h = (d.count / maxCount) * 100;
                                        const isHighest = d.count === maxCount && d.count > 0;
                                        return (
                                            <div key={i} className={`w-full ${isHighest ? 'bg-blue-600' : 'bg-[#1e212b]'} rounded-t-sm hover:bg-blue-500 transition-all group relative cursor-pointer`} style={{ height: `${h > 0 ? Math.max(h, 5) : 0}%` }}>
                                                {d.count > 0 && (
                                                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-white opacity-0 group-hover:opacity-100 font-bold transition-opacity z-10 whitespace-nowrap`}>
                                                        {d.count} orders
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 pt-3 border-t border-[#1e212b]">
                                    <span>{fastStats.trafficData[0]?.label}</span>
                                    <span>{fastStats.trafficData[3]?.label}</span>
                                    <span>{fastStats.trafficData[6]?.label}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
