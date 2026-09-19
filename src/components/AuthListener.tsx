"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/store/auth";
import { toast } from "sonner";

export default function AuthListener() {
    const { setUser, setInitialized, setAdmin } = useAuthStore();

    useEffect(() => {
        const checkAdmin = async (userEmail: string | undefined) => {
            if (!userEmail) {
                setAdmin(false);
                return;
            }
            try {
                const res = await fetch('/api/admin/check');
                if (res.ok) {
                    const data = await res.json();
                    setAdmin(data.isAdmin);
                } else {
                    setAdmin(false);
                }
            } catch (err) {
                console.warn("Failed to check admin status:", err);
                setAdmin(false);
            }
        };

        const handleAuthNotificationAndEmail = async (user: any, accessToken?: string) => {
            if (!user || !accessToken) return;

            const provider = user.app_metadata?.provider;
            const isGoogle = provider === 'google' || user.identities?.some((id: any) => id.provider === 'google');

            const sessionNotifyKey = `auth_notified_${user.id}_${accessToken.slice(-10)}`;
            if (!sessionStorage.getItem(sessionNotifyKey)) {
                sessionStorage.setItem(sessionNotifyKey, 'true');

                if (isGoogle) {
                    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
                    toast.success('Sesión iniciada correctamente', { description: `Bienvenido${userName ? ` ${userName}` : ' a PFSTUDIO'}` });
                }

                // Call backend to send welcome email. Backend will check if already sent.
                try {
                    await fetch('/api/notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'welcome',
                            email: user.email,
                            name: user.user_metadata?.full_name || user.user_metadata?.name || ''
                        })
                    });
                } catch (err) {
                    console.warn("No se pudo enviar el correo de bienvenida:", err);
                }
            }
        };

        const checkSession = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const session = data.session;
                const user = session?.user || null;
                setUser(user);
                checkAdmin(user?.email);

                if (user && session?.access_token) {
                    await handleAuthNotificationAndEmail(user, session.access_token);
                }
            } catch (err) {
                console.warn("Error checking session:", err);
            } finally {
                setInitialized(true);
            }
        };

        checkSession();

        // Listen for future auth changes (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                try {
                    const user = session?.user || null;
                    setUser(user);
                    checkAdmin(user?.email);

                    if (user && session?.access_token) {
                        await handleAuthNotificationAndEmail(user, session.access_token);
                    }
                } catch (err) {
                    console.warn("Auth state change handler error:", err);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setInitialized, setAdmin]);

    // Invisible helper component
    return null;
}
