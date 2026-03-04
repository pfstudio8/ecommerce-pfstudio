"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Loader2, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { sileo } from "sileo";
import { cn } from "@/lib/utils";

export default function AuthModal() {
    const isModalOpen = useAuthStore((state) => state.isModalOpen);
    const setModalOpen = useAuthStore((state) => state.setModalOpen);
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [direction, setDirection] = useState(0);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                sileo.success({ title: 'Sesión iniciada correctamente' });
                setModalOpen(false);
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        }
                    }
                });
                if (error) throw error;
                sileo.success({ title: "Cuenta creada exitosamente." });
                setModalOpen(false);
            }
        } catch (error: any) {
            sileo.error({ title: error.message || "Error al autenticar" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = async (provider: 'google' | 'facebook') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            sileo.error({ title: error.message || `Error con ${provider}` });
        }
    };

    const toggleMode = (login: boolean) => {
        setDirection(login ? -1 : 1);
        setIsLogin(login);
    };

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 300 : -300,
            opacity: 0,
            position: "absolute" as const,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            position: "relative" as const,
        },
        exit: (dir: number) => ({
            zIndex: 0,
            x: dir < 0 ? 300 : -300,
            opacity: 0,
            position: "absolute" as const,
        })
    };

    return (
        <AnimatePresence>
            {isModalOpen && (
                <div key="modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setModalOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-md bg-[var(--background)]/80 backdrop-blur-xl border border-white/10 dark:border-zinc-800/50 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[var(--color-main)]/20 to-transparent pointer-events-none" />

                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 backdrop-blur-sm rounded-full text-gray-500 hover:text-[var(--foreground)] transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 pt-10">

                            {/* Social Login - Removed because it requires explicit Supabase dashboard configuration */}

                            {/* Form Wrapper */}
                            <form onSubmit={handleSubmit} className="w-full relative">
                                {/* Animated Inputs Wrapper */}
                                <div className="relative h-[280px] overflow-hidden flex items-start justify-center w-full mb-6">
                                    <AnimatePresence custom={direction} mode="wait">
                                        <motion.div
                                            key={isLogin ? "login" : "register"}
                                            custom={direction}
                                            variants={variants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 300, damping: 30 },
                                                opacity: { duration: 0.2 }
                                            }}
                                            className="w-full absolute"
                                        >
                                            <div className="text-center mb-6">
                                                <h2 className="text-3xl font-black tracking-tight mb-2 text-[var(--foreground)]">
                                                    {isLogin ? "Bienvenido" : "Crea tu Cuenta"}
                                                </h2>
                                                <p className="text-gray-500 text-sm">
                                                    {isLogin
                                                        ? "Ingresa tus datos para continuar"
                                                        : "Únete a PFSTUDIO y accede a ofertas"}
                                                </p>
                                            </div>

                                            <div className="space-y-4">

                                                {!isLogin && (
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                                                        <div className="relative group">
                                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-main)] transition-colors" />
                                                            <input
                                                                type="text"
                                                                required={!isLogin}
                                                                value={name}
                                                                onChange={(e) => setName(e.target.value)}
                                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/50 focus:border-[var(--color-main)] transition-all"
                                                                placeholder="Juan Pérez"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-main)] transition-colors" />
                                                        <input
                                                            type="email"
                                                            required
                                                            autoCapitalize="none"
                                                            autoCorrect="off"
                                                            spellCheck="false"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/50 focus:border-[var(--color-main)] transition-all"
                                                            placeholder="tu@email.com"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Contraseña</label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-main)] transition-colors" />
                                                        <input
                                                            type="password"
                                                            required
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/50 focus:border-[var(--color-main)] transition-all"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>

                                                {isLogin && (
                                                    <div className="text-right pb-2">
                                                        <button type="button" className="text-xs font-medium text-[var(--color-main)] hover:underline transition-all">
                                                            ¿Olvidaste tu contraseña?
                                                        </button>
                                                    </div>
                                                )}

                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Static Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-main)] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 uppercase tracking-widest text-sm relative overflow-hidden"
                                >
                                    <span className={cn("transition-opacity flex items-center gap-2", isLoading ? "opacity-0" : "opacity-100")}>
                                        {isLogin ? "Ingresar" : "Crear Cuenta"}
                                    </span>
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </div>
                                    )}
                                </button>
                            </form>

                            {/* Toggle Bottom */}
                            <div className="mt-2 text-center text-sm font-medium text-gray-500">
                                {isLogin ? "¿Nuevo en PFSTUDIO? " : "¿Ya eres miembro? "}
                                <button
                                    onClick={() => toggleMode(!isLogin)}
                                    className="font-bold text-[var(--color-main)] hover:underline ml-1"
                                >
                                    {isLogin ? "Regístrate ahora" : "Inicia Sesión"}
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}

            {/* Global Loading Overlay for Auth Actions */}
            {isLoading && (
                <motion.div
                    key="loading_overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-[var(--background)]/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto"
                >
                    <Loader2 className="w-12 h-12 animate-spin text-[var(--color-main)] mb-4" />
                    <p className="text-sm font-bold tracking-widest uppercase">Autenticando...</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
