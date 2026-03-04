"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, LogOut, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const router = useRouter();
    const pathname = usePathname();

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
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Productos", href: "/admin/products", icon: Package },
        { name: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 p-6 flex-col hidden md:flex sticky top-0 h-screen">
                <div className="mb-10">
                    <h1 className="text-2xl font-black tracking-widest text-[var(--foreground)]">PFSTUDIO</h1>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-main)] font-bold">Admin Panel</span>
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
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[var(--foreground)] text-[var(--background)]"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-gray-200 dark:border-zinc-800 flex flex-col gap-2">
                    <p className="text-xs text-gray-400 px-4 mb-2 truncate">Sesión: {user.email}</p>
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-[var(--foreground)] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Ir a la Tienda
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-4 flex items-center justify-between">
                    <h1 className="font-bold tracking-widest">PFSTUDIO <span className="text-[var(--color-main)]">ADMIN</span></h1>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
