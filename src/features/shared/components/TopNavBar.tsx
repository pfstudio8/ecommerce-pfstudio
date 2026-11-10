"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/store/auth";
import { useCartStore } from "@/features/orders/store/cart";
import { useFavoritesStore } from "@/features/catalog/store/favorites";
import { useProductDrawerStore } from "@/features/catalog/store/productDrawer";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { X, LogOut, LayoutDashboard, User, Search, ShoppingBag, Heart, Menu, Sparkles } from "lucide-react";
import CartSidebar from "@/components/CartSidebar";
import FavoritesSidebar from "@/components/FavoritesSidebar";
import QuickCustomizeDrawer from "@/features/catalog/components/QuickCustomizeDrawer";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import { cn } from "@/lib/utils";

export default function TopNavBar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollYRef = useRef(0);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [fuse, setFuse] = useState<any>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const pathname = usePathname();
    const isHome = pathname === "/";

    const setModalOpen = useAuthStore((state) => state.setModalOpen);
    const user = useAuthStore((state) => state.user);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const isAdmin = useAuthStore((state) => state.isAdmin);

    // Cart and Favorites state
    const [isMounted, setIsMounted] = useState(false);
    const { items, setCartOpen } = useCartStore();
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    const fetchFavorites = useFavoritesStore(state => state.fetchFavorites);
    const favoriteIds = useFavoritesStore(state => state.favoriteIds);
    const setFavoritesOpen = useFavoritesStore(state => state.setFavoritesOpen);

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Smart Scroll Headroom Listener (Auto-hide on scroll down, reveal on scroll up)
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const diff = currentScrollY - lastScrollYRef.current;

            setIsScrolled(currentScrollY > 25);

            if (isSearchOpen || isMobileMenuOpen) {
                setIsVisible(true);
                lastScrollYRef.current = currentScrollY;
                return;
            }

            // Always visible near top
            if (currentScrollY <= 60) {
                setIsVisible(true);
            } else if (diff > 8) {
                // Scrolling down -> hide to give full view of products
                setIsVisible(false);
            } else if (diff < -6) {
                // Scrolling up -> instantly reveal
                setIsVisible(true);
            }

            lastScrollYRef.current = currentScrollY;
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isSearchOpen, isMobileMenuOpen]);

    // Focus input when search opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Close search on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isSearchOpen) {
                setIsSearchOpen(false);
                setSearchQuery("");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSearchOpen]);

    useEffect(() => {
        if (isInitialized) {
            fetchFavorites();
        }
    }, [isInitialized, user, fetchFavorites]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await supabase.auth.signOut();
            toast.success("Sesión cerrada correctamente");
            window.location.reload();
        } catch (error) {
            setIsLoggingOut(false);
            toast.error("Error al cerrar sesión");
        }
    };

    // Load products for fuzzy search
    useEffect(() => {
        const loadSearchEngine = async () => {
            try {
                const { data } = await supabase
                    .from('products')
                    .select('id, name, price, images, category')
                    .eq('active', true);

                if (data) {
                    const Fuse = (await import('fuse.js')).default;
                    setFuse(new Fuse(data, {
                        keys: ['name', 'category'],
                        threshold: 0.3,
                        distance: 100
                    }));
                }
            } catch (err) {
                console.error("Error loading products for search:", err);
            }
        };
        loadSearchEngine();
    }, []);

    // Search logic
    useEffect(() => {
        if (searchQuery.trim().length < 2 || !fuse) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const results = fuse.search(searchQuery).map((r: any) => r.item).slice(0, 6);
        setSearchResults(results);
        setIsSearching(false);
    }, [searchQuery, fuse]);

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const query = searchQuery.trim();
        if (query) {
            router.push(`/catalog?search=${encodeURIComponent(query)}`);
            setSearchQuery("");
            setIsSearchOpen(false);
            setIsMobileMenuOpen(false);
        }
    };

    // Theme styling based on scroll state
    const isDarkHeader = isHome ? (isScrolled || isSearchOpen) : true;
    const headerBgClass = isHome
        ? (isScrolled 
            ? "bg-black/85 backdrop-blur-xl border-b border-white/10 shadow-2xl text-white" 
            : "bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white border-b border-transparent")
        : "bg-black/90 backdrop-blur-xl border-b border-white/10 text-white shadow-md";

    return (
        <>
            <header className={cn(
            "sticky top-0 z-50 transition-all duration-300 ease-out transform w-full",
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none",
            headerBgClass
        )}>
            <div className="w-full px-margin md:px-gutter-desktop max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-20 gap-3 md:gap-6 relative">

                {/* Left: Brand & Mobile menu button */}
                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        aria-label="Abrir menú" 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 -ml-2 text-white hover:text-[#e5a93b] rounded-full hover:bg-white/10 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {isInitialized && isAdmin && (
                        <Link 
                            href="/admin" 
                            className="hidden md:flex p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            title="Ir al Panel de Administración"
                        >
                            <LayoutDashboard className="w-[18px] h-[18px]" />
                        </Link>
                    )}

                    <Link 
                        href="/" 
                        className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 active:scale-98 transition-transform group"
                    >
                        <span className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-[#e5a93b] text-xs font-black group-hover:scale-105 transition-transform">
                            PF
                        </span>
                        <span className="font-black tracking-tighter">pfstudio</span>
                    </Link>
                </div>

                {/* Center: Integrated Navigation Links (or Expanded Search when active) */}
                <div className="flex-1 flex items-center justify-center max-w-2xl px-2">
                    <AnimatePresence mode="wait">
                        {isSearchOpen ? (
                            /* Expanded Integrated Search Bar */
                            <motion.div
                                key="search-bar"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="w-full max-w-lg relative"
                            >
                                <form onSubmit={handleSearchSubmit} className="relative w-full">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
                                    <input 
                                        ref={searchInputRef}
                                        type="text" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar remeras boxy, hoodies, tazas, gorras..." 
                                        className="w-full pl-11 pr-10 py-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder-white/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/25 transition-all shadow-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsSearchOpen(false);
                                            setSearchQuery("");
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
                                        title="Cerrar búsqueda (Esc)"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </form>

                                {/* Search Results Dropdown */}
                                {searchQuery.trim().length >= 2 && (
                                    <div className="absolute top-full mt-2 left-0 right-0 bg-[#FFF4E2] text-[#472825] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 max-h-80 overflow-y-auto border border-[#472825]/15">
                                        {isSearching ? (
                                            <div className="text-xs text-[#472825]/70 p-4 text-center">Buscando prendas...</div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="p-4 text-center">
                                                <p className="text-xs text-[#472825]/70 mb-2">No encontramos resultados exactos</p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSearchSubmit()}
                                                    className="text-xs text-[#454e15] font-black hover:underline"
                                                >
                                                    Buscar &quot;{searchQuery}&quot; en catálogo &rarr;
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {searchResults.map(prod => (
                                                    <button
                                                        key={prod.id}
                                                        onClick={() => {
                                                            router.push(`/product/${prod.id}`);
                                                            setSearchQuery("");
                                                            setIsSearchOpen(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 p-3 hover:bg-[#472825]/5 transition-colors text-left outline-none border-b border-[#472825]/5"
                                                    >
                                                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 border border-[#472825]/10">
                                                            {prod.images?.[0] && (
                                                                <Image width={40} height={40} src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#454e15] block">
                                                                {prod.category}
                                                            </span>
                                                            <h4 className="text-xs font-black text-[#472825] truncate">{prod.name}</h4>
                                                            <p className="text-[11px] font-black text-[#472825]">${prod.price.toLocaleString("es-AR")}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => handleSearchSubmit()}
                                                    className="w-full py-2.5 px-3 bg-[#472825]/10 hover:bg-[#472825]/15 text-[#472825] font-black text-xs flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    Ver todos los resultados para &quot;{searchQuery}&quot; &rarr;
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* Clean Minimalist Nav Links (Moahu Style) */
                            <nav key="nav-links" className="hidden md:flex items-center gap-1 lg:gap-2">
                                <Link 
                                    href="/catalog" 
                                    className="text-white/85 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest rounded-full px-4 py-2 transition-all"
                                >
                                    Catálogo
                                </Link>
                                <Link 
                                    href="/#remeras" 
                                    className="text-white/85 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest rounded-full px-4 py-2 transition-all"
                                >
                                    Colecciones
                                </Link>
                                <Link 
                                    href="/#personalizados" 
                                    className="text-white/85 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest rounded-full px-4 py-2 transition-all"
                                >
                                    Personalizados
                                </Link>
                                <Link 
                                    href="/#comunidad" 
                                    className="text-white/85 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest rounded-full px-4 py-2 transition-all"
                                >
                                    Reseñas
                                </Link>
                            </nav>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Integrated Actions (Search Icon, User, Heart, Cart, Pill Button) */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">

                    {/* Integrated Search Trigger Button */}
                    {!isSearchOpen && (
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            aria-label="Abrir buscador"
                            className="p-2 sm:px-3 sm:py-2 text-white/85 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center gap-1.5"
                            title="Buscar productos"
                        >
                            <Search className="w-4 h-4" />
                            <span className="hidden xl:inline text-xs font-bold uppercase tracking-wider text-white/70">Buscar</span>
                        </button>
                    )}

                    {/* User profile / Login */}
                    {isInitialized && user ? (
                        <div className="flex items-center gap-1">
                            <Link 
                                href="/profile" 
                                className="p-2 text-white/85 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
                                title="Mi perfil"
                            >
                                <User className="w-4 h-4" />
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className="hidden sm:flex items-center justify-center p-2 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setModalOpen(true)} 
                            className="p-2 text-white/85 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
                            title="Iniciar sesión"
                        >
                            <User className="w-4 h-4" />
                        </button>
                    )}

                    {/* Favorites Heart */}
                    <button 
                        onClick={() => setFavoritesOpen(true)} 
                        aria-label="Favoritos" 
                        className="relative p-2 text-white/85 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Heart className={cn("w-4 h-4", isMounted && favoriteIds.length > 0 && "fill-red-500 text-red-500")} />
                        {isMounted && favoriteIds.length > 0 && (
                            <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-0.5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                {favoriteIds.length}
                            </span>
                        )}
                    </button>

                    {/* Cart Bag Icon with Badge */}
                    <button 
                        onClick={() => setCartOpen(true)} 
                        aria-label="Bolsa de compras" 
                        className="relative p-2 text-white/85 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {isMounted && totalItems > 0 && (
                            <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-0.5 bg-[#e5a93b] text-[#1d1c16] text-[9px] font-black rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {/* White Pill Action Button (Moahu Style "Comprar / Personalizar") */}
                    <Link
                        href="/#personalizados"
                        className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-[#472825] font-black text-xs uppercase tracking-wider hover:bg-white/90 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-[#e5a93b]" />
                        <span>Personalizar</span>
                    </Link>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[#FFF4E2] text-[#472825] z-50 shadow-2xl flex flex-col justify-between"
                        >
                            <div>
                                <div className="p-5 flex justify-between items-center border-b border-[#472825]/10">
                                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black tracking-tight text-[#472825] flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-[#472825] text-[#FFF4E2] flex items-center justify-center text-xs font-black">
                                            PF
                                        </span>
                                        <span>pfstudio</span>
                                    </Link>
                                    <button 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 -mr-2 hover:bg-[#472825]/10 rounded-full transition-colors text-[#472825]"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-5 flex flex-col gap-2">
                                    <Link 
                                        href="/catalog" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-4 py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#472825]/10 transition-colors"
                                    >
                                        Catálogo Completo
                                    </Link>
                                    <Link 
                                        href="/#remeras" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-4 py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#472825]/10 transition-colors"
                                    >
                                        Colecciones Destacadas
                                    </Link>
                                    <Link 
                                        href="/#personalizados" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-4 py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#472825]/10 transition-colors"
                                    >
                                        Pedidos Personalizados
                                    </Link>
                                    <Link 
                                        href="/#comunidad" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-4 py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#472825]/10 transition-colors"
                                    >
                                        Reseñas & Comunidad
                                    </Link>
                                </div>
                            </div>

                            <div className="p-5 border-t border-[#472825]/10 bg-[#fdf8ee] flex flex-col gap-2.5">
                                <Link
                                    href="/#personalizados"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full py-3 bg-[#472825] text-[#FFF4E2] font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-md"
                                >
                                    <Sparkles className="w-4 h-4 text-[#e5a93b]" />
                                    <span>Personalizar Prenda</span>
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </header>

        <CartSidebar />
        <FavoritesSidebar />
        <QuickCustomizeDrawer />

        <ProcessingOverlay
            isOpen={isLoggingOut}
            type="auth"
            title="Cerrando Sesión..."
            subtitle="Hasta pronto."
        />
    </>
    );
}
