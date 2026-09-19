"use client";

import { Bell, Search, Store, Menu } from "lucide-react";
import Link from "next/link";

export default function AdminHeader({ 
    setIsMobileMenuOpen,
    pendingOrdersCount,
    lowStockCount
}: {
    setIsMobileMenuOpen: (val: boolean) => void,
    pendingOrdersCount: number,
    lowStockCount: number
}) {
    return (
        <header className="h-16 border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 shrink-0">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:flex items-center gap-2 text-on-surface-variant bg-surface-container rounded-lg px-3 py-1.5 border border-outline-variant w-64 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                    <Search className="w-4 h-4" />
                    <input type="text" placeholder="Buscar pedido, cliente..." className="bg-transparent border-none outline-none text-label-md font-label-md w-full placeholder:text-outline" />
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
                <Link href="/" className="hidden sm:flex items-center gap-2 text-label-sm font-label-sm font-bold uppercase tracking-wider text-secondary bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
                    <Store className="w-4 h-4" />
                    Ver Tienda
                </Link>
                
                <button className="relative p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    {(pendingOrdersCount > 0 || lowStockCount > 0) && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error border border-surface-container-lowest animate-pulse"></span>
                    )}
                </button>
                
                <div className="h-6 w-px bg-outline-variant hidden sm:block"></div>
                
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-label-md font-bold text-on-surface">Taller Central</p>
                        <p className="text-label-sm font-label-sm text-outline">Admin Workspace</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold border border-primary/20 shadow-sm">
                        TC
                    </div>
                </div>
            </div>
        </header>
    );
}
