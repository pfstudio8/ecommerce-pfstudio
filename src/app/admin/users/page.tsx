"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Search, Loader2, ArrowUpDown, Shield, User as UserIcon, Trash2 } from "lucide-react";

interface CustomerProfile {
    id?: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    firstSeen: string;
    lastSeen: string;
    isAdmin: boolean;
}

const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<CustomerProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<CustomerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<keyof CustomerProfile>("totalSpent");
    const [sortAsc, setSortAsc] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Fetch registered users (from our profiles table)
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, email, created_at');

            // Log error if any (profiles table might not exist yet)
            if (profilesError) {
                console.error("Profiles fetch error (maybe table missing?):", profilesError);
            }

            // Fetch all orders to aggregate user data
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('customer_email, total_amount, created_at');

            if (ordersError) {
                console.error("Error fetching orders for users", ordersError);
            }

            const userMap = new Map<string, CustomerProfile>();

            // 1. First populate map with all registered users (even if 0 orders)
            profilesData?.forEach(profile => {
                const email = profile.email || 'Sin Correo';
                userMap.set(email, {
                    id: profile.id,
                    email,
                    totalOrders: 0,
                    totalSpent: 0,
                    firstSeen: profile.created_at || new Date().toISOString(),
                    lastSeen: profile.created_at || new Date().toISOString(),
                    isAdmin: ADMIN_EMAILS.includes(email)
                });
            });

            // 2. Then merge in all the orders data (registered + guest buyers)
            ordersData?.forEach(order => {
                const email = order.customer_email || 'Sin Correo';
                const current = userMap.get(email);

                if (!current) {
                    userMap.set(email, {
                        email,
                        totalOrders: 1,
                        totalSpent: Number(order.total_amount || 0),
                        firstSeen: order.created_at,
                        lastSeen: order.created_at,
                        isAdmin: ADMIN_EMAILS.includes(email)
                    });
                } else {
                    current.totalOrders += 1;
                    current.totalSpent += Number(order.total_amount || 0);
                    // Update dates
                    const orderDate = new Date(order.created_at).getTime();
                    const firstDate = new Date(current.firstSeen).getTime();
                    const lastDate = new Date(current.lastSeen).getTime();

                    if (orderDate < firstDate) current.firstSeen = order.created_at;
                    if (orderDate > lastDate) current.lastSeen = order.created_at;
                }
            });

            const userList = Array.from(userMap.values());
            // Default sort by spent desc
            userList.sort((a, b) => b.totalSpent - a.totalSpent);

            setUsers(userList);
            setFilteredUsers(userList);
        } catch (error) {
            console.error("Fetch errors", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = users.filter(u => u.email.toLowerCase().includes(lower));

        result.sort((a, b) => {
            let valA: any = a[sortField] ?? "";
            let valB: any = b[sortField] ?? "";
            
            if (valA < valB) return sortAsc ? -1 : 1;
            if (valA > valB) return sortAsc ? 1 : -1;
            return 0;
        });

        setFilteredUsers(result);
    }, [searchTerm, sortField, sortAsc, users]);

    const handleSort = (field: keyof CustomerProfile) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(false); // default desc for new fields
        }
    };

    const handleDeleteUser = async (id: string | undefined, email: string) => {
        if (!id) {
            alert("Este usuario no tiene un perfil registrado (es un usuario invitado) o no se encontró su ID.");
            return;
        }

        const confirmData = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${email}? Esta acción no se puede deshacer.`);
        if (!confirmData) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // actualizar estado
                setUsers(prev => prev.filter(u => u.id !== id));
                setFilteredUsers(prev => prev.filter(u => u.id !== id));
                /* Opcionalmente recargar: fetchUsers() */
                alert("Usuario eliminado correctamente.");
            } else {
                throw new Error(data.error || "Error al eliminar usuario del sistema.");
            }
        } catch (error: any) {
            console.error("Error eliminando usuario:", error);
            alert(`Error: ${error.message}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" />
            </div>
        );
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
                    {users.length} Clientes Únicos
                </div>
            </div>

            <div className="bg-[#0c0e15] rounded-2xl border border-[#1e212b] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#1e212b] flex flex-col sm:flex-row gap-4 justify-between bg-[#0c0e15]">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por correo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-[#1e212b] text-white border-[#2a2e3b] rounded-xl focus:ring-2 focus:ring-[var(--color-main)] focus:border-transparent transition-all outline-none border"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/5 dark:bg-zinc-900/30 border-b border-[#1e212b]">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('totalOrders')}>
                                    <div className="flex items-center gap-1">
                                        Pedidos <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('totalSpent')}>
                                    <div className="flex items-center gap-1">
                                        Total Gastado <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('lastSeen')}>
                                    <div className="flex items-center gap-1">
                                        Última Compra <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e212b]">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-gray-500">
                                        No se encontraron usuarios con esos filtros.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, idx) => (
                                    <tr key={idx} className="hover:bg-[#141722] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[var(--foreground)] font-medium text-sm truncate max-w-[200px]" title={user.email}>
                                                        {user.email.split('@')[0]}
                                                    </span>
                                                    <span className="text-gray-500 text-xs truncate max-w-[200px]" title={user.email}>{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-300">
                                            {user.totalOrders}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-[var(--color-main)]">
                                            ${user.totalSpent.toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {new Date(user.lastSeen).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isAdmin ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    <Shield className="w-3 h-3" /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#1e212b] text-gray-400 border border-[#2a2e3b]">
                                                    <UserIcon className="w-3 h-3" /> Cliente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!user.isAdmin && user.id && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {!user.isAdmin && !user.id && (
                                                <span className="text-xs text-gray-600 block pt-2" title="Usuario sin registrar (compra como invitado)">Invitado</span>
                                            )}
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
