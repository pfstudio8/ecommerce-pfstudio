"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth";
import { useCartStore } from "@/features/orders/store/cart";
import { useFavoritesStore } from "@/features/catalog/store/favorites";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { X, LogOut, LayoutDashboard, User } from "lucide-react";
import CartSidebar from "@/components/CartSidebar";
import FavoritesSidebar from "@/components/FavoritesSidebar";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import { cn } from "@/lib/utils";

export default function TopNavBar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [fuse, setFuse] = useState<any>(null);
    
    const router = useRouter();
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
                    .select('id, name, price, images, category');
                
                if (data) {
                    const Fuse = (await import('fuse.js')).default;
                    setFuse(new Fuse(data, {
                        keys: ['name', 'category'],
                        threshold: 0.3, // 0 = exact match, 1 = match anything
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
        // Fuse search returns { item, refIndex }
        const results = fuse.search(searchQuery).map((r: any) => r.item).slice(0, 6);
        setSearchResults(results);
        setIsSearching(false);
    }, [searchQuery, fuse]);

    return (
        <header className="docked full-width top-0 sticky z-50 bg-surface border-b border-outline-variant shadow-sm transition-all duration-300">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto flex items-center justify-between h-16 gap-space-md">
                {/* Brand Logo & Mobile menu toggle */}
                <div className="flex items-center gap-2 md:gap-3">
                    <button 
                        aria-label="Abrir menú" 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-space-xs text-on-surface hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-headline-md">menu</span>
                    </button>
                    {isInitialized && isAdmin && (
                        <Link 
                            href="/admin" 
                            className="hidden md:flex p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                            title="Ir al Panel de Administración"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </Link>
                    )}
                    <Link href="/" className="text-headline-md font-headline-md font-bold tracking-tight text-primary flex items-center gap-space-xs active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-primary material-symbols-fill">layers</span>
                        pfstudio
                    </Link>
                </div>
                
                {/* Search Bar on Left of Navigation */}
                <div className="hidden lg:flex flex-col flex-1 max-w-xs relative mx-space-md">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-headline-sm">search</span>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    router.push(`/?search=${searchQuery}#productos`);
                                    setSearchQuery("");
                                }
                            }}
                            className="w-full pl-9 pr-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                            placeholder="Buscar remeras, llaveros, blanks..." 
                        />
                    </div>
                    {/* Search Results Dropdown */}
                    {searchQuery.trim().length >= 2 && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden flex flex-col z-100 max-h-75 overflow-y-auto custom-scrollbar">
                            {isSearching ? (
                                <div className="text-xs text-on-surface-variant p-3 text-center">Buscando...</div>
                            ) : searchResults.length === 0 ? (
                                <div className="text-xs text-on-surface-variant p-3 text-center">No hay resultados</div>
                            ) : (
                                searchResults.map(prod => (
                                    <button
                                        key={prod.id}
                                        onClick={() => {
                                            router.push(`/product/${prod.id}`);
                                            setSearchQuery("");
                                        }}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-surface-container transition-colors text-left outline-none border-b border-outline-variant/30 last:border-0"
                                    >
                                        <div className="relative w-10 h-10 rounded overflow-hidden bg-surface-container shrink-0">
                                            {prod.images?.[0] && (
                                                <Image width={40} height={40} src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-label-md font-bold text-on-surface truncate">{prod.name}</h4>
                                            <p className="text-label-sm font-bold text-primary">${prod.price.toLocaleString("es-AR")}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-space-sm mx-auto">
                    <Link href="#catalogo" className="text-on-surface-variant font-medium text-label-md hover:text-primary hover:bg-surface-container transition-colors duration-150 active:scale-95 rounded-lg px-2 py-1">
                        Catálogo
                    </Link>
                    <Link href="#personalizador" className="text-on-surface-variant font-medium text-label-md hover:text-primary hover:bg-surface-container transition-colors duration-150 active:scale-95 rounded-lg px-2 py-1">
                        Diseñá tu Producto
                    </Link>
                    <Link href="#insumos" className="text-on-surface-variant font-medium text-label-md hover:text-primary hover:bg-surface-container transition-colors duration-150 active:scale-95 rounded-lg px-2 py-1">
                        Insumos
                    </Link>
                    <Link href="#comunidad" className="text-on-surface-variant font-medium text-label-md hover:text-primary hover:bg-surface-container transition-colors duration-150 active:scale-95 rounded-lg px-2 py-1">
                        Comunidad
                    </Link>
                </nav>

                {/* Trailing Action Buttons */}
                <div className="flex items-center gap-space-sm">
                    {/* Diseñar en Vivo CTA */}
                    <Link href="#personalizador" className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-tertiary-fixed hover:bg-tertiary-container text-on-tertiary-fixed font-headline-sm text-label-md rounded-lg shadow-sm active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-headline-sm material-symbols-fill">auto_fix_high</span>
                        Diseñar en Vivo
                    </Link>
                    
                    {/* User profile link and Logout */}
                    {isInitialized && user ? (
                        <div className="flex items-center gap-1">
                            <Link href="/profile" className="flex items-center gap-1.5 px-2.5 py-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg text-label-md transition-colors">
                                <span className="material-symbols-outlined text-headline-md">person</span>
                                <span className="hidden xl:inline text-label-md font-semibold truncate max-w-25">
                                    {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                                </span>
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className="flex items-center justify-center p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg text-label-md transition-colors">
                            <span className="material-symbols-outlined text-headline-md">person</span>
                            <span className="hidden xl:inline text-label-md font-semibold">Entrar</span>
                        </button>
                    )}
                    
                    {/* Wishlist */}
                    <button onClick={() => setFavoritesOpen(true)} aria-label="Favoritos" className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors">
                        <span className={cn("material-symbols-outlined text-headline-md", isMounted && favoriteIds.length > 0 ? "text-error material-symbols-fill" : "")}>favorite</span>
                        {isMounted && favoriteIds.length > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
                                {favoriteIds.length}
                            </span>
                        )}
                    </button>
                    
                    {/* Shopping Cart */}
                    <button onClick={() => setCartOpen(true)} aria-label="Carrito de compras" className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors active:scale-90">
                        <span className="material-symbols-outlined text-headline-md">shopping_cart</span>
                        {isMounted && totalItems > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                {totalItems}
                            </span>
                        )}
                    </button>
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
                            className="fixed inset-0 bg-on-surface/40 z-50 backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="fixed top-0 left-0 bottom-0 w-80 bg-surface text-on-surface z-50 shadow-2xl flex flex-col border-r border-outline-variant"
                        >
                            <div className="p-6 flex justify-between items-center border-b border-outline-variant">
                                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold tracking-tight text-primary flex items-center gap-1">
                                    <span className="material-symbols-outlined text-primary material-symbols-fill">layers</span>
                                    pfstudio
                                </Link>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-surface-container rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-on-surface-variant" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                                <div className="space-y-2">
                                    <div className="px-4 py-2 text-xs font-bold text-secondary uppercase tracking-widest">
                                        Navegación
                                    </div>
                                    <Link href="#catalogo" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-4 rounded-xl flex items-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors font-medium">
                                        Catálogo
                                    </Link>
                                    <Link href="#personalizador" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-4 rounded-xl flex items-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors font-medium">
                                        Diseñá tu Producto
                                    </Link>
                                    <Link href="#insumos" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-4 rounded-xl flex items-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors font-medium">
                                        Insumos
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Mobile User Profile Footer */}
                            <div className="p-6 border-t border-outline-variant bg-surface-container-low flex flex-col gap-4">
                                {isInitialized && user ? (
                                    <>
                                        <p className="text-xs text-on-surface font-bold text-center truncate px-2">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                                        <p className="text-[10px] text-on-surface-variant text-center truncate px-2 -mt-3">{user.email}</p>
                                        {isAdmin ? (
                                            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-2.5 bg-primary text-on-primary hover:bg-primary/90 transition-colors rounded-xl text-xs font-bold tracking-wider flex items-center justify-center gap-2 uppercase">
                                                <LayoutDashboard className="w-4 h-4" /> Panel Admin
                                            </Link>
                                        ) : (
                                            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-2.5 border border-outline-variant text-on-surface hover:bg-surface-container transition-colors rounded-xl text-xs font-bold tracking-wider flex items-center justify-center gap-2 uppercase">
                                                <User className="w-4 h-4" /> Mi Perfil
                                            </Link>
                                        )}
                                        <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full py-2.5 border border-error/30 text-error hover:bg-error hover:text-on-error transition-all rounded-xl text-xs font-bold tracking-wider flex items-center justify-center gap-2 uppercase">
                                            <LogOut className="w-4 h-4" /> Cerrar Sesión
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => { setIsMobileMenuOpen(false); setModalOpen(true); }} className="w-full py-3 bg-primary hover:bg-primary/90 text-on-primary transition-colors rounded-xl text-sm font-bold tracking-wide uppercase">
                                        Iniciar Sesión
                                    </button>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <CartSidebar />
            <FavoritesSidebar />

            {/* Logout Loading Screen */}
            <ProcessingOverlay
                isOpen={isLoggingOut}
                type="auth"
                title="Cerrando Sesión..."
                subtitle="Hasta pronto."
            />
        </header>
    );
}
