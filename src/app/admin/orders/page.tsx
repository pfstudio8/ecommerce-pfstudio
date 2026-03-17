"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, Search, Loader2, Package, ArrowRight, Truck, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { sileo } from "sileo";

interface Order {
    id: string;
    user_id: string;
    customer_email: string;
    status: string;
    total_amount: number;
    order_items: any[];
    created_at: string;
    tracking_number?: string;
    carrier?: string;
}

const STATUS_COLORS: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
    'paid': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'shipped': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'shipped': 'Enviado',
    'cancelled': 'Cancelado'
};

export default function AdminOrdersPage() {
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
    // Tracking form states
    const [trackingNumber, setTrackingNumber] = useState("");
    const [carrier, setCarrier] = useState("");
    const [isSavingTracking, setIsSavingTracking] = useState(false);

    useEffect(() => {
        if (selectedOrder) {
            setTrackingNumber(selectedOrder.tracking_number || "");
            setCarrier(selectedOrder.carrier || "");
        }
    }, [selectedOrder]);

    useEffect(() => {
        if (!isInitialized) return;

        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*, products(name, images))')
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

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer y eliminará los artículos asociados.")) return;
        
        setDeletingId(orderId);
        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;

            setOrders(orders.filter(o => o.id !== orderId));
            sileo.success({ title: "Pedido eliminado correctamente." });
        } catch (err) {
            console.error("Error deleting order", err);
            sileo.error({ title: "No se pudo eliminar el pedido. Revisa los permisos." });
        } finally {
            setDeletingId(null);
        }
    };

    const handleSaveTracking = async () => {
        if (!selectedOrder) return;
        setIsSavingTracking(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ tracking_number: trackingNumber, carrier: carrier })
                .eq('id', selectedOrder.id);

            if (error) throw error;

            sileo.success({ title: "Datos de envío guardados" });
            
            // Update local state
            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, tracking_number: trackingNumber, carrier: carrier } : o));
            setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber, carrier: carrier });
            
        } catch (err) {
            console.error("Error updating tracking", err);
            sileo.error({ title: "No se pudo guardar la información de envío" });
        } finally {
            setIsSavingTracking(false);
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
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
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
                                            <div className="font-medium text-[var(--foreground)] truncate max-w-[200px]" title={order.customer_email}>
                                                {order.customer_email || 'Usuario Desconocido'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[var(--color-main)]">
                                                ${(order.total_amount || 0).toLocaleString("es-AR")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-center sm:text-left">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                            >
                                                <Package className="w-3.5 h-3.5" />
                                                {order.order_items?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 0}
                                                <span className="sr-only">Ver artículos</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    disabled={updatingId === order.id}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border-none outline-none appearance-none cursor-pointer disabled:opacity-50 transition-colors ${STATUS_COLORS[order.status] || STATUS_COLORS['pending']}`}
                                                >
                                                    {STATUS_OPTIONS.map(status => (
                                                        <option key={status} value={status} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                                                            {STATUS_LABELS[status]}
                                                        </option>
                                                    ))}
                                                </select>
                                                {updatingId === order.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteOrder(order.id)}
                                                disabled={deletingId === order.id}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                                title="Eliminar pedido"
                                            >
                                                {deletingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Artículos */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Artículos del Pedido
                            </h3>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                            {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                                selectedOrder.order_items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                                        {item.products?.images && item.products.images.length > 0 && (
                                            <img src={item.products.images[0]} alt={item.products.name} className="w-16 h-16 object-cover rounded-lg bg-gray-200 dark:bg-zinc-700" />
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{item.products?.name || `Producto no disponible`}</h4>
                                            <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                                                <p>Talla: <span className="font-medium text-gray-700 dark:text-gray-300">{item.size}</span></p>
                                                <p>Cantidad: <span className="font-medium text-gray-700 dark:text-gray-300">{item.quantity}</span></p>
                                                <p>Precio histórico: <span className="font-medium text-gray-700 dark:text-gray-300">${(item.price_at_purchase || 0).toLocaleString("es-AR")}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">No hay artículos detallados para este pedido.</p>
                            )}
                        </div>
                        
                        {/* Tracking Section */}
                        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
                            <h4 className="font-semibold text-sm text-[var(--foreground)] mb-3 flex items-center gap-2">
                                <Truck className="w-4 h-4" /> Seguimiento de Envío
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Correo (ej. Andreani, OCA)</label>
                                    <input 
                                        type="text" 
                                        value={carrier}
                                        onChange={(e) => setCarrier(e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-[var(--color-main)]" 
                                        placeholder="Empresa de correo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Código de Seguimiento</label>
                                    <input 
                                        type="text" 
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-[var(--color-main)]" 
                                        placeholder="Ej. AB123456789AR"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSaveTracking}
                                disabled={isSavingTracking}
                                className="w-full py-2 bg-[var(--foreground)] text-[var(--background)] hover:bg-gray-800 dark:hover:bg-gray-200 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {isSavingTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Seguimiento"}
                            </button>
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 text-right">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-5 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
