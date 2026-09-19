"use client";
import { FourSquare } from "react-loading-indicators";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Search, Loader2, ArrowUpDown, Shield, Trash2, TrendingUp, DollarSign, ShoppingBag, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { getAdminUsers } from "./actions";

interface CustomerProfile {
    id?: string;
    email: string;
    firstSeen: string;
    lastSeen: string;
    isAdmin: boolean;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<CustomerProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<CustomerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<keyof CustomerProfile>("firstSeen");
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
            toast.info("Este usuario no tiene un perfil registrado (es un usuario invitado) o no se encontró su ID.");
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
                toast.success("Usuario eliminado correctamente.");
            } else {
                throw new Error(data.error || "Error al eliminar usuario del sistema.");
            }
        } catch (error: any) {
            console.error("Error eliminando usuario:", error);
            toast.error(error.message);
        }
    };


    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 font-sans">
            
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-sans">Directorio de Usuarios</h2>
                    <p className="text-outline mt-1 text-sm font-medium">Gestión de cuentas registradas en la plataforma.</p>
                </div>
            </header>

            {/* Users Table Section */}
            <section className="bg-surface-container-low backdrop-blur-md rounded-2xl overflow-hidden border border-outline-variant shadow-lg">
                <div className="px-6 py-5 flex flex-col xl:flex-row justify-between xl:items-center border-b border-outline-variant gap-4">
                    <h3 className="text-lg font-bold text-on-surface font-sans">Cuentas Registradas</h3>
                    
                    <div className="flex gap-2 w-full xl:w-auto">
                        <div className="relative max-w-md w-full xl:w-64 mr-2">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                            <input
                                type="text"
                                placeholder="Buscar por email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs bg-surface text-on-surface border border-outline-variant rounded-xl focus:border-primary transition-all outline-none"
                            />
                        </div>
                        <button className="px-3.5 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface hover:border-primary transition-all flex items-center gap-2">
                            <Filter className="w-4 h-4 text-primary" /> Filtrar
                        </button>
                        <button className="px-3.5 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface hover:border-primary transition-all flex items-center gap-2">
                            <Download className="w-4 h-4 text-primary" /> Exportar
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-outline-variant">
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface transition-colors" onClick={() => handleSort('email')}>
                                    <div className="flex items-center gap-1">Usuario {sortField === 'email' && <ArrowUpDown className="w-3 h-3 text-primary" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface transition-colors" onClick={() => handleSort('isAdmin')}>
                                    <div className="flex items-center gap-1">Rol {sortField === 'isAdmin' && <ArrowUpDown className="w-3 h-3 text-primary" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface transition-colors" onClick={() => handleSort('firstSeen')}>
                                    <div className="flex items-center gap-1">Registro {sortField === 'firstSeen' && <ArrowUpDown className="w-3 h-3 text-primary" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface transition-colors" onClick={() => handleSort('lastSeen')}>
                                    <div className="flex items-center gap-1">Último Acceso {sortField === 'lastSeen' && <ArrowUpDown className="w-3 h-3 text-primary" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d2e26]">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-outline text-sm font-medium">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, idx) => (
                                    <tr key={idx} className="group hover:bg-surface-container-highest/30 transition-colors duration-200">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-9 h-9 rounded-full overflow-hidden border flex items-center justify-center font-bold shrink-0 text-xs ${user.isAdmin ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant bg-surface text-on-surface-variant'}`}>
                                                    {user.email.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-on-surface line-clamp-1 group-hover:text-on-surface transition-colors" title={user.email}>{user.email.split('@')[0]}</p>
                                                    <p className="text-xs text-outline mt-0.5 max-w-45 truncate" title={user.email}>{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {user.id ? (
                                                <span className="bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary">Activo</span>
                                            ) : (
                                                <span className="bg-surface-container text-outline px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-outline-variant" title="Usuario Invitado (Sin Registro)">Invitado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            {user.isAdmin ? (
                                                <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                                                    <Shield className="w-3.5 h-3.5" /> Administrador
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-on-surface-variant flex items-center gap-1.5">
                                                    Cliente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-on-surface">{new Date(user.firstSeen).toLocaleDateString("es-AR", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-on-surface-variant">{new Date(user.lastSeen).toLocaleDateString("es-AR", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {!user.isAdmin && user.id ? (
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 border border-transparent hover:border-error/20 transition-colors"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : !user.id ? (
                                                <span className="text-[10px] text-outline uppercase tracking-wider font-bold">Invitado</span>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="px-6 py-4 bg-surface border-t border-outline-variant flex items-center justify-between">
                    <p className="text-xs text-outline font-medium">Mostrando <span className="text-on-surface font-bold">{filteredUsers.length}</span> de <span className="text-on-surface font-bold">{users.length}</span> usuarios</p>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-low border border-outline-variant text-outline hover:text-on-surface transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container font-bold text-xs">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-low border border-outline-variant text-outline hover:text-on-surface transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </section>
        </div>
    );
}

