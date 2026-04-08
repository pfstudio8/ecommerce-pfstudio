"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Search, Loader2, ArrowUpDown, Shield, User as UserIcon, Trash2, TrendingUp, DollarSign, ShoppingBag, Filter, Download, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { sileo } from "sileo";

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
            sileo.info({ title: "Atención", description: "Este usuario no tiene un perfil registrado (es un usuario invitado) o no se encontró su ID." });
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
                setUsers(prev => prev.filter(u => u.id !== id));
                setFilteredUsers(prev => prev.filter(u => u.id !== id));
                sileo.success({ title: "Usuario eliminado correctamente." });
            } else {
                throw new Error(data.error || "Error al eliminar usuario del sistema.");
            }
        } catch (error: any) {
            console.error("Error eliminando usuario:", error);
            sileo.error({ title: "Error", description: error.message });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#85adff]" />
            </div>
        );
    }

    // [Derived metric data]
    const totalSpentGlobal = filteredUsers.reduce((sum, u) => sum + u.totalSpent, 0);
    const totalOrdersGlobal = filteredUsers.reduce((sum, u) => sum + u.totalOrders, 0);
    const avgLifeTimeValue = filteredUsers.length > 0 ? totalSpentGlobal / filteredUsers.length : 0;
    const avgOrdersPerUser = filteredUsers.length > 0 ? totalOrdersGlobal / filteredUsers.length : 0;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            
            {/* Dashboard Header / Metrics Jewel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#85adff] to-[#699cff] p-8 rounded-xl shadow-[0_24px_48px_-12px_rgba(133,173,255,0.2)] relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="font-['Inter'] text-[#000000]/80 text-sm font-medium">Total Active Customers</p>
                        <h2 className="font-['Manrope'] text-5xl font-extrabold text-[#000000] mt-2">{filteredUsers.length}</h2>
                        <div className="mt-6 flex items-center gap-2 text-[#000000] bg-black/10 w-fit px-3 py-1 rounded-full text-xs font-bold">
                            <TrendingUp className="w-4 h-4" />
                            <span>Datos en Tiempo Real</span>
                        </div>
                    </div>
                    <div className="absolute right-[-5%] bottom-[-40%] opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                        <Users className="w-64 h-64 text-[#000000]" strokeWidth={1} />
                    </div>
                </div>
                
                <div className="bg-[#19191c] p-6 rounded-xl border border-[#48474a]/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#69f6b8]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="w-12 h-12 bg-[#262528] text-[#69f6b8] rounded-full flex items-center justify-center mb-4 border border-[#69f6b8]/20 relative z-10">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <p className="font-['Inter'] text-[#adaaad] text-sm relative z-10">Avg. Life-time Value</p>
                    <h3 className="font-['Manrope'] text-[#f9f5f8] text-2xl font-bold mt-1 relative z-10">${avgLifeTimeValue.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</h3>
                </div>
                
                <div className="bg-[#19191c] p-6 rounded-xl border border-[#48474a]/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ac8aff]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="w-12 h-12 bg-[#262528] text-[#ac8aff] rounded-full flex items-center justify-center mb-4 border border-[#ac8aff]/20 relative z-10">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="font-['Inter'] text-[#adaaad] text-sm relative z-10">Avg. Orders / User</p>
                    <h3 className="font-['Manrope'] text-[#f9f5f8] text-2xl font-bold mt-1 relative z-10">{avgOrdersPerUser.toFixed(1)}</h3>
                </div>
            </div>

            {/* Users Table Section */}
            <section className="bg-[#19191c] rounded-xl overflow-hidden shadow-2xl border border-[#48474a]/10">
                <div className="px-8 py-6 flex flex-col xl:flex-row justify-between xl:items-center border-b border-[#48474a]/10 gap-4">
                    <h3 className="font-['Manrope'] text-[#f9f5f8] text-xl font-bold">User Directory</h3>
                    
                    <div className="flex gap-2 w-full xl:w-auto">
                        <div className="relative max-w-md w-full xl:w-64 mr-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#adaaad]" />
                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-[#131315] text-[#f9f5f8] border border-[#48474a]/20 rounded-lg focus:ring-1 focus:ring-[#85adff] focus:border-transparent transition-all outline-none"
                            />
                        </div>
                        <button className="bg-[#262528] text-[#f9f5f8] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-[#48474a]/10 hover:bg-[#2c2c2f] transition-colors">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                        <button className="bg-[#262528] text-[#f9f5f8] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-[#48474a]/10 hover:bg-[#2c2c2f] transition-colors">
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#131315]/50 border-b border-[#48474a]/10">
                                <th className="px-8 py-4 font-['Manrope'] text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad] cursor-pointer hover:text-[#f9f5f8] transition-colors" onClick={() => handleSort('email')}>
                                    <div className="flex items-center gap-1">User {sortField === 'email' && <ArrowUpDown className="w-3 h-3" />}</div>
                                </th>
                                <th className="px-8 py-4 font-['Manrope'] text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad]">
                                    Status
                                </th>
                                <th className="px-8 py-4 font-['Manrope'] text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad] cursor-pointer hover:text-[#f9f5f8] transition-colors" onClick={() => handleSort('isAdmin')}>
                                    <div className="flex items-center gap-1">Role {sortField === 'isAdmin' && <ArrowUpDown className="w-3 h-3" />}</div>
                                </th>
                                <th className="px-8 py-4 font-['Manrope'] text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad] cursor-pointer hover:text-[#f9f5f8] transition-colors" onClick={() => handleSort('totalOrders')}>
                                    <div className="flex items-center gap-1">Orders {sortField === 'totalOrders' && <ArrowUpDown className="w-3 h-3" />}</div>
                                </th>
                                <th className="px-8 py-4 font-['Manrope'] text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad] cursor-pointer hover:text-[#f9f5f8] transition-colors" onClick={() => handleSort('totalSpent')}>
                                    <div className="flex items-center gap-1">Total Spent {sortField === 'totalSpent' && <ArrowUpDown className="w-3 h-3" />}</div>
                                </th>
                                <th className="px-8 py-4 font-['Manrope'] text-[11px] font-extrabold uppercase tracking-widest text-[#adaaad] text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#48474a]/10">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-[#adaaad]">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, idx) => (
                                    <tr key={idx} className="group hover:bg-[#1f1f22] transition-colors duration-200">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                {user.isAdmin ? (
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ac8aff]/30 bg-[#262528] flex items-center justify-center text-[#ac8aff] font-bold shrink-0 shadow-[0_0_15px_rgba(172,138,255,0.1)]">
                                                        {user.email.substring(0, 2).toUpperCase()}
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#85adff]/30 bg-[#262528] flex items-center justify-center text-[#85adff] font-bold shrink-0">
                                                        {user.email.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-sm text-[#f9f5f8] line-clamp-1" title={user.email}>{user.email.split('@')[0]}</p>
                                                    <p className="text-xs text-[#adaaad] mt-0.5 max-w-[150px] truncate" title={user.email}>{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.id ? (
                                                <span className="bg-[#69f6b8]/10 text-[#69f6b8] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider line-clamp-1 border border-[#69f6b8]/20">Active</span>
                                            ) : (
                                                <span className="bg-[#48474a]/20 text-[#adaaad] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider line-clamp-1 border border-[#48474a]/20" title="Usuario Invitado (Sin Registro)">Guest</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.isAdmin ? (
                                                <span className="text-sm font-bold text-[#ac8aff] flex items-center gap-1.5">
                                                    <Shield className="w-3.5 h-3.5" /> Admin
                                                </span>
                                            ) : (
                                                <span className="text-sm font-medium text-[#f9f5f8] flex items-center gap-1.5">
                                                    Customer
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-[#f9f5f8]">{user.totalOrders}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-[#85adff]">${user.totalSpent.toLocaleString("es-AR")}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {!user.isAdmin && user.id ? (
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#adaaad] hover:text-[#ff716c] hover:bg-[#ff716c]/10 transition-colors"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : !user.id ? (
                                                <span className="text-[10px] text-[#adaaad] uppercase tracking-wider">Invitado</span>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="px-8 py-6 bg-[#131315]/30 border-t border-[#48474a]/10 flex items-center justify-between">
                    <p className="text-xs text-[#adaaad] font-medium">Showing <span className="text-[#f9f5f8]">{filteredUsers.length}</span> of <span className="text-[#f9f5f8]">{users.length}</span> customers</p>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#262528] text-[#f9f5f8] hover:bg-[#2c2c2f] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#85adff] text-[#000000] font-bold text-xs">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#262528] text-[#f9f5f8] hover:bg-[#2c2c2f] transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </section>
        </div>
    );
}
