"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { sileo } from "sileo";

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // En un flujo implícito, Supabase debería procesar el token en la URL automáticamente.
        // Verificamos si hay una sesión activa, caso contrario el link o token fallaron.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Si la URL contiene el fragmento, supabase-js en la capa cliente (como aquí en useEffect) lo procesa.
                // Ocasionalmente, toma una fracción de segundo.
                supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'PASSWORD_RECOVERY') {
                        // All good, ready to update password
                    }
                });
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            sileo.error({ title: "La contraseña debe tener al menos 6 caracteres." });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                throw error;
            }

            sileo.success({ title: "Contraseña actualizada correctamente. Redirigiendo..." });
            
            // Redirect to home after a short delay
            setTimeout(() => {
                router.push("/");
            }, 2000);

        } catch (error: any) {
            sileo.error({ title: error.message || "Error al actualizar la contraseña." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
            <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black tracking-tight mb-2 text-[var(--foreground)]">
                        Nueva Contraseña
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Escribe tu nueva contraseña a continuación.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                            Nueva Contraseña
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-main)] transition-colors" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/50 focus:border-[var(--color-main)] transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-main)] hover:text-white transition-all duration-300 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Guardar Contraseña"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
