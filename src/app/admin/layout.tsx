"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { LayoutGrid, Box, Package, ShoppingCart, LogOut, ArrowLeft, Users, MessageSquare, Tag, Settings, Store, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const isAdmin = useAuthStore((state) => state.isAdmin);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const router = useRouter();
    const pathname = usePathname();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);

    useEffect(() => {
        if (!isInitialized || !user || !isAdmin) return;

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
            console.log("IsAdmin status:", isAdmin);

            // Check if user is logged in AND their email is in the admin list
            if (!user || !isAdmin) {
                console.log("Client-side redirect to / triggered", { userEmail: user?.email });
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

    if (!isInitialized || !user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main"></div>
            </div>
        );
    }

    const navItems = [
        { name: "Panel Principal", href: "/admin", icon: LayoutGrid },
        { name: "Productos", href: "/admin/products", icon: Box },
        { name: "Categorías", href: "/admin/categories", icon: Tag },
        { name: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
        { name: "Clientes", href: "/admin/users", icon: Users },
        { name: "Mensajes", href: "/admin/messages", icon: MessageSquare },
        { name: "Configuración", href: "/admin/settings", icon: Settings },
    ];

    const sidebarContent = (
        <>
            <div className="mb-10 flex items-center gap-3">
                <div className="bg-main text-black p-2 rounded-xl flex items-center justify-center font-bold text-xl h-10 w-10 shrink-0 shadow-[0_0_15px_rgba(0,168,122,0.4)]">
                    PF
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-none text-foreground font-sans">PFSTUDIO</h1>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-1 block">Panel Admin</span>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-main/10 text-main border-l-2 border-main rounded-l-none relative"
                                    : "text-gray-400 hover:text-foreground hover:bg-[#1c1d18]"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-105", isActive ? "text-main" : "text-gray-500 group-hover:text-gray-300")} />
                            {item.name}
                            {isActive && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-main shadow-[0_0_8px_var(--color-main)]"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 mt-auto border-t border-[#242520]">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 transition-colors w-full text-left hover:bg-red-500/5"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-background text-gray-100 font-sans selection:bg-main selection:text-black">
            {/* Sidebar Desktop */}
            <aside className="w-70 bg-[#0e0f0c] border-r border-[#242520] p-6 flex-col hidden md:flex sticky top-0 h-screen transition-all shrink-0">
                {sidebarContent}
            </aside>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    {/* Drawer Panel */}
                    <aside className="relative flex flex-col w-70 h-full bg-[#0e0f0c] border-r border-[#242520] p-6 animate-in slide-in-from-left duration-300">
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-6 right-4 p-2 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {sidebarContent}
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden flex flex-col min-w-0">
                {/* Top Header */}
                <header className="bg-[#0e0f0c]/90 border-b border-[#242520] px-6 py-4 flex items-center justify-between shrink-0 h-18 sticky top-0 z-40 backdrop-blur-md">
                    {/* Hamburger and Brand for Mobile */}
                    <div className="flex items-center gap-3 md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)} 
                            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                            title="Menú"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="bg-main text-black p-1.5 rounded-md flex items-center justify-center font-bold text-sm h-8 w-8 shrink-0 shadow-[0_0_10px_rgba(0,168,122,0.3)]">
                            PF
                        </div>
                        <h1 className="font-bold text-sm text-foreground">PFSTUDIO</h1>
                    </div>

                    {/* Left padding spacing filler on desktop, keeps items aligned to right */}
                    <div className="hidden md:block"></div>

                    {/* Actions and User Profile */}
                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-400 hover:text-gray-100 relative focus:outline-none p-1.5 rounded-lg hover:bg-[#1c1d18] transition-colors">
                                {(pendingOrdersCount > 0 || lowStockCount > 0) && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-[#0e0f0c]"></span>
                                    </span>
                                )}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-[#1a1b16] border border-[#2d2e26] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="p-4 border-b border-[#2d2e26] flex items-center justify-between bg-[#12130f]">
                                        <h3 className="font-bold text-white text-sm">Notificaciones</h3>
                                        {(pendingOrdersCount > 0 || lowStockCount > 0) && (
                                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Nuevas</span>
                                        )}
                                    </div>
                                    <div className="max-h-75 overflow-y-auto">
                                        {pendingOrdersCount === 0 && lowStockCount === 0 ? (
                                            <div className="p-6 text-center text-sm text-gray-500">
                                                No hay notificaciones nuevas.
                                            </div>
                                        ) : (
                                            <>
                                                {pendingOrdersCount > 0 && (
                                                    <div className="p-4 border-b border-[#2d2e26] hover:bg-[#252620]/30 transition-colors cursor-pointer" onClick={() => { router.push('/admin/orders'); setShowNotifications(false); }}>
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-main/10 flex items-center justify-center shrink-0">
                                                                <ShoppingCart className="w-4 h-4 text-main" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-200">Hay {pendingOrdersCount} pedido(s) pendiente(s)</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">Revisa la sección de pedidos para gestionarlos.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {lowStockCount > 0 && (
                                                    <div className="p-4 border-b border-[#2d2e26] hover:bg-[#252620]/30 transition-colors cursor-pointer" onClick={() => { router.push('/admin/products'); setShowNotifications(false); }}>
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
                                    <div className="p-3 text-center border-t border-[#2d2e26] bg-[#12130f]">
                                        <Link href="/admin/orders" onClick={() => setShowNotifications(false)} className="text-xs text-main hover:text-emerald-400 font-bold uppercase tracking-wider">
                                            Ver todas las actividades
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* View Store */}
                        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-foreground bg-[#1c1d18] px-3.5 py-2 rounded-xl border border-[#2d2e26] hover:border-main/50 transition-all uppercase tracking-wider">
                            <Store className="w-4 h-4 text-main" />
                            Ver Tienda
                        </Link>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-6 border-l border-[#242520]">
                            <div className="h-8 w-8 rounded-full bg-main flex items-center justify-center text-sm font-black text-black shadow-[0_0_12px_rgba(0,168,122,0.4)]">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-bold text-gray-200 line-clamp-1 max-w-37.5">{user.email}</p>
                                <p className="text-[9px] text-main font-black uppercase tracking-wider">Administrador</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Inner Canvas */}
                <div className="p-6 md:p-8 flex-1 min-h-0 bg-background">
                    {children}
                </div>
            </main>
        </div>
    );
}
