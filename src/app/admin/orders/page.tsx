"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DollarSign, ShoppingBag, TrendingUp, Filter, Download, Package, Truck, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
    'pending': 'bg-[#006c49]/30 text-[#69f6b8] border-[#69f6b8]/20',
    'paid': 'bg-[#85adff]/20 text-[#85adff] border-[#85adff]/20',
    'shipped': 'bg-[#ac8aff]/20 text-[#ac8aff] border-[#ac8aff]/20',
    'cancelled': 'bg-[#9f0519]/30 text-[#ff716c] border-[#ff716c]/20',
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
            
            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, tracking_number: trackingNumber, carrier: carrier } : o));
            setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber, carrier: carrier });
            
        } catch (err) {
            console.error("Error updating tracking", err);
            sileo.error({ title: "No se pudo guardar la información de envío" });
        } finally {
            setIsSavingTracking(false);
        }
    };

    // Calculations for Charts
    const velocityData = orders.slice(0, 7).reverse().map(order => {
        const maxAmount = Math.max(...orders.slice(0, 7).map(o => o.total_amount || 0));
        const isActive = ['pending', 'paid'].includes(order.status);
        const finalHeight = Math.max(10, maxAmount > 0 ? ((order.total_amount || 0) / maxAmount) * 100 : 10);
        return { id: order.id, isActive, heightClass: `${finalHeight}%`, amount: order.total_amount };
    });

    const pendingCount = orders.filter(o => ['pending', 'paid'].includes(o.status)).length;
    const shippedCount = orders.filter(o => o.status === 'shipped').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
    const totalCount = orders.length || 1; // avoid division by zero
    const statusDist = {
        pendingPct: Math.round((pendingCount / totalCount) * 100),
        shippedPct: Math.round((shippedCount / totalCount) * 100),
        cancelledPct: Math.round((cancelledCount / totalCount) * 100)
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#85adff]" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            
            {/* Dashboard Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gradient-to-br from-[#85adff] to-[#699cff] p-6 rounded-xl shadow-[0_24px_48px_-12px_rgba(133,173,255,0.2)]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center">
                            <DollarSign className="text-[#002c66] w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full text-[#002c66]">+12.5%</span>
                    </div>
                    <p className="font-['Inter'] text-sm font-medium text-[#002c66]">Total Revenue</p>
                    <h2 className="font-sans text-3xl font-extrabold text-[#000000] mt-1">
                        ${orders.reduce((acc, order) => acc + (order.total_amount || 0), 0).toLocaleString('es-AR')}
                    </h2>
                </div>

                <div className="bg-[#19191c] p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#69f6b8]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-12 h-12 bg-[#262528] rounded-full flex items-center justify-center">
                            <ShoppingBag className="text-[#69f6b8] w-6 h-6" />
                        </div>
                    </div>
                    <p className="font-['Inter'] text-sm font-medium text-[#adaaad] relative z-10">Active Orders</p>
                    <h2 className="font-sans text-3xl font-extrabold text-[#f9f5f8] mt-1 relative z-10">{orders.length}</h2>
                </div>

                <div className="bg-[#19191c] p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ac8aff]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-12 h-12 bg-[#262528] rounded-full flex items-center justify-center">
                            <TrendingUp className="text-[#ac8aff] w-6 h-6" />
                        </div>
                    </div>
                    <p className="font-['Inter'] text-sm font-medium text-[#adaaad] relative z-10">Avg. Order Value</p>
                    <h2 className="font-sans text-3xl font-extrabold text-[#f9f5f8] mt-1 relative z-10">
                        ${orders.length > 0 ? Math.round(orders.reduce((acc, order) => acc + (order.total_amount || 0), 0) / orders.length).toLocaleString('es-AR') : '0'}
                    </h2>
                </div>
            </div>

            {/* Orders Table Section */}
            <div className="bg-[#19191c] rounded-xl overflow-hidden shadow-2xl border border-[#48474a]/10">
                <div className="px-8 py-6 flex flex-col md:flex-row md:justify-between md:items-center border-b border-[#48474a]/20 gap-4">
                    <div>
                        <h3 className="font-sans text-xl font-bold text-[#f9f5f8]">Recent Orders</h3>
                        <p className="text-sm text-[#adaaad]">Tracking and managing current sales activity</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-[#262528] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#2c2c2f] transition-colors text-[#f9f5f8]">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                        <button className="bg-[#262528] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#2c2c2f] transition-colors text-[#f9f5f8]">
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#131315]/50 border-b border-[#48474a]/10">
                                <th className="px-8 py-4 font-sans text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad]">Order ID</th>
                                <th className="px-8 py-4 font-sans text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad]">Date</th>
                                <th className="px-8 py-4 font-sans text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad]">Customer</th>
                                <th className="px-8 py-4 font-sans text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad]">Amount</th>
                                <th className="px-8 py-4 font-sans text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad]">Status</th>
                                <th className="px-8 py-4 font-sans text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#48474a]/10">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-[#adaaad]">
                                        No hay pedidos registrados
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#1f1f22] transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-sm font-bold text-[#85adff]">#{order.id.split('-')[0].toUpperCase()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm text-[#adaaad]">
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: '2-digit', year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#262528] overflow-hidden border border-[#48474a]/20 flex items-center justify-center text-[#85adff] font-bold text-xs uppercase cursor-pointer" onClick={() => setSelectedOrder(order)} title="Ver Detalles">
                                                    {order.customer_email.split('@')[0].substring(0, 2)}
                                                </div>
                                                <span className="text-sm font-medium text-[#f9f5f8] truncate max-w-[150px] cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)} title={order.customer_email}>
                                                    {order.customer_email.split('@')[0]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-[#f9f5f8]">${(order.total_amount || 0).toLocaleString("es-AR")}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    disabled={updatingId === order.id}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors outline-none cursor-pointer appearance-none ${STATUS_COLORS[order.status] || STATUS_COLORS['pending']}`}
                                                >
                                                    {STATUS_OPTIONS.map(status => (
                                                        <option key={status} value={status} className="bg-[#1f1f22] text-[#f9f5f8]">
                                                            {STATUS_LABELS[status]}
                                                        </option>
                                                    ))}
                                                </select>
                                                {updatingId === order.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#adaaad]" />}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleDeleteOrder(order.id)}
                                                disabled={deletingId === order.id}
                                                className="p-2 hover:bg-[#2c2c2f] rounded-full text-red-500/80 hover:text-red-500 transition-all disabled:opacity-50"
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

                {/* Pagination */}
                <div className="px-8 py-6 bg-[#131315]/30 border-t border-[#48474a]/10 flex items-center justify-between">
                    <p className="text-xs text-[#adaaad] font-medium">Showing <span className="text-[#f9f5f8]">{orders.length > 0 ? 1 : 0}-{orders.length}</span> of <span className="text-[#f9f5f8]">{orders.length}</span> entries</p>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#262528] text-[#f9f5f8] hover:bg-[#2c2c2f] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#85adff] text-[#000000] font-bold text-xs">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#262528] text-[#f9f5f8] hover:bg-[#2c2c2f] transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Summary Analysis (Asymmetric/Bento Style) */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[400px]">
                {/* Performance Graph Area */}
                <div className="md:col-span-8 bg-[#19191c] rounded-xl p-8 flex flex-col border border-[#48474a]/5">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h4 className="font-sans text-lg font-bold text-[#f9f5f8]">Sales Velocity</h4>
                            <p className="text-xs text-[#adaaad]">Real-time throughput of pending shipments</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#85adff]"></div>
                                <span className="text-[10px] text-[#adaaad] font-bold uppercase tracking-widest">Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#69f6b8]"></div>
                                <span className="text-[10px] text-[#adaaad] font-bold uppercase tracking-widest">Completed</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full relative group h-48 md:h-auto">
                        {/* Real Data Graph: Last 7 Orders */}
                        <div className="absolute inset-0 flex items-end justify-between gap-4 px-4 pb-4">
                            {velocityData.length > 0 ? velocityData.map((data, index) => (
                                <div 
                                    key={data.id + index}
                                    title={`$${data.amount?.toLocaleString('es-AR')}`}
                                    className={`w-full rounded-t-lg transition-all duration-1000 ease-out opacity-80 hover:opacity-100 ${data.isActive ? 'bg-[#85adff]' : 'bg-[#69f6b8]'}`} 
                                    style={{ height: data.heightClass }}
                                ></div>
                            )) : (
                                <div className="w-full text-center text-[#adaaad] text-sm self-center">No hay órdenes suficientes</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Real Data Status Breakdown */}
                <div className="md:col-span-4 bg-[#19191c] rounded-xl p-8 flex flex-col justify-between overflow-hidden relative border border-[#48474a]/5">
                    <div className="z-10">
                        <h4 className="font-sans text-lg font-bold text-[#f9f5f8]">Status Distribution</h4>
                        <p className="text-xs text-[#adaaad] mb-6">Distribución por estado actual</p>
                    </div>
                    <div className="space-y-4 z-10 w-full">
                        <div className="group">
                            <div className="flex justify-between text-xs font-bold mb-1 text-[#f9f5f8] group-hover:text-[#85adff] transition-colors">
                                <span>Activos (Pendientes/Pagados)</span>
                                <span>{statusDist.pendingPct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#262528] rounded-full overflow-hidden">
                                <div className="h-full bg-[#85adff] transition-all duration-1000 ease-out" style={{ width: `${statusDist.pendingPct}%` }}></div>
                            </div>
                        </div>
                        <div className="group">
                            <div className="flex justify-between text-xs font-bold mb-1 text-[#f9f5f8] group-hover:text-[#69f6b8] transition-colors">
                                <span>Completados (Enviados)</span>
                                <span>{statusDist.shippedPct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#262528] rounded-full overflow-hidden">
                                <div className="h-full bg-[#69f6b8] transition-all duration-1000 ease-out" style={{ width: `${statusDist.shippedPct}%` }}></div>
                            </div>
                        </div>
                        <div className="group">
                            <div className="flex justify-between text-xs font-bold mb-1 text-[#f9f5f8] group-hover:text-[#ff716c] transition-colors">
                                <span>Cancelados</span>
                                <span>{statusDist.cancelledPct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#262528] rounded-full overflow-hidden">
                                <div className="h-full bg-[#ff716c] transition-all duration-1000 ease-out" style={{ width: `${statusDist.cancelledPct}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-center z-10">
                        <button className="text-xs font-bold text-[#85adff] hover:text-[#f9f5f8] transition-colors underline underline-offset-4">Configurar Estados</button>
                    </div>
                    {/* Background aesthetic flare */}
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#85adff]/5 blur-[80px] rounded-full -mb-24 -mr-24 pointer-events-none"></div>
                </div>
            </div>

            {/* Modal de Artículos */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#19191c] border border-[#48474a]/20 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-[#48474a]/20 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-[#f9f5f8] flex items-center gap-2">
                                <Package className="w-5 h-5 text-[#85adff]" />
                                Artículos del Pedido
                            </h3>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-[#adaaad] hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                            {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                                selectedOrder.order_items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 rounded-xl bg-[#131315] border border-[#48474a]/10">
                                        {item.products?.images && item.products.images.length > 0 ? (
                                            <img src={item.products.images[0]} alt={item.products.name} className="w-16 h-16 object-cover rounded-lg bg-[#262528]" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-[#262528] flex items-center justify-center text-[#adaaad]">
                                                <Package className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-[#f9f5f8] line-clamp-1">{item.products?.name || `Producto no disponible`}</h4>
                                            <div className="text-sm text-[#adaaad] mt-1 space-y-0.5">
                                                <p>Talla: <span className="font-medium text-[#f9f5f8]">{item.size}</span></p>
                                                <p>Cantidad: <span className="font-medium text-[#f9f5f8]">{item.quantity}</span></p>
                                                <p>Precio histórico: <span className="font-medium text-[#f9f5f8]">${(item.price_at_purchase || 0).toLocaleString("es-AR")}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-[#adaaad] py-4">No hay artículos detallados para este pedido.</p>
                            )}
                        </div>
                        
                        {/* Tracking Section */}
                        <div className="p-6 border-t border-[#48474a]/20 bg-[#131315]/50">
                            <h4 className="font-semibold text-sm text-[#f9f5f8] mb-4 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#69f6b8]" /> Seguimiento de Envío
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs text-[#adaaad] mb-1">Correo (ej. Andreani)</label>
                                    <input 
                                        type="text" 
                                        value={carrier}
                                        onChange={(e) => setCarrier(e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-[#48474a]/20 rounded-md bg-[#1f1f22] text-[#f9f5f8] focus:outline-none focus:ring-1 focus:ring-[#85adff] placeholder:text-[#adaaad]/50" 
                                        placeholder="Empresa de correo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[#adaaad] mb-1">Código de Seguimiento</label>
                                    <input 
                                        type="text" 
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-[#48474a]/20 rounded-md bg-[#1f1f22] text-[#f9f5f8] focus:outline-none focus:ring-1 focus:ring-[#85adff] placeholder:text-[#adaaad]/50" 
                                        placeholder="Ej. AB123456789AR"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSaveTracking}
                                disabled={isSavingTracking}
                                className="w-full py-2 bg-[#85adff] hover:bg-[#699cff] text-[#000000] rounded-md text-sm font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {isSavingTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Seguimiento"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
