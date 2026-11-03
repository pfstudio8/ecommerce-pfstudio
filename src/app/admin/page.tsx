"use client";

import { Package, Users, DollarSign, ShoppingBag, Clock, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth";
import Link from "next/link";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import('./components/AdminCharts').then(mod => mod.RevenueChart), { ssr: false });
const CategoryPieChart = dynamic(() => import('./components/AdminCharts').then(mod => mod.CategoryPieChart), { ssr: false });

interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    paidOrdersCount?: number;
    pendingOrdersCount?: number;
    totalProducts: number;
}

export default function AdminDashboard() {
    const isInitialized = useAuthStore((state: any) => state.isInitialized);
    const [stats, setStats] = useState<AdminStats>({ 
        totalRevenue: 0, 
        totalOrders: 0, 
        paidOrdersCount: 0, 
        pendingOrdersCount: 0, 
        totalProducts: 0 
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [fastStats, setFastStats] = useState({ 
        users: 0, 
        lowStock: 0, 
        lowStockItems: [] as any[], 
        todayFormatted: "", 
        trafficData: [] as any[], 
        categoryData: [] as any[] 
    });
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
        { 
            title: "Ingresos Confirmados", 
            value: `$${stats.totalRevenue.toLocaleString("es-AR")}`, 
            icon: DollarSign, 
            badge: "Solo Pagados",
            badgeColor: "bg-tertiary-container text-black border-emerald-500",
            description: "Total acreditado por transferencias confirmadas" 
        },
        { 
            title: "Pedidos Pagados", 
            value: `${stats.paidOrdersCount || 0} de ${stats.totalOrders}`, 
            icon: ShoppingBag, 
            badge: `${stats.totalOrders} Totales`,
            badgeColor: "bg-primary-container text-on-primary-container border-primary",
            description: "Órdenes con pago verificado y stock descontado" 
        },
        { 
            title: "Por Confirmar", 
            value: `${stats.pendingOrdersCount || 0}`, 
            icon: Clock, 
            badge: (stats.pendingOrdersCount || 0) > 0 ? "Atención" : "Al día",
            badgeColor: (stats.pendingOrdersCount || 0) > 0 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-surface text-outline border-outline-variant",
            description: "Transferencias pendientes de confirmación",
            href: "/admin/orders?filter=pending"
        },
        { 
            title: "Catálogo Activo", 
            value: `${stats.totalProducts}`, 
            icon: Package, 
            badge: `${fastStats.lowStock} Bajo Stock`,
            badgeColor: fastStats.lowStock > 0 ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-surface text-outline border-outline-variant",
            description: "Productos activos en catálogo público" 
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-sans">Panel Principal</h2>
                    <p className="text-on-surface-variant mt-1 text-sm font-medium">
                        {fastStats.todayFormatted ? `Métricas en tiempo real para el ${fastStats.todayFormatted}.` : 'Métricas del taller e inventario en tiempo real.'}
                    </p>
                </div>
                
                {/* Quick actions */}
                <div className="flex flex-wrap items-center gap-3">
                    <Link 
                        href="/admin/inventory" 
                        className="px-4 py-2 bg-surface-container-low text-on-surface-variant hover:text-primary rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-outline-variant hover:border-primary active:scale-[1.02]"
                    >
                        Inventario
                    </Link>
                    <Link 
                        href="/admin/products/create" 
                        className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:bg-primary-dark active:scale-[1.02] flex items-center gap-1.5"
                    >
                        Nuevo Producto
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
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
                                    <div className="w-12 h-12 rounded-xl bg-primary-container border border-primary flex items-center justify-center text-on-primary-container transition-all group-hover:bg-primary group-hover:text-on-primary">
                                        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    </div>
                                    <span className={`text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full uppercase border ${stat.badgeColor}`}>
                                        {stat.badge}
                                    </span>
                                </div>
                                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">{stat.title}</p>
                                <h3 className="text-3xl font-black mt-1 text-on-surface font-sans">{stat.value}</h3>
                                <p className="text-outline text-[11px] mt-2 font-medium">{stat.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant p-6 rounded-2xl shadow-lg">
                    <h3 className="text-base font-bold text-on-surface mb-1">Ingresos de los Últimos 7 Días</h3>
                    <p className="text-xs text-outline mb-6">Basado exclusivamente en órdenes confirmadas y pagadas.</p>
                    <RevenueChart data={fastStats.trafficData} />
                </div>
                <div className="bg-surface-container-low border border-outline-variant p-6 rounded-2xl shadow-lg">
                    <h3 className="text-base font-bold text-on-surface mb-1">Ventas por Categoría</h3>
                    <p className="text-xs text-outline mb-6">Distribución de artículos pagados por categoría.</p>
                    <CategoryPieChart data={fastStats.categoryData} />
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-outline-variant flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-on-surface font-sans">Pedidos Recientes</h3>
                        <p className="text-xs text-outline mt-0.5">Últimas 5 transacciones registradas en el sistema.</p>
                    </div>
                    <Link href="/admin/orders" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
                        Ver Todos los Pedidos →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant bg-surface text-[10px] font-black text-outline uppercase tracking-widest">
                                <th className="px-6 py-4">ID Pedido</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant text-sm">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-outline">
                                        No hay pedidos recientes.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-primary">
                                            #{order.id.split('-')[0].toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface">
                                            {order.customer_email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                order.status === 'paid' ? 'bg-tertiary-container text-black border-emerald-500' :
                                                order.status === 'shipped' ? 'bg-blue-500/20 text-blue-300 border-blue-400' :
                                                order.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                                'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                            }`}>
                                                {order.status === 'paid' ? 'Pagado' :
                                                 order.status === 'shipped' ? 'Enviado' :
                                                 order.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant text-xs">
                                            {new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-on-surface">
                                            ${Number(order.total || 0).toLocaleString('es-AR')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
