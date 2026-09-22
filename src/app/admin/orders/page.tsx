"use client";
import { FourSquare } from "react-loading-indicators";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { DollarSign, ShoppingBag, TrendingUp, Filter, Download, Package, Truck, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth";
import { toast } from "sonner";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

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
    'pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'paid': 'bg-primary-container text-on-primary-container border-primary',
    'shipped': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'cancelled': 'bg-red-500/10 text-red-400 border-error/20',
};

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'shipped': 'Enviado',
    'cancelled': 'Cancelado'
};

export default function AdminOrdersPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <AdminOrdersContent />
        </Suspense>
    );
}

function AdminOrdersContent() {
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const searchParams = useSearchParams();
    const searchQuery = searchParams?.get('search')?.toLowerCase() || "";
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    
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
                    .order('created_at', { ascending: false })
                    .limit(20);

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
            toast.error("No se pudo actualizar el estado.");
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
            toast.success("Pedido eliminado correctamente.");
        } catch (err) {
            console.error("Error deleting order", err);
            toast.error("No se pudo eliminar el pedido. Revisa los permisos.");
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

            toast.success("Datos de envío guardados");
            
            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, tracking_number: trackingNumber, carrier: carrier } : o));
            setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber, carrier: carrier });
            
        } catch (err) {
            console.error("Error updating tracking", err);
            toast.error("No se pudo guardar la información de envío");
        } finally {
            setIsSavingTracking(false);
        }
    };

    const handleExport = () => {
        if (orders.length === 0) return toast.error("No hay pedidos para exportar.");
        
        const csvHeader = "ID,Fecha,Cliente,Monto,Estado\n";
        const csvBody = orders.map(o => {
            return `${o.id.split('-')[0]},${new Date(o.created_at).toLocaleDateString('es-AR')},${o.customer_email},${o.total_amount || 0},${STATUS_LABELS[o.status] || o.status}`;
        }).join("\n");
        
        const blob = new Blob([csvHeader + csvBody], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `pedidos_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    let filteredOrders = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);
    
    if (searchQuery) {
        filteredOrders = filteredOrders.filter(o => 
            o.id.toLowerCase().includes(searchQuery) || 
            o.customer_email.toLowerCase().includes(searchQuery)
        );
    }


    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 font-sans">
            
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-sans">Gestión de Pedidos</h2>
                    <p className="text-outline mt-1 text-sm font-medium">Seguimiento y administración de todas las compras realizadas en la tienda.</p>
                </div>
            </header>

            {/* Dashboard Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant p-6 rounded-2xl relative overflow-hidden group hover:border-primary transition-all duration-300 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container border border-primary flex items-center justify-center text-on-primary-container">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black tracking-wider text-on-primary-container bg-primary-container border border-primary px-2.5 py-1 rounded-full uppercase">+12.5%</span>
                    </div>
                    <p className="text-outline text-xs font-bold uppercase tracking-widest">Ingresos Totales</p>
                    <h2 className="text-3xl font-black text-on-surface mt-1 font-sans">
                        ${orders.reduce((acc, order) => acc + (order.total_amount || 0), 0).toLocaleString('es-AR')}
                    </h2>
                </div>

                <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant p-6 rounded-2xl relative overflow-hidden group hover:border-primary transition-all duration-300 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container border border-primary flex items-center justify-center text-on-primary-container">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-outline text-xs font-bold uppercase tracking-widest">Pedidos Activos</p>
                    <h2 className="text-3xl font-black text-on-surface mt-1 font-sans">{orders.length}</h2>
                </div>

                <div className="bg-surface-container-low backdrop-blur-md border border-outline-variant p-6 rounded-2xl relative overflow-hidden group hover:border-primary transition-all duration-300 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container border border-primary flex items-center justify-center text-on-primary-container">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-outline text-xs font-bold uppercase tracking-widest">Promedio por Pedido</p>
                    <h2 className="text-3xl font-black text-on-surface mt-1 font-sans">
                        ${orders.length > 0 ? Math.round(orders.reduce((acc, order) => acc + (order.total_amount || 0), 0) / orders.length).toLocaleString('es-AR') : '0'}
                    </h2>
                </div>
            </div>

            {/* Orders Table Section */}
            <div className="bg-surface-container-low backdrop-blur-md rounded-2xl overflow-hidden border border-outline-variant shadow-lg">
                <div className="px-6 py-5 flex flex-col md:flex-row md:justify-between md:items-center border-b border-outline-variant gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-on-surface font-sans">Listado de Pedidos</h3>
                        <p className="text-xs text-outline">Detalle general de órdenes recibidas.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3.5 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface hover:border-primary transition-all outline-none appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los Estados</option>
                            {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleExport}
                            className="px-3.5 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface hover:border-primary transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4 text-primary" /> Exportar
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-outline-variant">
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">ID de Pedido</th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest hidden md:table-cell">Fecha</th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest hidden md:table-cell">Cliente</th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Monto</th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d2e26]">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-outline text-sm font-medium">
                                        No hay pedidos registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                                        <td className="px-6 py-5 font-mono text-xs text-primary font-bold">
                                            #{order.id.split('-')[0].toUpperCase()}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-outline hidden md:table-cell">
                                            {new Date(order.created_at).toLocaleDateString('es-AR', {
                                                month: 'short', day: '2-digit', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-5 hidden md:table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-surface border border-outline-variant flex items-center justify-center text-primary font-bold text-xs uppercase cursor-pointer" onClick={() => setSelectedOrder(order)} title="Ver Detalles">
                                                    {order.customer_email.split('@')[0].substring(0, 2)}
                                                </div>
                                                <span className="text-sm font-bold text-on-surface hover:text-primary truncate max-w-37.5 cursor-pointer transition-colors" onClick={() => setSelectedOrder(order)} title={order.customer_email}>
                                                    {order.customer_email.split('@')[0]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-on-surface">
                                            ${(order.total_amount || 0).toLocaleString("es-AR")}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    disabled={updatingId === order.id}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors outline-none cursor-pointer appearance-none ${STATUS_COLORS[order.status] || STATUS_COLORS['pending']}`}
                                                >
                                                    {STATUS_OPTIONS.map(status => (
                                                        <option key={status} value={status} className="bg-surface-container-low text-on-surface">
                                                            {STATUS_LABELS[status]}
                                                        </option>
                                                    ))}
                                                </select>
                                                {updatingId === order.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button 
                                                onClick={() => handleDeleteOrder(order.id)}
                                                disabled={deletingId === order.id}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg border border-transparent hover:border-error/20 transition-all disabled:opacity-50"
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
                <div className="px-6 py-4 bg-surface border-t border-outline-variant flex items-center justify-between">
                    <p className="text-xs text-outline font-medium">Mostrando <span className="text-on-surface font-bold">{filteredOrders.length > 0 ? 1 : 0}-{filteredOrders.length}</span> de <span className="text-on-surface font-bold">{filteredOrders.length}</span> pedidos</p>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-low border border-outline-variant text-outline hover:text-on-surface transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container font-bold text-xs">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-low border border-outline-variant text-outline hover:text-on-surface transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Summary Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Performance Graph Area */}
                <div className="md:col-span-8 bg-surface-container-low backdrop-blur-md rounded-2xl p-6 md:p-8 border border-outline-variant shadow-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h4 className="text-lg font-bold text-on-surface font-sans">Velocidad de Ventas</h4>
                            <p className="text-xs text-outline mt-0.5">Flujo reciente de volumen por pedidos.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-tertiary-container"></div>
                                <span className="text-[10px] text-outline font-bold uppercase tracking-widest">Activos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                <span className="text-[10px] text-outline font-bold uppercase tracking-widest">Completados</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full relative group h-48 md:h-56">
                        <div className="absolute inset-0 flex items-end justify-between gap-4 px-4 pb-4">
                            {velocityData.length > 0 ? velocityData.map((data, index) => (
                                <div 
                                    key={data.id + index}
                                    title={`$${data.amount?.toLocaleString('es-AR')}`}
                                    className={`w-full rounded-t-lg transition-all duration-700 ease-out opacity-80 hover:opacity-100 ${data.isActive ? 'bg-tertiary-container shadow-[0_0_12px_rgba(0,168,122,0.3)]' : 'bg-blue-400'}`} 
                                    style={{ height: data.heightClass }}
                                ></div>
                            )) : (
                                <div className="w-full text-center text-outline text-sm self-center">No hay datos de ventas suficientes</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="md:col-span-4 bg-surface-container-low backdrop-blur-md rounded-2xl p-6 md:p-8 border border-outline-variant shadow-lg flex flex-col justify-between relative overflow-hidden">
                    <div>
                        <h4 className="text-lg font-bold text-on-surface font-sans">Distribución de Estados</h4>
                        <p className="text-xs text-outline mb-6">Porcentaje del catálogo por estado actual.</p>
                    </div>
                    <div className="space-y-4 z-10 w-full">
                        <div className="group">
                            <div className="flex justify-between text-xs font-bold mb-1 text-on-surface-variant group-hover:text-primary transition-colors">
                                <span>Activos (Pendientes / Pagados)</span>
                                <span>{statusDist.pendingPct}%</span>
                            </div>
                            <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-outline-variant">
                                <div className="h-full bg-tertiary-container transition-all duration-1000 ease-out" style={{ width: `${statusDist.pendingPct}%` }}></div>
                            </div>
                        </div>
                        <div className="group">
                            <div className="flex justify-between text-xs font-bold mb-1 text-on-surface-variant group-hover:text-blue-400 transition-colors">
                                <span>Completados (Enviados)</span>
                                <span>{statusDist.shippedPct}%</span>
                            </div>
                            <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-outline-variant">
                                <div className="h-full bg-blue-400 transition-all duration-1000 ease-out" style={{ width: `${statusDist.shippedPct}%` }}></div>
                            </div>
                        </div>
                        <div className="group">
                            <div className="flex justify-between text-xs font-bold mb-1 text-on-surface-variant group-hover:text-red-400 transition-colors">
                                <span>Cancelados</span>
                                <span>{statusDist.cancelledPct}%</span>
                            </div>
                            <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-outline-variant">
                                <div className="h-full bg-red-400 transition-all duration-1000 ease-out" style={{ width: `${statusDist.cancelledPct}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-center z-10">
                        <button className="text-xs font-bold text-primary hover:text-emerald-400 transition-colors uppercase tracking-wider">
                            Gestión Activa de Estados
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Artículos */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-outline-variant flex items-center justify-between">
                            <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 font-sans">
                                <Package className="w-5 h-5 text-primary" />
                                Artículos del Pedido
                            </h3>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-outline hover:text-on-surface transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
                            {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                                selectedOrder.order_items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-surface border border-outline-variant">
                                        {item.products?.images && item.products.images.length > 0 ? (
                                            <div className="relative w-16 h-16 shrink-0 rounded-lg bg-surface-container-low overflow-hidden">
                                                <Image src={item.products.images[0]} alt={item.products.name} fill sizes="64px" className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-surface-container-low flex items-center justify-center text-outline">
                                                <Package className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-bold text-on-surface text-sm line-clamp-1">{item.products?.name || `Producto no disponible`}</h4>
                                            <div className="text-xs text-outline mt-1 space-y-0.5 font-medium">
                                                <p>Talla: <span className="font-bold text-primary">{item.size}</span></p>
                                                <p>Cantidad: <span className="font-bold text-on-surface">{item.quantity}</span></p>
                                                <p>Precio histórico: <span className="font-bold text-on-surface">${(item.price_at_purchase || 0).toLocaleString("es-AR")}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-outline py-6 text-sm">No hay artículos detallados para este pedido.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

