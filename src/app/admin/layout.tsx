"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/features/dashboard/components/AdminSidebar";
import AdminHeader from "@/features/dashboard/components/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const isAdmin = useAuthStore((state) => state.isAdmin);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const router = useRouter();
    
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
    }, [isInitialized, user, isAdmin]);

    useEffect(() => {
        if (isInitialized) {
            if (!user || !isAdmin) {
                router.replace('/');
            }
        }
    }, [user, isInitialized, isAdmin, router]);

    if (!isInitialized || !user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden selection:bg-primary selection:text-on-primary">
            <AdminSidebar 
                isMobileMenuOpen={isMobileMenuOpen} 
                setIsMobileMenuOpen={setIsMobileMenuOpen} 
            />

            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <AdminHeader 
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    pendingOrdersCount={pendingOrdersCount}
                    lowStockCount={lowStockCount}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface-container-lowest">
                    {children}
                </div>
            </main>
        </div>
    );
}
