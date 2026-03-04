"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { Package, User as UserIcon, LogOut, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { sileo } from "sileo";

interface Order {
    id: string;
    created_at: string;
    status: string;
    total: number;
    items: any[];
}

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const setModalOpen = useAuthStore((state) => state.setModalOpen);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isInitialized) return;

        if (!user) {
            router.push('/');
            setModalOpen(true);
            return;
        }

        const fetchOrders = async () => {
            try {
                // Fetch orders from Supabase (assuming the table exists)
                // If the table 'orders' doesn't exist yet, this will fail gracefully and just show 0 orders
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    // It's possible the table doesn't exist yet, log silently
                    console.warn("Could not fetch orders. Table might not exist yet.");
                } else if (data) {
                    setOrders(data);
                }
            } catch (err) {
                console.warn(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [user, isInitialized, router, setModalOpen]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await supabase.auth.signOut();
            sileo.error({ title: "Has cerrado sesión" });
            router.push('/');
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (!isInitialized || (isInitialized && !user)) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center pt-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" />
            </div>
        );
    }

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

    return (
        <div className="min-h-screen bg-[var(--background)] pt-32 pb-24 font-sans text-[var(--foreground)]">
            <div className="container mx-auto px-6 md:px-4 max-w-5xl">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row gap-8"
                >
                    {/* Sidebar / User Info */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm sticky top-32">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-[var(--color-main)] shadow-inner">
                                    <UserIcon strokeWidth={1.5} className="w-10 h-10" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight">{userName}</h1>
                                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                            </div>

                            <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
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

                    {/* Main Content - Orders */}
                    <div className="w-full md:w-2/3">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Package className="w-6 h-6 text-[var(--color-main)]" />
                                Mis Pedidos
                            </h2>

                            {isLoading ? (
                                <div className="py-20 flex justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/50">
                                    <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Aún no tienes pedidos</h3>
                                    <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
                                        Cuando realices una compra, tu historial y el estado de tus envíos aparecerán aquí.
                                    </p>
                                    <button
                                        onClick={() => router.push('/#productos')}
                                        className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm tracking-wider uppercase hover:bg-[var(--color-main)] hover:text-white transition-all flex items-center gap-2 mx-auto"
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
                                                        ${order.status === 'Pendiente' ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50' :
                                                            order.status === 'Pagado' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-900/50' :
                                                                'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700'
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                    <p className="font-bold text-[var(--color-main)]">
                                                        ${order.total.toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4">
                                                {/* Simplified items preview */}
                                                {order.items?.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                                            {item.product?.images?.[0] ? (
                                                                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-200 dark:bg-zinc-800"></div>
                                                            )}
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="font-semibold line-clamp-1">{item.product?.name || 'Producto'}</p>
                                                            <p className="text-gray-500 text-xs">Talle: {item.size} • Cant: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Global Loading Overlay for Logout Action */}
            <AnimatePresence>
                {isLoggingOut && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-[var(--background)]/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto"
                    >
                        <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
                        <p className="text-sm font-bold tracking-widest uppercase text-red-500">Cerrando Sesión...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
