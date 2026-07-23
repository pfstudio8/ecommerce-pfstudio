"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, X, LogOut, User, LayoutDashboard, Heart, Shirt, Trophy, Briefcase, Sparkles, Compass, ChevronDown, ChevronRight, Home, Phone, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import CartSidebar from "./CartSidebar";
import FavoritesSidebar from "./FavoritesSidebar";
import { useAuthStore } from "@/store/auth";
import { useFavoritesStore } from "@/store/favorites";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { sileo } from "sileo";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isRemerasExpanded, setIsRemerasExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    const setModalOpen = useAuthStore((state) => state.setModalOpen);
    const user = useAuthStore((state) => state.user);
    const isAdmin = useAuthStore((state) => state.isAdmin);
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

    // To avoid hydration errors with Zustand persist, we only show the count after mounting
    const [isMounted, setIsMounted] = useState(false);
    const { items, isCartOpen, setCartOpen } = useCartStore();
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    const fetchFavorites = useFavoritesStore(state => state.fetchFavorites);
    const favoriteIds = useFavoritesStore(state => state.favoriteIds);
    const setFavoritesOpen = useFavoritesStore(state => state.setFavoritesOpen);

    useEffect(() => {
        if (isInitialized) {
            fetchFavorites();
        }
    }, [isInitialized, user, fetchFavorites]);

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, name, price, images, category')
                    .ilike('name', `%${searchQuery}%`)
                    .limit(5);

                if (!error && data) {
                    setSearchResults(data);
                }
            } catch (err) {
                console.error("Autocomplete search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

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

                    {/* Left Section (Menu Button) */}
                    <div className="flex-1 flex items-center justify-start z-50">
                        <button
                            className="text-[var(--foreground)] active:scale-95 transition-transform p-2 hover:bg-white/5 dark:hover:bg-white/5 rounded-full duration-200"
                            onClick={() => setIsMobileMenuOpen(true)}
                            title="Abrir menú"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Center Section (Centered Logo) */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-50 flex-none flex items-center justify-center">
                        <button
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                router.push('/');
                            }}
                            className="text-[24px] md:text-[28px] font-extrabold tracking-tight text-[var(--foreground)] hover:text-[var(--color-main)] transition-colors duration-200 whitespace-nowrap outline-none"
                            title="Ir al inicio"
                        >
                            PFSTUDIO
                        </button>
                    </div>

                    {/* Icons */}
                    <div className="flex-1 flex items-center justify-end space-x-4 sm:space-x-6 z-50">
                        <div className="relative flex items-center hidden sm:flex">
                            {isSearchOpen && (
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-end">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                router.push(`/?search=${searchQuery}#productos`);
                                                setIsSearchOpen(false);
                                                setSearchQuery("");
                                            }
                                        }}
                                        placeholder="Buscar..."
                                        className="w-48 px-3 py-1 bg-white/10 dark:bg-black/85 border border-gray-200/20 dark:border-gray-800 rounded-full text-sm focus:outline-none focus:border-[var(--color-main)] animate-slideInRight text-white"
                                        autoFocus
                                    />
                                    
                                    {searchQuery.trim().length >= 2 && (
                                        <div className="absolute top-full mt-4 right-0 w-64 bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden p-2 flex flex-col gap-1 z-[100] text-white">
                                            {isSearching ? (
                                                <div className="text-xs text-gray-500 p-3 text-center">Buscando...</div>
                                            ) : searchResults.length === 0 ? (
                                                <div className="text-xs text-gray-500 p-3 text-center">No hay resultados</div>
                                            ) : (
                                                searchResults.map(prod => (
                                                    <button
                                                        key={prod.id}
                                                        onClick={() => {
                                                            router.push(`/producto/${prod.id}`);
                                                            setIsSearchOpen(false);
                                                            setSearchQuery("");
                                                        }}
                                                        className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-left transition-colors outline-none"
                                                    >
                                                        <div className="relative w-10 h-10 rounded overflow-hidden bg-white/10 flex-shrink-0">
                                                            <Image
                                                                src={prod.images[0]}
                                                                alt={prod.name}
                                                                fill
                                                                sizes="40px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-bold truncate text-white">{prod.name}</h4>
                                                            <p className="text-[10px] text-[var(--color-main)] font-bold">${prod.price.toLocaleString("es-AR")}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
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
                            <>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="active:scale-95 transition-transform text-gray-400 hover:text-[var(--color-main)] p-1 hover:bg-white/5 rounded-full"
                                        title="Panel de Administración"
                                    >
                                        <LayoutDashboard className="w-5 h-5 text-[var(--color-main)]" />
                                    </Link>
                                )}
                                <button
                                    onClick={() => setFavoritesOpen(true)}
                                    className="relative active:scale-95 transition-transform text-gray-400 hover:text-red-500 p-1 hover:bg-white/5 rounded-full"
                                    title="Mis Favoritos"
                                >
                                    <Heart className={cn("w-5 h-5 transition-colors", isMounted && favoriteIds.length > 0 ? "fill-red-500 text-red-500" : "")} />
                                    {isMounted && favoriteIds.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                                            {favoriteIds.length}
                                        </span>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setModalOpen(true)}
                                className="active:scale-95 transition-transform text-gray-400 hover:text-[var(--foreground)] p-1 hover:bg-white/5 rounded-full"
                                title="Iniciar Sesión"
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

            {/* Hamburger Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Hamburger Menu Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 220 }}
                        className="fixed top-0 left-0 bottom-0 w-80 bg-zinc-950/95 backdrop-blur-md text-white z-50 shadow-2xl flex flex-col border-r border-white/5"
                    >
                        {/* Header */}
                        <div className="p-6 flex justify-between items-center border-b border-white/5">
                            <h2 className="text-2xl font-black tracking-[0.1em] text-[var(--color-main)]">PFSTUDIO</h2>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors duration-200"
                            >
                                <X className="w-5 h-5 text-gray-400 hover:text-white" />
                            </button>
                        </div>

                        {/* Navigation Content */}
                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
                            
                            {/* Section: Departments */}
                            <div className="space-y-2">
                                <div className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <Compass className="w-3.5 h-3.5" />
                                    <span>Secciones</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Link 
                                        href="/?dept=Todas&cat=Todas#productos" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="py-2.5 px-4 rounded-xl flex items-center justify-between text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium text-base"
                                    >
                                        <span>Todos los productos</span>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                                    </Link>
                                    {["Hombres", "Mujeres", "Niños"].map((dept) => (
                                        <Link 
                                            key={dept}
                                            href={`/?dept=${dept}#productos`} 
                                            onClick={() => setIsMobileMenuOpen(false)} 
                                            className="py-2.5 px-4 rounded-xl flex items-center justify-between text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium text-base"
                                        >
                                            <span>{dept}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Section: Categories */}
                            <div className="space-y-2">
                                <div className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Categorías</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {/* Remeras Expandable */}
                                    <div>
                                        <button
                                            onClick={() => setIsRemerasExpanded(!isRemerasExpanded)}
                                            className="w-full py-2.5 px-4 rounded-xl flex items-center justify-between text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium text-base outline-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Shirt className="w-5 h-5 text-[var(--color-main)]" />
                                                <span>Remeras</span>
                                            </div>
                                            <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform duration-200", isRemerasExpanded ? "rotate-180" : "")} />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {isRemerasExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden pl-12 flex flex-col gap-1 mt-1 border-l border-white/5 ml-6"
                                                >
                                                    <Link href="/?cat=Remeras#productos" onClick={() => setIsMobileMenuOpen(false)} className="text-sm py-2 text-gray-400 hover:text-white transition-colors">
                                                        Todas las Remeras
                                                    </Link>
                                                    <Link href="/?cat=Oversize#productos" onClick={() => setIsMobileMenuOpen(false)} className="text-sm py-2 text-gray-400 hover:text-white transition-colors">
                                                        Corte Oversize
                                                    </Link>
                                                    <Link href="/?cat=Boxy Fit#productos" onClick={() => setIsMobileMenuOpen(false)} className="text-sm py-2 text-gray-400 hover:text-white transition-colors">
                                                        Corte Boxy Fit
                                                    </Link>
                                                    <Link href="/?cat=Clásicas#productos" onClick={() => setIsMobileMenuOpen(false)} className="text-sm py-2 text-gray-400 hover:text-white transition-colors">
                                                        Corte Clásico
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Soccer Jerseys */}
                                    <Link 
                                        href="/?cat=Camisetas#productos" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="py-2.5 px-4 rounded-xl flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium text-base"
                                    >
                                        <Trophy className="w-5 h-5 text-[var(--color-main)]" />
                                        <span>Camisetas de Fútbol</span>
                                    </Link>

                                    {/* Caps */}
                                    <Link 
                                        href="/?cat=Gorras#productos" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="py-2.5 px-4 rounded-xl flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium text-base"
                                    >
                                        <Sparkles className="w-5 h-5 text-[var(--color-main)]" />
                                        <span>Gorras Exclusivas</span>
                                    </Link>

                                    {/* Boot Bags */}
                                    <Link 
                                        href="/?cat=Botineros#productos" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="py-2.5 px-4 rounded-xl flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium text-base"
                                    >
                                        <Briefcase className="w-5 h-5 text-[var(--color-main)]" />
                                        <span>Botineros Deportivos</span>
                                    </Link>

                                    {/* Accessories */}
                                    <Link 
                                        href="/?cat=Accesorios#productos" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="py-2.5 px-4 rounded-xl flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium text-base"
                                    >
                                        <Gift className="w-5 h-5 text-[var(--color-main)]" />
                                        <span>Accesorios & Regalos</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Section: Brand */}
                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <div className="flex flex-col gap-1">
                                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-4 flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                                        <Home className="w-4 h-4" />
                                        <span>Inicio</span>
                                    </Link>
                                    <Link href="/#nosotros" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-4 flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                                        <Compass className="w-4 h-4" />
                                        <span>Quiénes Somos</span>
                                    </Link>
                                    <a href="mailto:hola@pfstudio.com" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-4 flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                                        <Phone className="w-4 h-4" />
                                        <span>Contacto</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Footer Profile Actions */}
                        <div className="p-6 border-t border-white/5 bg-black/40 flex flex-col gap-4">
                            {isInitialized && user ? (
                                <>
                                    <p className="text-xs text-gray-500 text-center truncate px-2">{user.email}</p>
                                    {isAdmin ? (
                                        <Link
                                            href="/admin"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="w-full py-2.5 border border-white/10 text-white hover:bg-white/5 transition-colors rounded-xl text-xs font-bold tracking-wider flex items-center justify-center gap-2 uppercase"
                                        >
                                            <LayoutDashboard className="w-4 h-4 text-[var(--color-main)]" />
                                            Panel Admin
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/perfil"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="w-full py-2.5 border border-white/10 text-white hover:bg-white/5 transition-colors rounded-xl text-xs font-bold tracking-wider flex items-center justify-center gap-2 uppercase"
                                        >
                                            <User className="w-4 h-4 text-[var(--color-main)]" />
                                            Mi Perfil
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-xl text-xs font-bold tracking-wider flex items-center justify-center gap-2 uppercase"
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
                                    className="w-full py-3 bg-[var(--color-main)] hover:bg-[var(--color-main)]/90 text-white transition-colors rounded-xl text-sm font-bold tracking-wide uppercase"
                                >
                                    Iniciar Sesión
                                </button>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Cart Sidebar & Favorites Sidebar Sub-components */}
            <CartSidebar />
            <FavoritesSidebar />

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

