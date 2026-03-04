"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, Search, Loader2, Package, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface Order {
    id: string;
    user_id: string;
    user_email: string;
    status: string;
    total: number;
    items: any[];
    created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
    'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
    'Pagado': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Preparando': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'Enviado': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'Entregado': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
    'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

const STATUS_OPTIONS = ['Pendiente', 'Pagado', 'Preparando', 'Enviado', 'Entregado', 'Cancelado'];

export default function AdminOrdersPage() {
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isInitialized) return;

        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching admin orders. Table might not exist or missing RLS.", error);
                } else if (data) {
                    setOrders(data);
                }
            } catch (err) {
                console.error("Fetch orders failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [isInitialized]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            // Optimistic UI update
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error("Error updating order status", err);
            alert("No se pudo actualizar el estado.");
        } finally {
            setUpdatingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Pedidos</h1>
                    <p className="text-gray-500">Administra y actualiza el estado de las órdenes.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">ID Pedido / Fecha</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Monto</th>
                                <th className="px-6 py-4">Artículos</th>
                                <th className="px-6 py-4">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        No hay pedidos registrados. Ejecuta el script SQL para iniciar.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-gray-500 mb-1" title={order.id}>
                                                {order.id.split('-')[0]}...
                                            </div>
                                            <div className="font-medium text-[var(--foreground)]">
                                                {new Date(order.created_at).toLocaleDateString('es-AR', {
                                                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-[var(--foreground)] truncate max-w-[200px]" title={order.user_email}>
                                                {order.user_email || 'Usuario Desconocido'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[var(--color-main)]">
                                                ${order.total.toLocaleString("es-AR")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-center sm:text-left">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 font-medium">
                                                <Package className="w-3.5 h-3.5" />
                                                {order.items?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    disabled={updatingId === order.id}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border-none outline-none appearance-none cursor-pointer disabled:opacity-50 transition-colors ${STATUS_COLORS[order.status] || STATUS_COLORS['Pendiente']}`}
                                                >
                                                    {STATUS_OPTIONS.map(status => (
                                                        <option key={status} value={status} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                                {updatingId === order.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                                            </div>
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
