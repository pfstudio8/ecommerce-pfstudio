"use client";
import { FourSquare } from "react-loading-indicators";

import { Package, TrendingUp, Users, DollarSign, Loader2, ShoppingBag, Clock, AlertCircle, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/store/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import('./components/AdminCharts').then(mod => mod.RevenueChart), { ssr: false });
const CategoryPieChart = dynamic(() => import('./components/AdminCharts').then(mod => mod.CategoryPieChart), { ssr: false });

interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
}

export default function AdminDashboard() {
    const isInitialized = useAuthStore((state: any) => state.isInitialized);
    const [stats, setStats] = useState<AdminStats>({ totalRevenue: 0, totalOrders: 0, totalProducts: 0 });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [fastStats, setFastStats] = useState({ users: 0, lowStock: 0, lowStockItems: [] as any[], todayFormatted: "", trafficData: [] as any[], categoryData: [] as any[] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isInitialized) return;

        const fetchMetrics = async () => {
            try {
                const { getDashboardStats } = await import('./actions');
                const result = await getDashboardStats();
                if (result.success && result.stats) {
                    setStats(result.stats);
                    setFastStats(result.fastStats);
                    setRecentOrders(result.recentOrders);
                }

            } catch (err) {
                console.error("Error fetching admin metrics", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [isInitialized]);

    const statCards = [
        { title: "Total de Pedidos", value: stats.totalOrders.toString(), icon: ShoppingBag, trend: "+12.5%", description: "Pedidos procesados y pendientes" },
        { title: "Productos Activos", value: stats.totalProducts.toString(), icon: Package, trend: "+3.2%", description: "Prendas en catálogo actual" },
        { title: "Total de Clientes", value: `${fastStats.users}`, icon: Users, trend: "+18.1%", description: "Clientes registrados con compras" },
        { title: "Ingresos Totales", value: `$${stats.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, trend: "+24.0%", description: "Ventas brutas acumuladas" },
    ];


    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Editorial Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-sans">Panel Principal</h2>
                    <p className="text-on-surface-variant mt-1 text-sm font-medium">
                        {fastStats.todayFormatted ? `Estadísticas de rendimiento en tiempo real para el ${fastStats.todayFormatted}.` : 'Métricas e información del rendimiento de la tienda en tiempo real.'}
                    </p>
                </div>
                
                {/* Quick actions for premium layout */}
                <div className="flex flex-wrap items-center gap-3">
                    <Link 
                        href="/admin/products/create" 
                        className="px-4 py-2 bg-tertiary-container text-on-tertiary-container rounded-xl font-bold text-xs uppercase tracking-wider transition-all  shadow-[0_0_15px_rgba(0,168,122,0.2)] active:scale-[1.02] flex items-center gap-1.5"
                    >
                        Nuevo Producto
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link 
                        href="/admin/categories" 
                        className="px-4 py-2 bg-surface-container-low text-on-surface-variant hover:text-orange-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-outline-variant hover:border-primary active:scale-[1.02]"
                    >
                        Categorías
                    </Link>
                </div>
            </div>

            {/* Stats Grid: Premium Card Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div 
                            key={stat.title} 
                            className="bg-surface-container-low backdrop-blur-md border border-outline-variant p-6 rounded-2xl relative overflow-hidden group hover:border-primary transition-all duration-300 shadow-lg hover:shadow-sm hover:-translate-y-1"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-container border border-primary flex items-center justify-center text-on-primary-container transition-all group-hover:bg-tertiary-container group-hover:text-black">
                                        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    </div>
                                    <span className="text-[10px] font-black tracking-wider text-on-primary-container bg-primary-container border border-primary px-2.5 py-1 rounded-full uppercase">
                                        {stat.trend}
                                    </span>
                                </div>
                                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">{stat.title}</p>
                                <h3 className="text-3xl font-black mt-1 text-on-surface font-sans">{stat.value}</h3>
                                <p className="text-outline text-[10px] mt-2 font-medium">{stat.description}</p>
                            </div>
                            
                            {/* Decorative background glow */}
                            <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-500 pointer-events-none">
                                <Icon className="w-32 h-32 text-primary" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dashboard Body: Bento Layout */}
            <div className="grid grid-cols-12 gap-8">
                {/* Recent Orders Table Section */}
                <div className="col-span-12 lg:col-span-8 bg-surface-container-low backdrop-blur-md border border-outline-variant rounded-2xl p-6 md:p-8 shadow-lg flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h4 className="text-xl font-bold text-on-surface font-sans">Últimas Transacciones</h4>
                                <p className="text-xs text-on-surface-variant mt-1">Revisa las compras recientes realizadas en la tienda.</p>
                            </div>
                            <Link href="/admin/orders" className="text-primary hover:text-emerald-400 text-xs font-bold flex items-center gap-1 hover:underline transition-colors uppercase tracking-wider">
                                Ver Todos <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        
                        <div className="space-y-3 overflow-x-auto">
                            {/* Table Header */}
                            <div className="grid grid-cols-5 text-[10px] font-black uppercase tracking-[0.2em] text-outline px-4 border-b border-outline-variant pb-3 min-w-125">
                                <div className="col-span-2">Cliente</div>
                                <div className="hidden sm:block">ID de Pedido</div>
                                <div>Estado</div>
                                <div className="text-right">Monto</div>
                            </div>
                            
                            {/* Order Rows */}
                            {recentOrders.length === 0 ? (
                                <div className="py-12 text-center text-outline font-medium text-sm">No hay pedidos recientes</div>
                            ) : (
                                recentOrders.map((order) => {
                                    const statusColors: Record<string, any> = {
                                        'pending': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
                                        'paid': { color: 'text-on-primary-container', bg: 'bg-primary-container', border: 'border-primary' },
                                        'shipped': { color: 'text-[#c7ffbc]', bg: 'bg-[#c7ffbc]/10', border: 'border-[#c7ffbc]/20' },
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
                                        <div 
                                            key={order.id} 
                                            className="grid grid-cols-5 items-center px-4 py-3.5 rounded-xl hover:bg-surface-container-highest/30 transition-all cursor-pointer group border border-transparent hover:border-outline-variant min-w-125"
                                        >
                                            <div className="col-span-2 flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-bold text-primary shrink-0 transition-colors group-hover:border-primary">
                                                    {order.customer_email?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-bold text-on-surface truncate px-1 text-sm transition-colors group-hover:text-on-surface">
                                                        {order.customer_email?.split('@')[0] || 'Desconocido'}
                                                    </p>
                                                    <p className="text-xs text-outline truncate px-1 hidden sm:block">
                                                        {order.customer_email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-on-surface-variant hidden sm:block">
                                                #{order.id.split('-')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                                    sColor.color, sColor.bg, sColor.border
                                                )}>
                                                    {STATUS_LABELS[order.status] || 'PENDIENTE'}
                                                </span>
                                            </div>
                                            <div className="text-right font-bold text-on-surface text-sm">
                                                ${Number(order.total || 0).toLocaleString("es-AR")}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Stock Alert & Quick Insights Section */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Low Stock Alert */}
                    <section className="bg-error-container/60 backdrop-blur-md border border-error/20 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-500/10 rounded-xl border border-error/20">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-red-400 font-sans">Alerta de Stock Bajo</h4>
                                    <p className="text-[10px] text-red-400/80 mt-0.5">Artículos críticos con menos de 5 unidades.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {fastStats.lowStockItems.length === 0 ? (
                                    <div className="text-on-surface-variant text-xs text-center py-6 bg-surface-container-low/40 border border-outline-variant rounded-xl">
                                        Todos los productos tienen stock suficiente
                                    </div>
                                ) : (
                                    fastStats.lowStockItems.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant gap-3 hover:border-red-500/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-9 h-9 shrink-0 bg-surface-container-highest border border-outline-variant rounded-lg flex items-center justify-center text-xs text-on-surface-variant font-bold uppercase">
                                                    {item.name?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-on-surface truncate" title={item.name}>{item.name}</p>
                                                    <p className="text-[9px] text-red-400 font-black uppercase tracking-wider mt-0.5">
                                                        Solo quedan {item.stock} unidades
                                                    </p>
                                                </div>
                                            </div>
                                            <Link 
                                                href="/admin/products" 
                                                className="text-[9px] font-black text-on-primary-container hover:underline uppercase tracking-wider bg-primary-container px-2 py-1.5 rounded-lg border border-primary shrink-0"
                                            >
                                                Reabastecer
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        
                        <Link 
                            href="/admin/products" 
                            className="w-full mt-6 py-2.5 bg-red-500/10 border border-error/20 hover:bg-red-500 hover:text-black text-red-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-all block text-center"
                        >
                            Gestionar Stock Crítico
                        </Link>
                    </section>

                    {/* Charts Section: Recharts */}
                    <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant rounded-2xl p-6 shadow-lg flex flex-col gap-8 h-auto">
                        <div>
                            <h4 className="text-sm font-bold text-on-surface font-sans">Evolución de Ingresos (Últimos 7 días)</h4>
                            <div className="h-64 mt-4">
                                <RevenueChart data={fastStats.trafficData} />
                            </div>
                        </div>

                        <div className="border-t border-outline-variant pt-8">
                            <h4 className="text-sm font-bold text-on-surface font-sans">Ventas por Categoría</h4>
                            <div className="h-64 mt-4 flex flex-col sm:flex-row items-center">
                                <div className="w-full h-full min-h-50 sm:w-[60%]">
                                    <CategoryPieChart data={fastStats.categoryData} />
                                </div>
                                <div className="sm:ml-4 mt-4 sm:mt-0 space-y-2 shrink-0">
                                    {fastStats.categoryData?.map((entry: any, index: number) => (
                                        <div key={index} className="flex items-center gap-2 text-xs text-outline">
                                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ['#00A87A', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'][index % 6] }}></div>
                                            <span className="font-medium text-on-surface-variant capitalize">{entry.name} ({entry.value})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
