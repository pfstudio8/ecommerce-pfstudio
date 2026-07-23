"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { sileo } from "sileo";

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
                console.error("Failed to check admin status:", err);
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
                    sileo.success({ title: '¡Sesión iniciada con Google correctamente! 🎉' });
                }

                // Send welcome email for first time users
                const welcomeSentKey = `welcome_email_sent_${user.id}`;
                if (!localStorage.getItem(welcomeSentKey)) {
                    localStorage.setItem(welcomeSentKey, 'true');
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
            }
        };

        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            const session = data.session;
            const user = session?.user || null;
            setUser(user);
            await checkAdmin(user?.email);
            setInitialized(true);

            if (user && session?.access_token) {
                handleAuthNotificationAndEmail(user, session.access_token);
            }
        };

        checkSession();

        // Listen for future auth changes (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const user = session?.user || null;
                setUser(user);
                await checkAdmin(user?.email);

                if (user && session?.access_token) {
                    handleAuthNotificationAndEmail(user, session.access_token);
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
