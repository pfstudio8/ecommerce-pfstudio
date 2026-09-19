"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth";
import { useAddressStore } from "@/features/orders/store/addresses";
import { supabase } from "@/lib/supabase";
import { Package, User as UserIcon, LogOut, ArrowRight, Truck, XCircle, MessageCircle, Home, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ProcessingOverlay from "@/components/ProcessingOverlay";

interface Order {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    items: any[];
    tracking_number?: string;
    carrier?: string;
}

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const setModalOpen = useAuthStore((state) => state.setModalOpen);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');
    
    // Address state
    const { addresses, fetchAddresses, addAddress, deleteAddress, setDefaultAddress, isLoading: isAddressLoading } = useAddressStore();
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip_code: '' });
    const [whatsapp, setWhatsapp] = useState("5493704245651");

    const router = useRouter();

    useEffect(() => {
        if (!isInitialized) return;

        if (!user) {
            router.push('/');
            setModalOpen(true);
            return;
        }

        if (user.email === 'facundoesquivel03@gmail.com') {
            router.push('/admin');
            return;
        }

        const fetchOrders = async () => {
            try {
                // Fetch orders and items in a single join query to solve N+1 problem
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        items:order_items(
                            *,
                            product:products(*)
                        )
                    `)
                    .eq('customer_email', user.email || '')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.warn("Could not fetch orders.", error);
                } else if (data) {
                    setOrders(data as Order[]);
                }
            } catch (err) {
                console.warn(err);
            }
        };

        const fetchSettings = async () => {
            try {
                const { data } = await supabase.from('settings').select('value').eq('key', 'store_info').single();
                if (data?.value?.whatsapp) setWhatsapp(data.value.whatsapp);
            } catch (err) { }
        };

        const initData = async () => {
            setIsLoading(true);
            await Promise.all([fetchOrders(), fetchAddresses(), fetchSettings()]);
            setIsLoading(false);
        };

        initData();
    }, [user, isInitialized, router, setModalOpen, fetchAddresses]);

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer.")) return;
        
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', orderId);

            if (error) throw error;

            toast.success("Pedido cancelado con éxito");
            
            // Update local state to reflect change instantly
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
            
        } catch (error: any) {
            console.error("Error cancelling order:", error);
            toast.error("Hubo un error al cancelar el pedido.");
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await supabase.auth.signOut();
            toast.info("Sesión cerrada correctamente");
            router.push('/');
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (!isInitialized || (isInitialized && !user) || (user && user.email === 'facundoesquivel03@gmail.com')) {
        return (
            <div className="min-h-screen bg-(--background) flex items-center justify-center pt-24">
                <div className="w-12 h-12 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

    return (
        <div className="min-h-screen bg-(--background) pt-32 pb-24 font-sans text-(--foreground)">
            <div className="container mx-auto px-6 md:px-4 max-w-5xl">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row gap-8"
                >
                    {/* Sidebar / User Info */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm sticky top-32">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-4 text-primary border border-outline-variant shadow-inner">
                                    <UserIcon strokeWidth={1.5} className="w-10 h-10" />
                                </div>
                                <h1 className="text-headline-sm font-headline-sm tracking-tight text-on-surface">{userName}</h1>
                                <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">{user?.email}</p>
                            </div>

                            <div className="border-t border-outline-variant/60 pt-6 flex flex-col gap-3">
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl transition-all duration-300 font-bold text-sm tracking-wide ${activeTab === 'orders' ? 'bg-primary text-on-primary shadow-md hover:bg-primary-dark' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}
                                >
                                    <Package className="w-4 h-4" />
                                    Mis Pedidos
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl transition-all duration-300 font-bold text-sm tracking-wide ${activeTab === 'addresses' ? 'bg-primary text-on-primary shadow-md hover:bg-primary-dark' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}
                                >
                                    <MapPin className="w-4 h-4" />
                                    Direcciones
                                </button>
                                <Link
                                    href="/"
                                    className="w-full py-3 flex items-center justify-center gap-2 text-on-surface border border-outline-variant hover:bg-surface-container rounded-xl transition-all duration-300 font-bold text-sm tracking-wide"
                                >
                                    <Home className="w-4 h-4" />
                                    Ir a la Tienda
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors font-medium text-sm"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full md:w-2/3">
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm min-h-125">
                            {activeTab === 'orders' ? (
                                <>
                                    <h2 className="text-headline-sm font-headline-sm mb-6 flex items-center gap-3 text-on-surface">
                                        <Package className="w-6 h-6 text-primary" />
                                        Mis Pedidos
                                    </h2>
        
                                    {isLoading ? (
                                        <div className="py-20 flex justify-center">
                                            <div className="w-12 h-12 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin"></div>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-16 border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low/50">
                                            <Package className="w-12 h-12 md:w-16 md:h-16 text-on-surface-variant/30 mx-auto mb-4" />
                                            <h3 className="text-title-lg font-title-lg mb-2 text-on-surface">Aún no tienes pedidos</h3>
                                            <p className="text-body-md text-on-surface-variant mb-6 max-w-md mx-auto">
                                                Cuando realices una compra, tu historial y el estado de tus envíos aparecerán aquí.
                                            </p>
                                            <button
                                                onClick={() => router.push('/#productos')}
                                                className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm tracking-wider uppercase hover:bg-primary-dark transition-all flex items-center gap-2 mx-auto"
                                            >
                                                Explorar Tienda
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <div key={order.id} className="border border-gray-100 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-gray-50 dark:border-zinc-800/50">
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">
                                                                Pedido #{order.id.split('-')[0]}
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {new Date(order.created_at).toLocaleDateString('es-AR', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border
                                                                ${(order.status === 'pending' || order.status === 'Pendiente') ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50' :
                                                                    (order.status === 'paid' || order.status === 'approved' || order.status === 'Pagado') ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-900/50' :
                                                                    (order.status === 'cancelled' || order.status === 'Cancelado') ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900/50' :
                                                                    order.status === 'shipped' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-900/50' :
                                                                        'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700'
                                                                }`}
                                                            >
                                                                {order.status === 'pending' ? 'Pendiente' :
                                                                 (order.status === 'paid' || order.status === 'approved') ? 'Pagado' :
                                                                 order.status === 'shipped' ? 'Enviado' :
                                                                 order.status === 'cancelled' ? 'Cancelado' :
                                                                 order.status}
                                                            </span>
                                                            <p className="font-bold text-main">
                                                                ${(order.total_amount || 0).toLocaleString('es-AR')}
                                                            </p>
                                                        </div>
                                                    </div>
        
                                                    <div className="flex flex-col gap-4">
                                                        {order.items?.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                                                                <div className="w-16 h-20 bg-gray-200 dark:bg-zinc-800 rounded overflow-hidden shrink-0 relative">
                                                                    {item.product?.images?.[0] ? (
                                                                        <Image src={item.product.images[0]} alt={item.product.name || ''} fill sizes="64px" className="object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                            <Package className="w-6 h-6" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 text-sm">
                                                                    <p className="font-bold text-(--foreground) line-clamp-1 mb-1">{item.product?.name || 'Producto Personalizado'}</p>
                                                                    <div className="flex items-center gap-3 text-gray-500">
                                                                        <span className="bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-xs font-medium">Talle: {item.size}</span>
                                                                        <span className="text-xs font-medium">Unidades: {item.quantity}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right whitespace-nowrap hidden sm:block">
                                                                    <p className="font-bold text-main">${(item.price_at_purchase * item.quantity).toLocaleString('es-AR')}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {(order.status === 'pending' || order.status === 'Pendiente') && (
                                                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-zinc-800/50 flex flex-wrap gap-3 justify-end">
                                                            <button
                                                                onClick={() => {
                                                                    const msg = encodeURIComponent(`Hola PFSTUDIO! Quiero modificar mi pedido de transferencia #${order.id.split('-')[0]}. Quiero cambiar...`);
                                                                    window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
                                                                }}
                                                                className="px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                                                            >
                                                                <MessageCircle className="w-4 h-4" />
                                                                Modificar Talle/Modelo via WhatsApp
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-900/30 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                                Cancelar Pedido
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                                        <h2 className="text-headline-sm font-headline-sm flex items-center gap-3 text-on-surface">
                                            <MapPin className="w-6 h-6 text-primary" />
                                            Mis Direcciones
                                        </h2>
                                        {!isAddingAddress && (
                                            <button
                                                onClick={() => setIsAddingAddress(true)}
                                                className="px-4 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-md"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Nueva Dirección
                                            </button>
                                        )}
                                    </div>
                                    
                                    {isAddingAddress ? (
                                        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant animate-in fade-in slide-in-from-top-4">
                                            <h3 className="font-bold text-title-md text-on-surface mb-4">Agregar Nueva Dirección</h3>
                                            <form onSubmit={async (e) => {
                                                e.preventDefault();
                                                const success = await addAddress(newAddress);
                                                if(success) {
                                                    toast.success("Dirección guardada con éxito");
                                                    setIsAddingAddress(false);
                                                    setNewAddress({ street: '', city: '', state: '', zip_code: '' });
                                                } else {
                                                    toast.error("Error al guardar la dirección");
                                                }
                                            }} className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Calle y Número / Depto</label>
                                                    <input required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-main outline-none transition-colors" placeholder="Ej: Av. Corrientes 1234, Piso 5A" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Ciudad</label>
                                                        <input required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-main outline-none transition-colors" placeholder="Ej: CABA" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Código Postal</label>
                                                        <input required value={newAddress.zip_code} onChange={e => setNewAddress({...newAddress, zip_code: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-main outline-none transition-colors" placeholder="Ej: 1043" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Provincia</label>
                                                    <input required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-main outline-none transition-colors" placeholder="Ej: Buenos Aires" />
                                                </div>
                                                <div className="flex gap-3 pt-2">
                                                    <button type="button" onClick={() => setIsAddingAddress(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">Cancelar</button>
                                                    <button type="submit" className="flex-1 py-3 bg-main text-black rounded-lg font-bold text-sm hover:bg-emerald-400 transition-colors shadow-md">Guardar Dirección</button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {isAddressLoading ? (
                                                <div className="col-span-1 md:col-span-2 py-10 flex justify-center"><div className="w-12 h-12 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin"></div></div>
                                            ) : addresses.length === 0 ? (
                                                <div className="col-span-1 md:col-span-2 text-center py-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/50">
                                                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                    <h3 className="font-bold mb-2">No tienes direcciones guardadas</h3>
                                                    <p className="text-gray-500 text-sm">Agrega tu primera dirección para acelerar tu próxima compra.</p>
                                                </div>
                                            ) : (
                                                addresses.map(addr => (
                                                    <div key={addr.id} className={`p-5 rounded-xl border relative transition-all ${addr.is_default ? 'border-main bg-main/5 shadow-sm' : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-600'}`}>
                                                        {addr.is_default && (
                                                            <div className="absolute -top-3 -right-3 bg-main text-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg" title="Dirección Principal">
                                                                <Star className="w-3.5 h-3.5 fill-black" />
                                                            </div>
                                                        )}
                                                        <h4 className="font-bold text-sm mb-1 line-clamp-1 pr-4">{addr.street}</h4>
                                                        <p className="text-xs text-gray-500 mb-4">{addr.city}, {addr.state} ({addr.zip_code})</p>
                                                        
                                                        <div className="flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 pt-3">
                                                            {!addr.is_default ? (
                                                                <button onClick={() => setDefaultAddress(addr.id)} className="flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700 rounded transition-colors">
                                                                    Hacer Principal
                                                                </button>
                                                            ) : (
                                                                <div className="flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold text-main/80 text-center">
                                                                    Envío Predeterminado
                                                                </div>
                                                            )}
                                                            <button onClick={async () => {
                                                                if(confirm("¿Seguro que quieres borrar esta dirección?")) await deleteAddress(addr.id);
                                                            }} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Eliminar dirección">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Global Loading Overlay for Logout Action */}
            <ProcessingOverlay
                isOpen={isLoggingOut}
                type="auth"
                title="Cerrando Sesión..."
                subtitle="Hasta pronto."
            />
        </div>
    );
}
