"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, MessageSquare, LogOut, Tags, ChevronLeft, ChevronRight, BadgeDollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ProcessingOverlay from "@/components/ProcessingOverlay";

export default function AdminSidebar({ 
    isMobileMenuOpen, 
    setIsMobileMenuOpen 
}: { 
    isMobileMenuOpen: boolean, 
    setIsMobileMenuOpen: (val: boolean) => void 
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("adminSidebarCollapsed");
        if (stored === "true") setIsCollapsed(true);
    }, []);

    const toggleCollapse = () => {
        const newVal = !isCollapsed;
        setIsCollapsed(newVal);
        localStorage.setItem("adminSidebarCollapsed", newVal.toString());
    };

    const navItems = [
        { name: "Workspace", href: "/admin", icon: LayoutDashboard },
        { name: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
        { name: "Insumos & Stock", href: "/admin/products", icon: Package },
        { name: "Categorías", href: "/admin/categories", icon: Tags },
        { name: "Usuarios", href: "/admin/users", icon: Users },
        { name: "Clientes", href: "/admin/customers", icon: BadgeDollarSign },
        { name: "Consultas", href: "/admin/messages", icon: MessageSquare },
        { name: "Configuración", href: "/admin/settings", icon: Settings },
    ];

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await supabase.auth.signOut();
        router.push('/');
    };

    const sidebarContent = (isMobile: boolean = false) => {
        const collapsed = isMobile ? false : isCollapsed;
        return (
            <>
                <div className={cn("p-6 flex items-center border-b border-outline-variant shrink-0", collapsed ? "justify-center px-0" : "justify-between")}>
                    <Link href="/" className={cn("font-bold tracking-tight text-primary flex items-center gap-2", collapsed ? "justify-center" : "")}>
                        <span className="material-symbols-outlined text-primary material-symbols-fill text-2xl">layers</span>
                        {!collapsed && (
                            <span className="flex items-center text-xl">
                                pfstudio <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider ml-1 mt-1">Admin</span>
                            </span>
                        )}
                    </Link>
                    {isMobile && (
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                    {!collapsed && (
                        <div className="px-3 py-2 text-xs font-bold text-secondary uppercase tracking-widest mb-1">
                            Gestión Taller
                        </div>
                    )}
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : undefined}
                                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 py-2.5 rounded-xl text-label-md font-label-md transition-all",
                                    collapsed ? "justify-center px-0" : "px-3",
                                    isActive 
                                        ? "bg-primary-container text-on-primary-container font-bold" 
                                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-outline")} />
                                {!collapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </div>
                
                <div className="p-4 border-t border-outline-variant shrink-0 space-y-2">
                    <button 
                        onClick={handleLogout}
                        title={collapsed ? "Cerrar Sesión" : undefined}
                        className={cn(
                            "flex items-center gap-3 py-2.5 w-full rounded-xl text-label-md font-label-md text-error hover:bg-error-container hover:text-on-error-container transition-colors",
                            collapsed ? "justify-center px-0" : "px-3"
                        )}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>Cerrar Sesión</span>}
                    </button>
                    
                    {/* Desktop Collapse Toggle */}
                    {!isMobile && (
                        <button
                            onClick={toggleCollapse}
                            className={cn(
                                "flex items-center gap-3 py-2.5 w-full rounded-xl text-label-md font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors",
                                collapsed ? "justify-center px-0" : "px-3"
                            )}
                        >
                            {collapsed ? <ChevronRight className="w-5 h-5 shrink-0" /> : <ChevronLeft className="w-5 h-5 shrink-0" />}
                            {!collapsed && <span>Contraer Menú</span>}
                        </button>
                    )}
                </div>
            </>
        );
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside 
                className={cn(
                    "bg-surface-container-lowest border-r border-outline-variant flex-col hidden md:flex h-screen sticky top-0 shrink-0 transition-all duration-300",
                    isCollapsed ? "w-20" : "w-72"
                )}
            >
                {sidebarContent(false)}
            </aside>

            {/* Mobile Sidebar overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div 
                        className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <aside className="relative flex flex-col w-72 h-full bg-surface-container-lowest border-r border-outline-variant animate-slideInRight shadow-xl">
                        {sidebarContent(true)}
                    </aside>
                </div>
            )}

            <ProcessingOverlay
                isOpen={isLoggingOut}
                type="auth"
                title="Cerrando Sesión..."
                subtitle="Hasta pronto."
            />
        </>
    );
}
