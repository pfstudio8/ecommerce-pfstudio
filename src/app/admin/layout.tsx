"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { LayoutGrid, Box, Package, ShoppingCart, LogOut, ArrowLeft, Users, MessageSquare, Tag, Settings, Store } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const router = useRouter();
    const pathname = usePathname();
    const [showNotifications, setShowNotifications] = useState(false);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);

    useEffect(() => {
        if (!isInitialized || !user || !adminEmails.includes(user.email || '')) return;

        const fetchNotifications = async () => {
            try {
                const { count: pendingCount } = await supabase
                    .from('orders')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'pending');

                const { data: allProducts } = await supabase
                    .from('products')
                    .select('stock');

                const lowStock = allProducts?.filter(p => (p.stock || 0) < 5).length || 0;

                setPendingOrdersCount(pendingCount || 0);
                setLowStockCount(lowStock);
            } catch (err) {
                console.error("Error fetching admin notifications", err);
            }
        };

        fetchNotifications();
    }, [isInitialized, user]);

    useEffect(() => {
        if (isInitialized) {
            console.log("=== LAYOUT ADMIN CHECK ===");
            console.log("User email:", user?.email);
            console.log("Admin emails loaded:", adminEmails);

            // Check if user is logged in AND their email is in the admin list
            if (!user || !adminEmails.includes(user.email || '')) {
                console.log("Client-side redirect to / triggered", { userEmail: user?.email, adminEmails });
                router.replace('/');
            } else {
                console.log("Admin layout access GRANTED");
            }
        }
    }, [user, isInitialized, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (!isInitialized || !user || !adminEmails.includes(user.email || '')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-main)]"></div>
            </div>
        );
    }

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutGrid },
        { name: "Products", href: "/admin/products", icon: Box },
        { name: "Categories", href: "/admin/categories", icon: Box },
        { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Messages", href: "/admin/messages", icon: MessageSquare },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[#0f111a] text-gray-100 font-sans selection:bg-[var(--color-main)] selection:text-white">
            {/* Sidebar */}
            <aside className="w-[280px] bg-[#0c0e15] border-r border-[#1e212b] p-6 flex-col hidden md:flex sticky top-0 h-screen transition-all">
                <div className="mb-10 flex items-center gap-3">
                    <div className="bg-white text-black p-2 rounded-lg flex items-center justify-center font-bold text-xl h-10 w-10 shrink-0">
                        PF
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none">PFSTUDIO</h1>
                        <span className="text-[10px] text-gray-400">Admin Panel</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] relative"
                                        : "text-gray-400 hover:text-gray-100 hover:bg-[#1e212b]"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300")} />
                                {item.name}
                                {isActive && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 transition-colors w-full text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden flex flex-col">
                {/* Top Header */}
                <header className="bg-[#0c0e15] border-b border-[#1e212b] p-4 flex items-center justify-between lg:justify-end shrink-0 h-[72px]">
                    <div className="flex md:hidden items-center gap-2">
                        <div className="bg-white text-black p-1.5 rounded-md flex items-center justify-center font-bold text-sm h-8 w-8 shrink-0">
                            PF
                        </div>
                        <h1 className="font-bold text-sm">PFSTUDIO</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-400 hover:text-gray-100 relative focus:outline-none">
                                {(pendingOrdersCount > 0 || lowStockCount > 0) && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#0c0e15]"></span>
                                    </span>
                                )}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-[#141722] border border-[#1e212b] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="p-4 border-b border-[#1e212b] flex items-center justify-between">
                                        <h3 className="font-bold text-white">Notificaciones</h3>
                                        {(pendingOrdersCount > 0 || lowStockCount > 0) && (
                                            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-medium">Nuevas</span>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {pendingOrdersCount === 0 && lowStockCount === 0 ? (
                                            <div className="p-6 text-center text-sm text-gray-500">
                                                No hay notificaciones nuevas.
                                            </div>
                                        ) : (
                                            <>
                                                {pendingOrdersCount > 0 && (
                                                    <div className="p-4 border-b border-[#1e212b] hover:bg-[#1e212b] transition-colors cursor-pointer" onClick={() => { router.push('/admin/orders'); setShowNotifications(false); }}>
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                                <ShoppingCart className="w-4 h-4 text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-200">Hay {pendingOrdersCount} pedido(s) pendiente(s)</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">Revisa la sección de órdenes para gestionarlos.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {lowStockCount > 0 && (
                                                    <div className="p-4 border-b border-[#1e212b] hover:bg-[#1e212b] transition-colors cursor-pointer" onClick={() => { router.push('/admin/products'); setShowNotifications(false); }}>
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                                                                <Package className="w-4 h-4 text-orange-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-200">{lowStockCount} producto(s) con bajo stock</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">Visita la sección de Productos para reabastecer.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="p-3 text-center border-t border-[#1e212b] bg-[#0c0e15]">
                                        <Link href="/admin/orders" onClick={() => setShowNotifications(false)} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                                            Ver todas las actividades
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="text-gray-400 hover:text-gray-100">
                            <Settings className="w-5 h-5" />
                        </button>
                        <Link href="/" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-[#1e212b] px-3 py-1.5 rounded-lg border border-[#2a2e3b]">
                            <Store className="w-4 h-4" />
                            View Store
                        </Link>

                        <div className="flex items-center gap-3 pl-6 border-l border-[#1e212b]">
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-200">{user.email}</p>
                                <p className="text-[10px] text-blue-400">Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
