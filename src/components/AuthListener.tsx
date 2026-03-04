"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

export default function AuthListener() {
    const { setUser, setInitialized } = useAuthStore();

    useEffect(() => {
        // Obtenemos la sesión actual al cargar la página
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user || null);
            setInitialized(true);
        };

        checkSession();

        // Escuchamos cambios futuros en la autenticación (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setInitialized]);

    // Componente invisible
    return null;
}
