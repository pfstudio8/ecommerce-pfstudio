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
    const [showWelcome, setShowWelcome] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [dni, setDni] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setAuthError(null);

        try {
            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password`,
                });
                if (error) throw error;
                sileo.success({ title: "Enlace de recuperación enviado. Revisa tu correo." });
                setIsForgotPassword(false);
            } else if (isLogin) {
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
                            dni,
                            phone,
                            address
                        }
                    }
                });
                if (error) throw error;

                // Enviar email de bienvenida
                try {
                    await fetch('/api/notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'welcome', email })
                    });
                } catch (err) {
                    // Evitamos usar console.error para no disparar el Error Overlay de Next.js
                    // en caso de que un AdBlocker bloquee la petición (ej. Brave Shields)
                    console.warn("No se pudo enviar email de bienvenida (posible extensión bloqueando requests)", err);
                }

                setShowWelcome(true);
                setTimeout(() => {
                    setModalOpen(false);
                    setShowWelcome(false);
                }, 2000);
            }
        } catch (error: any) {
            let errorMsg = error.message || "Error al autenticar";

            // Traducir errores comunes de Supabase
            if (errorMsg.includes("User already registered")) {
                errorMsg = "Este correo ya está registrado.";
            } else if (errorMsg.includes("Signups not allowed for this instance")) {
                errorMsg = "El registro está deshabilitado. Activa 'Allow new users to sign up' en Supabase.";
            } else if (errorMsg.includes("Email rate limit exceeded") || errorMsg.includes("rate limit")) {
                errorMsg = "Límite de correos alcanzado. Por favor, desactiva 'Confirm email' en las opciones de Auth en Supabase.";
            } else if (errorMsg.includes("Invalid login credentials")) {
                errorMsg = "Correo o contraseña incorrectos.";
            } else if (errorMsg.includes("Password should be at least")) {
                errorMsg = "La contraseña debe tener al menos 6 caracteres.";
            }

            setAuthError(errorMsg);
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
        setIsForgotPassword(false);
        setAuthError(null);
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
            {isModalOpen && !showWelcome && (
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
                        className="relative w-full max-w-md max-h-[95vh] flex flex-col bg-[var(--background)]/80 backdrop-blur-xl border border-white/10 dark:border-zinc-800/50 rounded-3xl shadow-2xl overflow-y-auto overflow-x-hidden"
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

                            {/* Form Wrapper */}
                            <form onSubmit={handleSubmit} className="w-full relative flex flex-col">
                                {/* Animated Inputs Wrapper */}
                                <div className="relative overflow-hidden flex-1 w-full mb-6">
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
                                                    {isForgotPassword ? "Recuperar Clave" : isLogin ? "Bienvenido" : "Crea tu Cuenta"}
                                                </h2>
                                                <p className="text-gray-500 text-sm">
                                                    {isForgotPassword 
                                                        ? "Ingresa tu email para recibir el enlace" 
                                                        : isLogin
                                                            ? "Ingresa tus datos para continuar"
                                                            : "Únete a PFSTUDIO y accede a ofertas"}
                                                </p>
                                            </div>

                                            <div className="space-y-3">

                                                {!isLogin && !isForgotPassword && (
                                                    <>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                                                            <div className="relative group">
                                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-main)] transition-colors" />
                                                                <input
                                                                    type="text"
                                                                    required={!isLogin && !isForgotPassword}
                                                                    value={name}
                                                                    onChange={(e) => setName(e.target.value)}
                                                                    className="w-full pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-600 bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#333846] rounded-xl focus:outline-none focus:border-[var(--color-main)] focus:ring-1 focus:ring-[var(--color-main)] transition-all shadow-inner"
                                                                    placeholder="Juan Pérez"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Factura Fields */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">DNI / CUIT</label>
                                                                <input
                                                                    type="text"
                                                                    required={!isLogin && !isForgotPassword}
                                                                    value={dni}
                                                                    onChange={(e) => setDni(e.target.value)}
                                                                    className="w-full px-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-600 bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#333846] rounded-xl focus:outline-none focus:border-[var(--color-main)] focus:ring-1 focus:ring-[var(--color-main)] transition-all shadow-inner"
                                                                    placeholder="Sin puntos"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Teléfono</label>
                                                                <input
                                                                    type="tel"
                                                                    required={!isLogin && !isForgotPassword}
                                                                    value={phone}
                                                                    onChange={(e) => setPhone(e.target.value)}
                                                                    className="w-full px-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-600 bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#333846] rounded-xl focus:outline-none focus:border-[var(--color-main)] focus:ring-1 focus:ring-[var(--color-main)] transition-all shadow-inner"
                                                                    placeholder="+54 11 ..."
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Dirección / Localidad</label>
                                                            <input
                                                                type="text"
                                                                required={!isLogin && !isForgotPassword}
                                                                value={address}
                                                                onChange={(e) => setAddress(e.target.value)}
                                                                className="w-full px-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-600 bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#333846] rounded-xl focus:outline-none focus:border-[var(--color-main)] focus:ring-1 focus:ring-[var(--color-main)] transition-all shadow-inner"
                                                                placeholder="Av. Falsa 123"
                                                            />
                                                        </div>
                                                    </>
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
                                                            className="w-full pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-600 bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#333846] rounded-xl focus:outline-none focus:border-[var(--color-main)] focus:ring-1 focus:ring-[var(--color-main)] transition-all shadow-inner"
                                                            placeholder="tu@email.com"
                                                        />
                                                    </div>
                                                </div>

                                                {!isForgotPassword && (
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Contraseña</label>
                                                            {isLogin && (
                                                                <button onClick={() => setIsForgotPassword(true)} type="button" className="text-xs font-bold text-[var(--color-main)] hover:underline transition-all">
                                                                    ¿Olvidaste tu contraseña?
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-main)] transition-colors" />
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                required={!isForgotPassword}
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                className="w-full pl-12 pr-12 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-600 bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#333846] rounded-xl focus:outline-none focus:border-[var(--color-main)] focus:ring-1 focus:ring-[var(--color-main)] transition-all shadow-inner"
                                                                placeholder="••••••••"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--foreground)] transition-colors"
                                                            >
                                                                {showPassword ? (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20" /><path d="M6.71 6.71a10 10 0 0 0-4.08 5.29 10 10 0 0 0 11.52 7.15" /><path d="M10.96 10.96a3 3 0 0 0 4.08 4.08" /><path d="M14.54 9.17A3 3 0 0 0 10.95 5.6" /><path d="M22 12a10 10 0 0 0-14.71-7.06" /></svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {isForgotPassword && (
                                                    <div className="text-center pb-2">
                                                        <button onClick={() => setIsForgotPassword(false)} type="button" className="text-xs font-medium text-gray-500 hover:text-[var(--foreground)] transition-all">
                                                            Volver a Iniciar Sesión
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Inline Auth Error Message */}
                                                {authError && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-600 dark:text-red-400 font-medium text-center"
                                                    >
                                                        {authError}
                                                    </motion.div>
                                                )}

                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Static Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 mt-auto bg-[var(--foreground)] text-[var(--background)] rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[var(--color-main)] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 uppercase tracking-[0.2em] text-[13px] relative overflow-hidden"
                                >
                                    <span className={cn("transition-opacity flex items-center gap-2", isLoading ? "opacity-0" : "opacity-100")}>
                                        {isForgotPassword ? "Enviar Enlace" : isLogin ? "Ingresar a mi cuenta" : "Crear mi Cuenta"}
                                    </span>
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </div>
                                    )}
                                </button>
                            </form>

                            {/* Social Login (Moved to bottom) */}
                            <div className="mt-6">
                                <div className="mb-6 relative flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
                                    </div>
                                    <span className="relative bg-[var(--background)] px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        O INGRESA MÁS RÁPIDO
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleOAuth('google')}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-[#141416] text-white border border-[#2a2e3b] rounded-xl hover:bg-[#1e212b] transition-all font-bold group"
                                >
                                    <div className="bg-white p-1 rounded-full group-hover:scale-110 transition-transform">
                                        <FcGoogle className="w-4 h-4" />
                                    </div>
                                    Continuar con Google
                                </button>
                            </div>

                            {/* Toggle Bottom */}
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800/50 text-center text-sm font-medium text-gray-500">
                                {isLogin ? "¿Nuevo en PFSTUDIO? " : "¿Ya eres miembro? "}
                                <button
                                    onClick={() => toggleMode(!isLogin)}
                                    className="font-black text-[var(--foreground)] hover:text-[var(--color-main)] transition-colors ml-1"
                                >
                                    {isLogin ? "Regístrate ahora" : "Inicia Sesión"}
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}

            {/* Global Loading Overlay for Auth Actions */}
            {isLoading && !showWelcome && (
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

            {/* Welcome Animation Screen */}
            {showWelcome && (
                <motion.div
                    key="welcome_screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="fixed inset-0 z-[300] flex flex-col items-center justify-center p-4 bg-[var(--background)] backdrop-blur-3xl"
                >
                    {/* Confetti / Decorative background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center opacity-30">
                        <motion.div 
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: 1.5, rotate: 180 }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            className="w-[80vw] h-[80vw] max-w-2xl max-h-2xl rounded-full bg-gradient-to-tr from-[var(--color-main)] to-transparent blur-3xl opacity-20"
                        />
                    </div>

                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, duration: 1.5 }}
                        className="relative z-10 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-8 shadow-[0_0_50px_rgba(34,197,94,0.4)]"
                    >
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative z-10 text-4xl md:text-5xl font-black text-center mb-4 tracking-tight"
                    >
                        ¡Hola, {name || 'amigo'}!
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative z-10 text-lg text-gray-500 text-center max-w-sm"
                    >
                        Tu cuenta ha sido creada exitosamente. Bienvenido a la familia PFSTUDIO.
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
