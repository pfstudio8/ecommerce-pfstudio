"use client";

import { useEffect, useState } from "react";
import { 
    getAdminUsers, 
    updateUserRole, 
    createUserOrInvite, 
    toggleUserActive,
    AdminUserData 
} from "./actions";
import { 
    Users, 
    Search, 
    ArrowUpDown, 
    Shield, 
    Trash2, 
    Mail, 
    CheckCircle2, 
    UserCheck, 
    ShieldAlert, 
    Briefcase,
    UserPlus,
    XCircle,
    Loader2,
    Ban,
    Check
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<AdminUserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<keyof AdminUserData>("firstSeen");
    const [sortAsc, setSortAsc] = useState(false);
    const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
    const [isTogglingActive, setIsTogglingActive] = useState<string | null>(null);

    // Modal state for creating/inviting user
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");
    const [inviteRole, setInviteRole] = useState<'admin' | 'employee' | 'customer'>("employee");
    const [invitePassword, setInvitePassword] = useState("");
    const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
    const [createdCredentialNotice, setCreatedCredentialNotice] = useState<{ email: string; password?: string } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const result = await getAdminUsers();
            if (!result.success || !result.data) {
                toast.error("Error al cargar la lista de usuarios: " + (result.error || ""));
            } else {
                setUsers(result.data);
                setFilteredUsers(result.data);
            }
        } catch (err: any) {
            toast.error("Error inesperado: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let res = [...users];
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            res = res.filter(u => u.email.toLowerCase().includes(term) || (u.name && u.name.toLowerCase().includes(term)));
        }

        res.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (valA === undefined) return 1;
            if (valB === undefined) return -1;
            return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });

        setFilteredUsers(res);
    }, [searchTerm, users, sortField, sortAsc]);

    const handleSort = (field: keyof AdminUserData) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'employee' | 'customer') => {
        setIsUpdatingRole(userId);
        try {
            const res = await updateUserRole(userId, newRole);
            if (res.success) {
                toast.success(`Rol actualizado a "${newRole}"`);
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, isAdmin: newRole === 'admin' || newRole === 'employee' } : u));
            } else {
                toast.error(res.error || "Error al actualizar rol");
            }
        } catch (err: any) {
            toast.error(err.message || "Error al actualizar rol");
        } finally {
            setIsUpdatingRole(null);
        }
    };

    const handleToggleActive = async (userId: string, currentActive: boolean) => {
        const actionLabel = currentActive ? "desactivar" : "reactivar";
        if (!confirm(`¿Estás seguro de que deseas ${actionLabel} la cuenta de este usuario?`)) return;

        setIsTogglingActive(userId);
        try {
            const res = await toggleUserActive(userId, !currentActive);
            if (res.success) {
                toast.success(`Usuario ${currentActive ? 'desactivado' : 'reactivado'} correctamente.`);
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !currentActive } : u));
            } else {
                toast.error(res.error || `Error al ${actionLabel} usuario`);
            }
        } catch (err: any) {
            toast.error(err.message || `Error al ${actionLabel} usuario`);
        } finally {
            setIsTogglingActive(null);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingInvite(true);
        try {
            const res = await createUserOrInvite({
                email: inviteEmail,
                fullName: inviteName,
                role: inviteRole,
                password: invitePassword.trim() || undefined
            });

            if (res.success) {
                toast.success(`Usuario ${inviteEmail} creado con rol "${inviteRole}".`);
                if (res.generatedPassword) {
                    setCreatedCredentialNotice({
                        email: inviteEmail,
                        password: res.generatedPassword
                    });
                } else {
                    setIsInviteOpen(false);
                    resetInviteForm();
                }
                fetchUsers();
            } else {
                toast.error(res.error || "Error al registrar usuario");
            }
        } catch (err: any) {
            toast.error(err.message || "Error al crear usuario");
        } finally {
            setIsSubmittingInvite(false);
        }
    };

    const resetInviteForm = () => {
        setInviteEmail("");
        setInviteName("");
        setInviteRole("employee");
        setInvitePassword("");
        setCreatedCredentialNotice(null);
    };

    const handleDeleteUser = async (id?: string, email?: string) => {
        if (!id) return;
        if (!confirm(`¿Estás COMPLETAMENTE seguro de eliminar al usuario ${email}? Esta acción no se puede deshacer y borrará su cuenta permanentemente.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al eliminar usuario');
            }

            toast.success("Usuario eliminado correctamente.");
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err: any) {
            console.error("Error deleting user:", err);
            toast.error(err.message || "No se pudo eliminar el usuario");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-1 font-sans">
                        Usuarios y Empleados
                    </h1>
                    <p className="text-sm text-outline font-medium">
                        Administra roles (Admin, Empleado, Cliente), asigna permisos y gestiona altas y bajas lógicas.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { resetInviteForm(); setIsInviteOpen(true); }}
                        className="bg-primary hover:bg-primary-dark text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invitar / Nuevo Usuario
                    </button>
                    <div className="bg-surface-container-low border border-outline-variant px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2 w-fit">
                        <Users className="w-4 h-4 text-primary" />
                        Total: {users.length}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input 
                        type="text" 
                        placeholder="Buscar por email o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant bg-surface">
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface transition-colors" onClick={() => handleSort('email')}>
                                    <div className="flex items-center gap-1">Usuario / Email {sortField === 'email' && <ArrowUpDown className="w-3 h-3 text-primary" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface transition-colors" onClick={() => handleSort('role')}>
                                    <div className="flex items-center gap-1">Rol {sortField === 'role' && <ArrowUpDown className="w-3 h-3 text-primary" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface transition-colors" onClick={() => handleSort('firstSeen')}>
                                    <div className="flex items-center gap-1">Registro {sortField === 'firstSeen' && <ArrowUpDown className="w-3 h-3 text-primary" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface transition-colors" onClick={() => handleSort('lastSeen')}>
                                    <div className="flex items-center gap-1">Última Actividad {sortField === 'lastSeen' && <ArrowUpDown className="w-3 h-3 text-primary" />}</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-outline">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-xs uppercase font-bold tracking-widest mt-2">Cargando usuarios...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-outline">
                                        No se encontraron usuarios que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id || user.email} className={cn("hover:bg-surface/50 transition-colors group", !user.active && "opacity-60 bg-red-500/5")}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-9 h-9 rounded-full overflow-hidden border flex items-center justify-center font-bold shrink-0 text-xs ${
                                                    user.role === 'admin' 
                                                        ? 'border-primary bg-primary-container text-on-primary-container' 
                                                        : user.role === 'employee' 
                                                        ? 'border-blue-400 bg-blue-500/20 text-blue-300' 
                                                        : 'border-outline-variant bg-surface text-on-surface-variant'
                                                }`}>
                                                    {user.email.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-on-surface line-clamp-1 group-hover:text-on-surface transition-colors" title={user.email}>
                                                        {user.name || user.email.split('@')[0]}
                                                    </p>
                                                    <p className="text-xs text-outline mt-0.5 max-w-45 truncate" title={user.email}>
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {user.active ? (
                                                <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <select
                                                value={user.role || 'customer'}
                                                disabled={isUpdatingRole === user.id}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border focus:outline-none transition-colors ${
                                                    user.role === 'admin' 
                                                        ? 'bg-primary-container text-on-primary-container border-primary' 
                                                        : user.role === 'employee'
                                                        ? 'bg-blue-500/20 text-blue-300 border-blue-400'
                                                        : 'bg-surface text-on-surface-variant border-outline-variant'
                                                }`}
                                            >
                                                <option value="customer" className="bg-surface text-on-surface">Cliente</option>
                                                <option value="employee" className="bg-surface text-on-surface">Empleado</option>
                                                <option value="admin" className="bg-surface text-on-surface">Administrador</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-on-surface">
                                                {new Date(user.firstSeen).toLocaleDateString("es-AR", { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-on-surface-variant">
                                                {new Date(user.lastSeen).toLocaleDateString("es-AR", { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Toggle Active (Baja Lógica) */}
                                                <button
                                                    onClick={() => handleToggleActive(user.id, user.active)}
                                                    disabled={isTogglingActive === user.id}
                                                    className={cn(
                                                        "p-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border",
                                                        user.active 
                                                            ? "text-amber-400 hover:bg-amber-500/10 border-amber-500/20" 
                                                            : "text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20"
                                                    )}
                                                    title={user.active ? "Desactivar usuario (baja lógica)" : "Reactivar usuario"}
                                                >
                                                    {user.active ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                                </button>

                                                {/* Hard delete fallback for non-admins */}
                                                {user.role !== 'admin' && (
                                                    <button 
                                                        onClick={() => handleDeleteUser(user.id, user.email)}
                                                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 border border-transparent hover:border-error/20 transition-colors"
                                                        title="Eliminar usuario permanentemente"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Invitar / Crear Usuario */}
            {isInviteOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-outline-variant rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-outline-variant bg-surface flex items-center justify-between">
                            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary" />
                                Invitar o Registrar Usuario
                            </h3>
                            <button
                                onClick={() => { setIsInviteOpen(false); resetInviteForm(); }}
                                className="p-1 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        {createdCredentialNotice ? (
                            <div className="p-6 space-y-4">
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                                        <CheckCircle2 className="w-5 h-5" />
                                        ¡Usuario creado con éxito!
                                    </div>
                                    <p className="text-xs text-outline">
                                        Se generó una contraseña temporal para que el usuario pueda iniciar sesión inmediatamente:
                                    </p>
                                    <div className="p-3 bg-surface rounded-lg border border-outline-variant space-y-1 font-mono text-xs">
                                        <p><span className="text-outline">Email:</span> <strong className="text-on-surface">{createdCredentialNotice.email}</strong></p>
                                        <p><span className="text-outline">Contraseña:</span> <strong className="text-primary font-bold">{createdCredentialNotice.password}</strong></p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setIsInviteOpen(false); resetInviteForm(); }}
                                    className="w-full bg-primary hover:bg-primary-dark text-on-primary py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    Entendido y Cerrar
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-outline">
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="usuario@pfstudio.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-outline">
                                        Nombre y Apellido
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Marcelo Gómez"
                                        value={inviteName}
                                        onChange={(e) => setInviteName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-outline">
                                        Rol Asignado
                                    </label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e: any) => setInviteRole(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-semibold text-on-surface outline-none cursor-pointer"
                                    >
                                        <option value="employee">Empleado (Acceso a pedidos, catálogo e inventario)</option>
                                        <option value="admin">Administrador (Control total y gestión de roles)</option>
                                        <option value="customer">Cliente (Solo compras)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-outline">
                                        Contraseña Temporal (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Dejar vacío para generar una automáticamente"
                                        value={invitePassword}
                                        onChange={(e) => setInvitePassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                                    <button
                                        type="button"
                                        onClick={() => { setIsInviteOpen(false); resetInviteForm(); }}
                                        className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-bold uppercase tracking-wider text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingInvite}
                                        className="bg-primary hover:bg-primary-dark text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmittingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                        {isSubmittingInvite ? "Creando..." : "Crear Usuario"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
