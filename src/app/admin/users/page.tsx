"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Search, Loader2, ArrowUpDown, Shield, Trash2, TrendingUp, DollarSign, ShoppingBag, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { sileo } from "sileo";

import { getAdminUsers } from "./actions";

interface CustomerProfile {
    id?: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    firstSeen: string;
    lastSeen: string;
    isAdmin: boolean;
}

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
            const result = await getAdminUsers();
            if (!result.success || !result.data) {
                console.warn("Could not fetch orders for customer directory:", result.error);
                setUsers([]);
                setFilteredUsers([]);
                return;
            }

            const userList = result.data as CustomerProfile[];
            setUsers(userList);
            setFilteredUsers(userList);
        } catch (error) {
            console.error("Fetch users error:", error);
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
                <Loader2 className="w-8 h-8 animate-spin text-main" />
            </div>
        );
    }

    const totalSpentGlobal = filteredUsers.reduce((sum, u) => sum + u.totalSpent, 0);
    const totalOrdersGlobal = filteredUsers.reduce((sum, u) => sum + u.totalOrders, 0);
    const avgLifeTimeValue = filteredUsers.length > 0 ? totalSpentGlobal / filteredUsers.length : 0;
    const avgOrdersPerUser = filteredUsers.length > 0 ? totalOrdersGlobal / filteredUsers.length : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 font-sans">
            
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242520] pb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">Directorio de Clientes</h2>
                    <p className="text-gray-400 mt-1 text-sm font-medium">Gestión y registro de usuarios y clientes activos de la tienda.</p>
                </div>
            </header>

            {/* Dashboard Header / Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 bg-linear-to-br from-orange-500/20 via-orange-950/20 to-[#1c1d18] border border-main/30 p-6 rounded-2xl relative overflow-hidden group shadow-lg">
                    <div className="relative z-10">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total de Clientes Activos</p>
                        <h2 className="text-4xl font-black text-white mt-2 font-sans">{filteredUsers.length}</h2>
                        <div className="mt-4 flex items-center gap-2 text-main bg-main/10 border border-main/20 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Datos en Tiempo Real</span>
                        </div>
                    </div>
                    <div className="absolute right-[-5%] bottom-[-40%] opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 pointer-events-none">
                        <Users className="w-64 h-64 text-main" strokeWidth={1} />
                    </div>
                </div>
                
                <div className="bg-[#1c1d18]/60 backdrop-blur-md p-6 rounded-2xl border border-[#2d2e26] relative overflow-hidden group hover:border-main/40 transition-all duration-300 shadow-lg">
                    <div className="w-12 h-12 bg-main/10 border border-main/20 text-main rounded-xl flex items-center justify-center mb-4 relative z-10">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10">Gasto Promedio por Cliente</p>
                    <h3 className="text-white text-2xl font-black mt-1 relative z-10 font-sans">${avgLifeTimeValue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</h3>
                </div>
                
                <div className="bg-[#1c1d18]/60 backdrop-blur-md p-6 rounded-2xl border border-[#2d2e26] relative overflow-hidden group hover:border-main/40 transition-all duration-300 shadow-lg">
                    <div className="w-12 h-12 bg-main/10 border border-main/20 text-main rounded-xl flex items-center justify-center mb-4 relative z-10">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10">Promedio de Pedidos</p>
                    <h3 className="text-white text-2xl font-black mt-1 relative z-10 font-sans">{avgOrdersPerUser.toFixed(1)}</h3>
                </div>
            </div>

            {/* Users Table Section */}
            <section className="bg-[#1c1d18]/60 backdrop-blur-md rounded-2xl overflow-hidden border border-[#2d2e26] shadow-lg">
                <div className="px-6 py-5 flex flex-col xl:flex-row justify-between xl:items-center border-b border-[#2d2e26] gap-4">
                    <h3 className="text-lg font-bold text-foreground font-sans">Directorio de Clientes</h3>
                    
                    <div className="flex gap-2 w-full xl:w-auto">
                        <div className="relative max-w-md w-full xl:w-64 mr-2">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar por email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs bg-[#12130f] text-white border border-[#2d2e26] rounded-xl focus:border-main transition-all outline-none"
                            />
                        </div>
                        <button className="px-3.5 py-2 bg-[#12130f] border border-[#2d2e26] rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:border-main/30 transition-all flex items-center gap-2">
                            <Filter className="w-4 h-4 text-main" /> Filtrar
                        </button>
                        <button className="px-3.5 py-2 bg-[#12130f] border border-[#2d2e26] rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:border-main/30 transition-all flex items-center gap-2">
                            <Download className="w-4 h-4 text-main" /> Exportar
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#12130f]/60 border-b border-[#2d2e26]">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('email')}>
                                    <div className="flex items-center gap-1">Usuario {sortField === 'email' && <ArrowUpDown className="w-3 h-3 text-main" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('isAdmin')}>
                                    <div className="flex items-center gap-1">Rol {sortField === 'isAdmin' && <ArrowUpDown className="w-3 h-3 text-main" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('totalOrders')}>
                                    <div className="flex items-center gap-1">Pedidos {sortField === 'totalOrders' && <ArrowUpDown className="w-3 h-3 text-main" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('totalSpent')}>
                                    <div className="flex items-center gap-1">Total Gastado {sortField === 'totalSpent' && <ArrowUpDown className="w-3 h-3 text-main" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d2e26]">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-gray-500 text-sm font-medium">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, idx) => (
                                    <tr key={idx} className="group hover:bg-[#252620]/30 transition-colors duration-200">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-9 h-9 rounded-full overflow-hidden border flex items-center justify-center font-bold shrink-0 text-xs ${user.isAdmin ? 'border-main bg-main/20 text-main' : 'border-[#2d2e26] bg-[#12130f] text-gray-300'}`}>
                                                    {user.email.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-white transition-colors" title={user.email}>{user.email.split('@')[0]}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 max-w-45 truncate" title={user.email}>{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {user.id ? (
                                                <span className="bg-main/10 text-main px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-main/20">Activo</span>
                                            ) : (
                                                <span className="bg-gray-800/40 text-gray-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-700/40" title="Usuario Invitado (Sin Registro)">Invitado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            {user.isAdmin ? (
                                                <span className="text-xs font-bold text-main flex items-center gap-1.5 uppercase tracking-wider">
                                                    <Shield className="w-3.5 h-3.5" /> Administrador
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                                                    Cliente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-white">{user.totalOrders}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-main">${user.totalSpent.toLocaleString("es-AR")}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {!user.isAdmin && user.id ? (
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 border border-transparent hover:border-red-500/20 transition-colors"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : !user.id ? (
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Invitado</span>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="px-6 py-4 bg-[#12130f]/60 border-t border-[#2d2e26] flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-medium">Mostrando <span className="text-white font-bold">{filteredUsers.length}</span> de <span className="text-white font-bold">{users.length}</span> clientes</p>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1c1d18] border border-[#2d2e26] text-gray-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-main text-black font-bold text-xs">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1c1d18] border border-[#2d2e26] text-gray-400 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </section>
        </div>
    );
}

