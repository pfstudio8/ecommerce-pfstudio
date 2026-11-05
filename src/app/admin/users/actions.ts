"use server";

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireAdminOrEmployee, requireAdmin } from '@/utils/supabase/auth';

export interface AdminUserData {
    id: string;
    email: string;
    name?: string;
    role: 'admin' | 'employee' | 'customer';
    firstSeen: string;
    lastSeen: string;
    isAdmin: boolean;
    active: boolean;
}

export async function getAdminUsers() {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();
        
        await requireAdminOrEmployee(supabase);

        // Fetch all registered users from auth
        const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
        if (authError) {
            throw new Error("Could not fetch auth users: " + authError.message);
        }

        // Fetch profiles for roles and active state
        const { data: profiles } = await adminClient
            .from('profiles')
            .select('id, email, full_name, role, active');

        const profileMap = new Map<string, any>();
        (profiles || []).forEach(p => {
            profileMap.set(p.id, p);
            if (p.email) profileMap.set(p.email.toLowerCase(), p);
        });

        const userList: AdminUserData[] = [];

        if (authUsers && authUsers.users) {
            authUsers.users.forEach((u) => {
                const email = u.email || 'Sin Correo';
                const p = profileMap.get(u.id) || profileMap.get(email.toLowerCase());
                const role = (p?.role || 'customer') as 'admin' | 'employee' | 'customer';
                const isBanned = Boolean(u.banned_until && new Date(u.banned_until) > new Date());
                const isActive = p?.active !== false && !isBanned;

                userList.push({
                    id: u.id,
                    email,
                    name: p?.full_name || (u.user_metadata?.full_name as string) || '',
                    role,
                    firstSeen: u.created_at,
                    lastSeen: u.last_sign_in_at || u.created_at,
                    isAdmin: role === 'admin' || role === 'employee',
                    active: isActive
                });
            });
        }

        userList.sort((a, b) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime());

        return { success: true, data: userList };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUserRole(targetUserId: string, newRole: 'admin' | 'employee' | 'customer') {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();

        await requireAdmin(supabase);

        const { error } = await adminClient
            .from('profiles')
            .update({ role: newRole })
            .eq('id', targetUserId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Error updating user role:", error);
        return { success: false, error: error.message };
    }
}

export async function createUserOrInvite(params: {
    email: string;
    fullName: string;
    role: 'admin' | 'employee' | 'customer';
    password?: string;
}) {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();

        await requireAdmin(supabase);

        const { email, fullName, role, password } = params;
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !normalizedEmail.includes('@')) {
            throw new Error("El correo electrónico no es válido.");
        }

        const finalPassword = password && password.trim().length >= 6 
            ? password.trim() 
            : `PFStudio_${Math.random().toString(36).slice(-6)}!`;

        // Create auth user
        const { data: newAuthUser, error: createError } = await adminClient.auth.admin.createUser({
            email: normalizedEmail,
            password: finalPassword,
            email_confirm: true,
            user_metadata: {
                full_name: fullName.trim()
            }
        });

        if (createError) {
            throw new Error(`Error al crear usuario en Supabase Auth: ${createError.message}`);
        }

        if (!newAuthUser.user) {
            throw new Error("No se pudo obtener el usuario creado.");
        }

        // Upsert into profiles
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: newAuthUser.user.id,
                email: normalizedEmail,
                full_name: fullName.trim(),
                role: role || 'employee',
                active: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (profileError) {
            console.warn("Could not upsert profile for new user:", profileError);
        }

        return { 
            success: true, 
            userId: newAuthUser.user.id,
            generatedPassword: !password ? finalPassword : undefined
        };
    } catch (error: any) {
        console.error("Error creating/inviting user:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleUserActive(targetUserId: string, active: boolean) {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();

        const { user } = await requireAdmin(supabase);

        if (user.id === targetUserId) {
            throw new Error("No puedes desactivar tu propia cuenta de administrador.");
        }

        // 1. Update profiles table
        const { error: profileError } = await adminClient
            .from('profiles')
            .update({ active, updated_at: new Date().toISOString() })
            .eq('id', targetUserId);

        if (profileError) throw profileError;

        // 2. Ban / Unban in Supabase Auth to prevent logins
        const { error: authError } = await adminClient.auth.admin.updateUserById(targetUserId, {
            ban_duration: active ? 'none' : '876000h' // ~100 years if deactivated
        });

        if (authError) {
            console.warn("Could not set ban duration in auth:", authError);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error toggling user active state:", error);
        return { success: false, error: error.message };
    }
}
