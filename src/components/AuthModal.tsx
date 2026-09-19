"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Loader2, User } from "lucide-react";
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
    const [dni, setDni] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

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

    const handleOAuth = async (provider: 'google' | 'facebook') => {
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

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Modal de Autenticación"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-md max-h-[95vh] flex flex-col bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-xl overflow-y-auto overflow-x-hidden"
                    >
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-surface hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-all border border-outline-variant"
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
                                            className="w-full"
                                        >
                                            <div className="text-center mb-6">
                                                <h2 className="text-display-sm font-display-sm mb-2 text-on-surface">
                                                    {isForgotPassword ? "Recuperar Clave" : isLogin ? "Bienvenido" : "Crea tu Cuenta"}
                                                </h2>
                                                <p className="text-body-md font-body-md text-on-surface-variant">
                                                    {isForgotPassword 
                                                        ? "Ingresa tu email para recibir el enlace" 
                                                        : isLogin
                                                            ? "Ingresa tus datos para continuar"
                                                            : "Únete a PFSTUDIO y accede a ofertas"}
                                                </p>
                                            </div>

                                            <div className="space-y-4">

                                                {!isLogin && !isForgotPassword && (
                                                    <>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant ml-1">Nombre Completo</label>
                                                            <div className="relative group">
                                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                                                                <input
                                                                    type="text"
                                                                    required={!isLogin && !isForgotPassword}
                                                                    value={name}
                                                                    onChange={(e) => setName(e.target.value)}
                                                                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-surface-container-lowest border-2 border-surface-container hover:border-outline-variant focus:bg-surface focus:outline-none focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 rounded-xl"
                                                                    placeholder="Ej: Juan Pérez"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Factura Fields */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant ml-1">DNI / CUIT</label>
                                                                <input
                                                                    type="text"
                                                                    required={!isLogin && !isForgotPassword}
                                                                    value={dni}
                                                                    onChange={(e) => setDni(e.target.value)}
                                                                    className="w-full px-4 py-2.5 text-sm bg-surface-container-lowest border-2 border-surface-container hover:border-outline-variant focus:bg-surface focus:outline-none focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 rounded-xl"
                                                                    placeholder="Sin puntos"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant ml-1">Teléfono</label>
                                                                <input
                                                                    type="tel"
                                                                    required={!isLogin && !isForgotPassword}
                                                                    value={phone}
                                                                    onChange={(e) => setPhone(e.target.value)}
                                                                    className="w-full px-4 py-2.5 text-sm bg-surface-container-lowest border-2 border-surface-container hover:border-outline-variant focus:bg-surface focus:outline-none focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 rounded-xl"
                                                                    placeholder="Cod. área + número"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant ml-1">Dirección / Localidad</label>
                                                            <input
                                                                type="text"
                                                                required={!isLogin && !isForgotPassword}
                                                                value={address}
                                                                onChange={(e) => setAddress(e.target.value)}
                                                                className="w-full px-4 py-2.5 text-sm bg-surface-container-lowest border-2 border-surface-container hover:border-outline-variant focus:bg-surface focus:outline-none focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 rounded-xl"
                                                                placeholder="Av. Falsa 123"
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant ml-1">Email</label>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                                                        <input
                                                            type="email"
                                                            required
                                                            autoCapitalize="none"
                                                            autoCorrect="off"
                                                            spellCheck="false"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            className="w-full pl-11 pr-4 py-2.5 text-sm bg-surface-container-lowest border-2 border-surface-container hover:border-outline-variant focus:bg-surface focus:outline-none focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 rounded-xl"
                                                            placeholder="tu@email.com"
                                                        />
                                                    </div>
                                                </div>

                                                {!isForgotPassword && (
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant ml-1">Contraseña</label>
                                                            {isLogin && (
                                                                <button onClick={() => setIsForgotPassword(true)} type="button" className="text-[10px] font-bold text-primary hover:underline transition-all">
                                                                    ¿Olvidaste tu contraseña?
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                required={!isForgotPassword}
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                className="w-full pl-11 pr-11 py-2.5 text-sm bg-surface-container-lowest border-2 border-surface-container hover:border-outline-variant focus:bg-surface focus:outline-none focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 rounded-xl"
                                                                placeholder="••••••••"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                                                            >
                                                                {showPassword ? (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20" /><path d="M6.71 6.71a10 10 0 0 0-4.08 5.29 10 10 0 0 0 11.52 7.15" /><path d="M10.96 10.96a3 3 0 0 0 4.08 4.08" /><path d="M14.54 9.17A3 3 0 0 0 10.95 5.6" /><path d="M22 12a10 10 0 0 0-14.71-7.06" /></svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {!isLogin && !isForgotPassword && (
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant ml-1">Confirmar Contraseña</label>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                required={!isLogin && !isForgotPassword}
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                className="w-full pl-11 pr-11 py-2.5 text-sm bg-surface-container-lowest border-2 border-surface-container hover:border-outline-variant focus:bg-surface focus:outline-none focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 rounded-xl"
                                                                placeholder="••••••••"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {isForgotPassword && (
                                                    <div className="text-center pb-2">
                                                        <button onClick={() => setIsForgotPassword(false)} type="button" className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface transition-all">
                                                            Volver a Iniciar Sesión
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Inline Auth Error Message */}
                                                {authError && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-error-container border border-error rounded-lg text-label-sm font-label-sm text-on-error-container text-center"
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
                                    className="w-full py-3.5 mt-auto bg-primary text-on-primary rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] shadow-md shadow-primary/20 transition-all disabled:opacity-70 disabled:hover:scale-100 relative overflow-hidden"
                                >
                                    <span className={cn("transition-opacity flex items-center gap-2", isLoading ? "opacity-0" : "opacity-100")}>
                                        {isForgotPassword ? "Enviar Enlace" : isLogin ? "Ingresar a mi cuenta" : "Crear mi Cuenta"}
                                    </span>
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-surface-container border-t-on-primary rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </button>
                            </form>

                            {/* Social Login (Moved to bottom) */}
                            <div className="mt-6">
                                <div className="mb-6 relative flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-outline-variant"></div>
                                    </div>
                                    <span className="relative bg-surface-container-lowest px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
                                        O INGRESA MÁS RÁPIDO
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleOAuth('google')}
                                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-surface-container border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container-high transition-all text-label-lg font-label-lg group"
                                >
                                    <div className="bg-white p-0.5 rounded-full group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                    </div>
                                    Continuar con Google
                                </button>
                            </div>

                            {/* Toggle Bottom */}
                            <div className="mt-8 pt-6 border-t border-outline-variant text-center text-body-md font-body-md text-on-surface-variant">
                                {isLogin ? "¿Nuevo en PFSTUDIO? " : "¿Ya eres miembro? "}
                                <button
                                    onClick={() => toggleMode(!isLogin)}
                                    className="font-bold text-primary hover:underline transition-colors ml-1"
                                >
                                    {isLogin ? "Regístrate ahora" : "Inicia Sesión"}
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}



            {/* Welcome Animation Screen */}
            {showWelcome && (
                <motion.div
                    key="welcome_screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="fixed inset-0 z-1000 flex flex-col items-center justify-center p-4 bg-surface backdrop-blur-3xl"
                >
                    {/* Confetti / Decorative background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center opacity-30">
                        <motion.div 
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: 1.5, rotate: 180 }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            className="w-[80vw] h-[80vw] max-w-2xl max-h-2xl rounded-full bg-linear-to-tr from-primary to-transparent blur-[100px] opacity-20"
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

            {/* Branded Processing Screen Overlay */}
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
