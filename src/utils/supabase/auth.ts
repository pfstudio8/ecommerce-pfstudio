import { createClient } from './server';
import { User } from '@supabase/supabase-js';

export interface AuthContext {
    user: User;
    role: 'admin' | 'employee' | 'customer';
    isAdmin: boolean;
}

export async function getAuthContext(supabaseClient?: Awaited<ReturnType<typeof createClient>>): Promise<AuthContext | null> {
    const supabase = supabaseClient || (await createClient());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    let role = (profile?.role || 'customer') as 'admin' | 'employee' | 'customer';
    let isAdmin = role === 'admin' || role === 'employee';

    if (!isAdmin) {
        const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
        const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());
        if (adminEmails.includes(user.email.toLowerCase())) {
            role = 'admin';
            isAdmin = true;
        }
    }

    return { user, role, isAdmin };
}

export async function requireAuthUser(supabaseClient?: Awaited<ReturnType<typeof createClient>>): Promise<User> {
    const ctx = await getAuthContext(supabaseClient);
    if (!ctx) {
        throw new Error("No autenticado");
    }
    return ctx.user;
}

export async function requireAdminOrEmployee(supabaseClient?: Awaited<ReturnType<typeof createClient>>): Promise<AuthContext> {
    const ctx = await getAuthContext(supabaseClient);
    if (!ctx) {
        throw new Error("No autenticado");
    }
    if (!ctx.isAdmin) {
        throw new Error("No tienes permisos suficientes (se requiere rol de administrador o empleado)");
    }
    return ctx;
}

export async function requireAdmin(supabaseClient?: Awaited<ReturnType<typeof createClient>>): Promise<AuthContext> {
    const ctx = await getAuthContext(supabaseClient);
    if (!ctx) {
        throw new Error("No autenticado");
    }
    if (ctx.role !== 'admin') {
        throw new Error("Acceso denegado: Se requiere rol de administrador");
    }
    return ctx;
}

