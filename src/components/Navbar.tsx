"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, X, LogOut, User, LayoutDashboard, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import CartSidebar from "./CartSidebar";
import { useAuthStore } from "@/store/auth";
import { useFavoritesStore } from "@/store/favorites";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { sileo } from "sileo";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    const setModalOpen = useAuthStore((state) => state.setModalOpen);
    const user = useAuthStore((state) => state.user);
    const isInitialized = useAuthStore((state) => state.isInitialized);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await supabase.auth.signOut();
            sileo.error({ title: "Has cerrado sesión" });
            setIsMobileMenuOpen(false);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

    // To avoid hydration errors with Zustand persist, we only show the count after mounting
    const [isMounted, setIsMounted] = useState(false);
    const { items, isCartOpen, setCartOpen } = useCartStore();
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    const fetchFavorites = useFavoritesStore(state => state.fetchFavorites);

    useEffect(() => {
        if (isInitialized) {
            fetchFavorites();
        }
    }, [isInitialized, user, fetchFavorites]);

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        // Call it immediately to set initial state correctly
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
                    isScrolled ? "bg-[var(--background)] shadow-[0_24px_24px_0_rgba(0,168,122,0.06)] h-20" : "bg-transparent h-24"
                )}
            >
                <div className="flex justify-between items-center px-4 md:px-8 h-full w-full max-w-[1400px] mx-auto relative px-safe">

                    {/* Left Section (Mobile Menu / Desktop Logo) */}
                    <div className="flex-1 flex items-center justify-start z-50">
                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden text-[var(--foreground)] active:scale-95 transition-transform"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Desktop Logo */}
                        <div className="hidden lg:flex">
                            <button
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    router.push('/');
                                }}
                                className="text-[28px] font-extrabold tracking-tight text-[var(--foreground)] m-0 hover:text-[var(--color-main)] transition-colors whitespace-nowrap outline-none"
                                title="Ir al inicio"
                            >
                                PFSTUDIO
                            </button>
                        </div>
                    </div>

                    {/* Center Section (Mobile Logo / Desktop Nav) */}
                    <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none z-50 flex-none flex items-center justify-center">
                        {/* Mobile Logo */}
                        <div className="flex lg:hidden">
                            <button
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    router.push('/');
                                }}
                                className="text-[24px] font-extrabold tracking-tight text-[var(--foreground)] m-0 hover:text-[var(--color-main)] transition-colors whitespace-nowrap outline-none"
                                title="Ir al inicio"
                            >
                                PFSTUDIO
                            </button>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-8 font-bold tracking-tight">
                            {["Hombres", "Mujeres", "Niños", "Todas"].map((dept) => (
                                <Link
                                    key={dept}
                                    href={`/?dept=${dept}#productos`}
                                    className="text-gray-400 hover:text-[var(--foreground)] transition-colors duration-200 active:scale-95 uppercase text-sm tracking-wider"
                                >
                                    {dept}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Icons */}
                    <div className="flex-1 flex items-center justify-end space-x-4 sm:space-x-6 z-50">
                        <div className="relative flex items-center hidden sm:flex">
                            {isSearchOpen && (
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            router.push(`/?search=${searchQuery}#productos`);
                                            setIsSearchOpen(false);
                                        }
                                    }}
                                    placeholder="Buscar..."
                                    className="absolute right-8 w-48 px-3 py-1 bg-white/10 dark:bg-black/80 border border-gray-200/20 dark:border-gray-800 rounded-full text-sm focus:outline-none focus:border-[var(--color-main)] animate-slideInRight"
                                    autoFocus
                                />
                            )}
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="active:scale-95 transition-transform text-gray-400 hover:text-[var(--foreground)]"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search icon logic for mobile - we use the drawer instead, this simply opens the search bar */}

                        {isInitialized && user ? (
                            <div className="relative group flex items-center">
                                <button className="active:scale-95 transition-transform text-gray-400 hover:text-[var(--foreground)] flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                </button>
                                <div className="absolute right-0 top-full pt-2 w-48 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                                    <div className="bg-[var(--background)] border border-white/5 rounded-xl shadow-2xl p-2 flex flex-col">
                                        <span className="px-4 py-2 text-xs text-gray-500 border-b border-white/5 mb-1 truncate text-center font-medium">
                                            {user.email}
                                        </span>
                                        {isAdmin ? (
                                            <Link
                                                href="/admin"
                                                className="w-full text-left px-4 py-2 mt-1 text-sm text-[var(--foreground)] hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                Panel Admin
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/perfil"
                                                className="w-full text-left px-4 py-2 mt-1 text-sm text-[var(--foreground)] hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                            >
                                                <User className="w-4 h-4" />
                                                Mi Perfil
                                            </Link>
                                        )}
                                        <Link
                                            href="/favoritos"
                                            className="w-full text-left px-4 py-2 mt-1 text-sm text-[var(--foreground)] hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <Heart className="w-4 h-4 text-[var(--color-main)]" />
                                            Mis Favoritos
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 mt-1 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            </div>

                        ) : (
                            <button
                                onClick={() => setModalOpen(true)}
                                className="flex active:scale-95 transition-transform text-gray-400 hover:text-[var(--foreground)]"
                                title="Mi Cuenta"
                            >
                                <User className="w-5 h-5" />
                            </button>
                        )}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCartOpen(true)}
                            className="active:scale-95 transition-transform text-gray-400 hover:text-[var(--foreground)] relative flex items-center justify-center"
                        >
                            <motion.div
                                key={`cart-icon-${totalItems}`}
                                initial={isMounted && totalItems > 0 ? { scale: 1.2, rotate: 10 } : false}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                                <ShoppingBag className="w-5 h-5" />
                            </motion.div>

                            <AnimatePresence>
                                {isMounted && totalItems > 0 && (
                                    <motion.span
                                        key={`badge-${totalItems}`}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute -top-2 -right-2 bg-[var(--color-main)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-[var(--color-main)]/30"
                                    >
                                        {totalItems}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-50 transition-opacity lg:hidden",
                    isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 bottom-0 w-72 bg-[var(--background)] z-50 shadow-2xl transition-transform duration-300 lg:hidden flex flex-col",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold tracking-widest">PFSTUDIO</h2>
                    <button onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="flex flex-col">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-lg hover:bg-black/5 dark: hover:bg-white/5 transition-colors font-medium border-b border-gray-100 dark:border-gray-800">
                            Inicio
                        </Link>
                        <Link href="/#productos" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium border-b border-gray-100 dark:border-gray-800">
                            Productos
                        </Link>
                        <Link href="/#nosotros" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium border-b border-gray-100 dark:border-gray-800">
                            Quiénes Somos
                        </Link>
                        <a href="mailto:hola@pfstudio.com" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium border-b border-gray-100 dark:border-gray-800">
                            Contacto
                        </a>
                    </nav>
                </div>

                <div className="p-6 pb-safe pb-10 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-4">
                    {isInitialized && user ? (
                        <>
                            <p className="text-sm text-gray-500 text-center truncate px-2">{user.email}</p>
                            {isAdmin ? (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full py-3 border border-gray-200 dark:border-gray-800 text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors rounded uppercase text-sm font-bold tracking-wider flex items-center justify-center gap-2"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Panel Admin
                                </Link>
                            ) : (
                                <Link
                                    href="/perfil"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full py-3 border border-gray-200 dark:border-gray-800 text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors rounded uppercase text-sm font-bold tracking-wider flex items-center justify-center gap-2"
                                >
                                    <User className="w-4 h-4" />
                                    Mi Perfil
                                </Link>
                            )}
                            <Link
                                href="/favoritos"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-3 border border-gray-200 dark:border-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded uppercase text-sm font-bold tracking-wider flex items-center justify-center gap-2"
                            >
                                <Heart className="w-4 h-4 fill-current" />
                                Mis Favoritos
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded uppercase text-sm font-bold tracking-wider flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setModalOpen(true);
                            }}
                            className="w-full py-3 border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors rounded uppercase text-sm font-bold tracking-wider"
                        >
                            Iniciar Sesión
                        </button>
                    )}
                </div>
            </aside>

            {/* Cart Sidebar Sub-component */}
            <CartSidebar />

            {/* Global Loading Overlay for Logout Action */}
            <AnimatePresence>
                {isLoggingOut && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-[var(--background)]/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto"
                    >
                        <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
                        <p className="text-sm font-bold tracking-widest uppercase text-red-500">Cerrando Sesión...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
