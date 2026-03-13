"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Mail, Loader2 } from "lucide-react";

interface Customer {
    email: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
}

export default function UsersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            // Extrayendo usuarios únicos de los pedidos ya que no usamos auth.users directamente
            const { data: orders, error } = await supabase
                .from('orders')
                .select('user_email, total, created_at');

            if (!error && orders) {
                const customerMap = new Map<string, Customer>();

                orders.forEach(order => {
                    const email = order.user_email;
                    if (!email) return;

                    const existing = customerMap.get(email);
                    const orderTotal = Number(order.total || 0);

                    if (existing) {
                        existing.orderCount += 1;
                        existing.totalSpent += orderTotal;
                        if (new Date(order.created_at) > new Date(existing.lastOrder)) {
                            existing.lastOrder = order.created_at;
                        }
                    } else {
                        customerMap.set(email, {
                            email,
                            orderCount: 1,
                            totalSpent: orderTotal,
                            lastOrder: order.created_at
                        });
                    }
                });

                setCustomers(Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent));
            }
        } catch (err) {
            console.error("Error fetching customers", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Clientes</h1>
                    <p className="text-sm text-gray-400">Listado de usuarios que han interactuado con la tienda.</p>
                </div>
                <div className="bg-[#1e212b] border border-[#2a2e3b] px-4 py-2 rounded-lg text-sm text-gray-300 flex items-center gap-2 w-fit">
                    <Users className="w-4 h-4 text-gray-400" />
                    {customers.length} Clientes Únicos
                </div>
            </div>

            <div className="bg-[#0c0e15] rounded-2xl border border-[#1e212b] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/5 dark:bg-zinc-900/30 border-b border-[#1e212b]">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pedidos</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Gastado</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Último Pedido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e212b]">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center text-gray-500">
                                        <Users className="w-12 h-12 mx-auto text-gray-500/50 mb-3" />
                                        <p>No hay clientes registrados aún.</p>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.email} className="hover:bg-[#141722] transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-[#1e212b] border border-[#2a2e3b] flex items-center justify-center text-sm font-medium text-gray-400 shrink-0">
                                                    {customer.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[var(--foreground)] font-medium text-sm">{customer.email.split('@')[0]}</span>
                                                    <span className="text-gray-500 text-xs">{customer.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-300 text-sm font-medium">
                                            {customer.orderCount}
                                        </td>
                                        <td className="py-4 px-6 text-gray-300 text-sm font-bold text-[var(--color-main)]">
                                            ${customer.totalSpent.toLocaleString("es-AR")}
                                        </td>
                                        <td className="py-4 px-6 text-gray-400 text-sm">
                                            {new Date(customer.lastOrder).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
