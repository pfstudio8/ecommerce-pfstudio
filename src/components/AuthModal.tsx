"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ProcessingOverlay from "@/components/ProcessingOverlay";

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
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                setModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, setModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setAuthError(null);
        const startTime = Date.now();

        try {
            const cleanEmail = email.trim();
            const cleanName = name.trim();

            if (!isForgotPassword && password.length < 6) {
                setAuthError("La contraseña debe tener al menos 6 caracteres.");
                setIsLoading(false);
                return;
            }

            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
                    redirectTo: `${window.location.origin}/update-password`,
                });
                if (error) throw error;
                
                const elapsed = Date.now() - startTime;
                if (elapsed < 1500) await new Promise((res) => setTimeout(res, 1500 - elapsed));

                toast.success("Enlace de recuperación enviado", { description: "Revisa tu casilla de correo electrónico" });
                setIsForgotPassword(false);
            } else if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password,
                });
                if (error) throw error;

                const elapsed = Date.now() - startTime;
                if (elapsed < 1500) await new Promise((res) => setTimeout(res, 1500 - elapsed));

                const userName = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || '';
                toast.success('Sesión iniciada correctamente', { description: `Bienvenido${userName ? ` ${userName}` : ' a PFSTUDIO'}` });
                setModalOpen(false);
            } else {
                if (password !== confirmPassword) {
                    setAuthError("Las contraseñas no coinciden.");
                    setIsLoading(false);
                    return;
                }
                
                const { error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password,
                    options: {
                        data: {
                            full_name: cleanName,
                            phone,
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
                    console.warn("No se pudo enviar email de bienvenida", err);
                }

                const elapsed = Date.now() - startTime;
                if (elapsed < 1500) await new Promise((res) => setTimeout(res, 1500 - elapsed));

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

    const handleOAuth = async (provider: 'google') => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setIsLoading(false);
            toast.error(error.message || `Error con ${provider}`);
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
                <div key="modal-overlay" className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setModalOpen(false)}
                        className="absolute inset-0 bg-surface/50 backdrop-blur-sm"
                    />

                    <div className="relative w-full flex items-center justify-center max-h-[95vh] overflow-y-auto pointer-events-none">
                        <AnimatePresence custom={direction} mode="wait">
                            {isForgotPassword ? (
                                <motion.div
                                    key="forgot"
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="relative w-full max-w-107.5 apple-glass-card rounded-2xl p-8 sm:p-10 shadow-xl pointer-events-auto"
                                >
                                    <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-outline/60 hover:text-on-surface">
                                        <X className="w-5 h-5" />
                                    </button>
                                    <div className="text-center mb-8">
                                        <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-bold mb-1.5">
                                            Recuperar Contraseña
                                        </h1>
                                        <p className="font-body-md text-body-md text-on-surface-variant">
                                            Te enviaremos un enlace de recuperación.
                                        </p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label htmlFor="reset-email" className="block font-label-md text-label-md text-on-surface-variant">Correo electrónico</label>
                                            <input 
                                                id="reset-email" type="email" required 
                                                value={email} onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3.5 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-DEFAULT border border-outline-variant/50 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none" 
                                            />
                                        </div>
                                        {authError && <div className="text-error text-sm text-center">{authError}</div>}
                                        <button type="submit" disabled={isLoading} className="w-full mt-2 py-3.5 px-6 rounded-full bg-primary-container text-on-primary font-label-lg font-semibold shadow-sm hover:scale-[1.01] transition-all">
                                            Enviar enlace
                                        </button>
                                    </form>
                                    <div className="mt-8 text-center pt-4 border-t border-outline-variant/20">
                                        <button onClick={() => toggleMode(true)} className="font-body-sm text-primary hover:underline">Volver a Iniciar Sesión</button>
                                    </div>
                                </motion.div>
                            ) : isLogin ? (
                                <motion.div
                                    key="login"
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="relative w-full max-w-107.5 apple-glass-card rounded-2xl p-8 sm:p-10 shadow-xl pointer-events-auto"
                                >
                                    <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-outline/60 hover:text-on-surface">
                                        <X className="w-5 h-5" />
                                    </button>
                                    
                                    <div className="flex justify-center mb-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full bg-surface-container-low border border-outline-variant/30 flex items-center justify-center shadow-xs">
                                                <span className="material-symbols-outlined text-primary text-[28px]">format_paint</span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary-container border-2 border-surface-container-lowest flex items-center justify-center text-primary shadow-xs">
                                                <span className="material-symbols-outlined text-[13px] font-bold">verified</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center mb-8">
                                        <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-bold mb-1.5">
                                            Inicia sesión en PFSTUDIO
                                        </h1>
                                        <p className="font-body-md text-body-md text-on-surface-variant">
                                            Accede a tus datos y pedidos
                                        </p>
                                    </div>

                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <div className="space-y-1.5">
                                            <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="identifier">
                                                Correo electrónico
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    autoComplete="username" className="w-full px-4 py-3.5 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-DEFAULT border border-outline-variant/50 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all duration-150 outline-none placeholder:text-outline/60" 
                                                    id="identifier" name="identifier" placeholder="ejemplo@pfstudio.com" required type="email"
                                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                                />
                                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline/60 pointer-events-none">
                                                    <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                                                Contraseña
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    autoComplete="current-password" className="w-full px-4 py-3.5 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-DEFAULT border border-outline-variant/50 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all duration-150 outline-none placeholder:text-outline/60 pr-11" 
                                                    id="password" name="password" placeholder="••••••••••••" required type={showPassword ? "text" : "password"}
                                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                                />
                                                <button 
                                                    aria-label="Ver u ocultar contraseña" 
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline/70 hover:text-primary transition-colors duration-150 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-container/20 flex items-center justify-center" 
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 pb-2">
                                            <label className="flex items-center gap-2 cursor-pointer select-none group">
                                                <input className="w-4 h-4 rounded border-outline-variant/60 text-primary-container focus:ring-primary-container/20 transition duration-150 cursor-pointer" id="remember-me" type="checkbox"/>
                                                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                                                    Permanecer conectado
                                                </span>
                                            </label>
                                            <button type="button" onClick={() => setIsForgotPassword(true)} className="font-body-sm text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>

                                        {authError && <div className="text-error text-sm text-center">{authError}</div>}

                                        <button disabled={isLoading} className="w-full mt-2 py-3.5 px-6 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 group" type="submit">
                                            <span>Iniciar sesión</span>
                                            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform duration-200">arrow_forward</span>
                                        </button>
                                    </form>

                                    <div className="relative my-7 flex items-center justify-center">
                                        <div className="w-full border-t border-outline-variant/30"></div>
                                        <span className="absolute bg-surface-container-lowest/80 px-3 font-body-sm text-body-sm text-outline backdrop-blur-xs">o</span>
                                    </div>

                                    <button onClick={() => handleOAuth('google')} className="w-full py-3 px-4 rounded-full bg-surface-container-lowest border border-outline-variant/50 hover:border-outline-variant hover:bg-surface-container-low font-label-md text-label-md font-medium text-on-surface flex items-center justify-center gap-3 transition-all duration-150 active:scale-[0.99] shadow-xs" type="button">
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                            <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" fill="#4285F4"></path>
                                            <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.13C3.26 21.36 7.36 24 12 24z" fill="#34A853"></path>
                                            <path d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.41l4.04-3.13z" fill="#FBBC05"></path>
                                            <path d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.36 0 3.26 2.64 1.24 6.59l4.04 3.13c.95-2.84 3.6-4.95 6.72-4.95z" fill="#EA4335"></path>
                                        </svg>
                                        <span>Continuar con Google</span>
                                    </button>

                                    <div className="mt-8 text-center pt-4 border-t border-outline-variant/20">
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                                            ¿No tienes una cuenta de PFSTUDIO?
                                            <button type="button" onClick={() => toggleMode(false)} className="font-semibold text-primary hover:text-primary-container underline underline-offset-4 ml-1 transition-colors">
                                                Crear una ahora
                                            </button>
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center justify-center gap-2 text-outline/80">
                                        <span className="material-symbols-outlined text-[16px]">lock</span>
                                        <span className="font-body-sm text-body-sm">Conexión cifrada de extremo a extremo</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register"
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="relative w-full max-w-135 apple-glass rounded-3xl border border-outline-variant/40 shadow-[0_16px_40px_-12px_rgba(49,68,46,0.08)] p-8 sm:p-11 pointer-events-auto"
                                >
                                    <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-outline/60 hover:text-on-surface">
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-container border border-outline-variant/50 shadow-sm mb-4">
                                            <span className="material-symbols-outlined text-primary text-2xl">app_registration</span>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 mb-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                                            <span className="font-label-badge text-label-badge uppercase tracking-wider text-primary">Estudio de diseño</span>
                                        </div>
                                        <h1 className="font-headline-lg text-headline-lg font-bold text-on-background tracking-tight">
                                            Crear tu cuenta PFSTUDIO
                                        </h1>
                                        <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-sm mx-auto">
                                            Personaliza y gestiona tus pedidos con la máxima calidad y trazabilidad.
                                        </p>
                                    </div>

                                    <div className="mb-6">
                                        <button onClick={() => handleOAuth('google')} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low hover:border-outline transition-all duration-150 active:scale-[0.99]" type="button">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                                            </svg>
                                            <span>Continuar con Google</span>
                                        </button>
                                    </div>

                                    <div className="relative flex items-center justify-center mb-6">
                                        <div className="border-t border-outline-variant/40 w-full"></div>
                                        <span className="bg-surface-container-lowest px-3 font-label-badge text-label-badge text-outline uppercase tracking-widest absolute">o registrarte con mail</span>
                                    </div>

                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5" htmlFor="full_name">Nombre completo</label>
                                                <input 
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/70 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 font-body-md text-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none" 
                                                    id="full_name" name="full_name" placeholder="Mateo Rossi" required type="text"
                                                    value={name} onChange={(e) => setName(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5" htmlFor="phone">Teléfono / WhatsApp</label>
                                                <input 
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/70 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 font-body-md text-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none" 
                                                    id="phone" name="phone" placeholder="+54 9 11 2345 6789" type="tel"
                                                    value={phone} onChange={(e) => setPhone(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5" htmlFor="email">Correo electrónico</label>
                                            <input 
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/70 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 font-body-md text-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none" 
                                                id="email" name="email" placeholder="hola@ejemplo.com" required type="email"
                                                value={email} onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5" htmlFor="password">Contraseña</label>
                                            <div className="relative">
                                                <input 
                                                    className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-outline-variant/70 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 font-body-md text-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none" 
                                                    id="password" name="password" placeholder="••••••••••••" required type={showPassword ? "text" : "password"}
                                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                                />
                                                <button aria-label="Mostrar contraseña" type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors p-1" onClick={() => setShowPassword(!showPassword)}>
                                                    <span className="material-symbols-outlined text-lg leading-none">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5" htmlFor="confirm_password">Confirmar contraseña</label>
                                            <div className="relative">
                                                <input 
                                                    className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-outline-variant/70 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 font-body-md text-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none" 
                                                    id="confirm_password" name="confirm_password" placeholder="••••••••••••" required type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                                <button aria-label="Confirmar mostrar contraseña" type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors p-1" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                    <span className="material-symbols-outlined text-lg leading-none">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-1.5 pb-1">
                                            <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                                <input className="mt-1 rounded border-outline-variant text-primary-container focus:ring-primary-container/30 h-4 w-4" id="terms" name="terms" required type="checkbox"/>
                                                <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                                                    Acepto los <a className="underline hover:text-primary transition-colors" href="#">Términos y Condiciones</a> y la <a className="underline hover:text-primary transition-colors" href="#">Política de Privacidad</a> de PFSTUDIO.
                                                </span>
                                            </label>
                                        </div>

                                        {authError && <div className="text-error text-sm text-center">{authError}</div>}

                                        <div className="pt-2">
                                            <button disabled={isLoading} className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary text-surface font-label-lg text-label-lg tracking-wide shadow-[0_4px_16px_rgba(49,68,46,0.18)] hover:shadow-[0_6px_22px_rgba(49,68,46,0.25)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2" type="submit">
                                                <span>Crear cuenta PFSTUDIO</span>
                                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-8 pt-5 border-t border-outline-variant/30 text-center">
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                                            ¿Ya tenés una cuenta?
                                            <button type="button" onClick={() => toggleMode(true)} className="font-label-md text-label-md font-semibold text-primary hover:underline ml-1">
                                                Iniciar sesión
                                            </button>
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {showWelcome && (
                <motion.div
                    key="welcome_screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="fixed inset-0 z-1000 flex flex-col items-center justify-center p-4 bg-surface backdrop-blur-3xl"
                >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center opacity-30">
                        <motion.div 
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: 1.5, rotate: 180 }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            className="w-[80vw] h-[80vw] max-w-2xl max-h-[80vw] rounded-full bg-linear-to-tr from-primary to-transparent blur-[100px] opacity-20"
                        />
                    </div>

                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, duration: 1.5 }}
                        className="relative z-10 w-24 h-24 bg-primary rounded-full flex items-center justify-center text-on-primary mb-8 shadow-lg"
                    >
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative z-10 text-display-md font-display-md text-center mb-4 text-on-surface"
                    >
                        ¡Hola, {name || 'amigo'}!
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative z-10 text-body-lg font-body-lg text-on-surface-variant text-center max-w-sm"
                    >
                        Tu cuenta ha sido creada exitosamente. Bienvenido a la familia PFSTUDIO.
                    </motion.p>
                </motion.div>
            )}

            <ProcessingOverlay
                isOpen={isLoading}
                type="auth"
                title={
                    isForgotPassword
                        ? "Enviando enlace..."
                        : isLogin
                        ? "Iniciando Sesión..."
                        : "Creando tu Cuenta..."
                }
                subtitle={
                    isForgotPassword
                        ? "Enviando instrucciones a tu casilla de correo electrónico."
                        : isLogin
                        ? "Verificando tus datos en PFSTUDIO de forma segura."
                        : "Configurando tu perfil y preferencias en PFSTUDIO."
                }
            />
        </AnimatePresence>
    );
}
