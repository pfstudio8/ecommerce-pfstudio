"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Footer() {
    const [storeInfo, setStoreInfo] = useState({
        whatsapp: "5493704724837",
        email: "hola@pfstudio.com.ar",
        instagram: "pfstudio.ok"
    });

    useEffect(() => {
        const fetchStoreInfo = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'store_info')
                    .single();
                if (data?.value) {
                    setStoreInfo(prev => ({ ...prev, ...data.value }));
                }
            } catch (error) {
                // Silently fallback to defaults
            }
        };
        fetchStoreInfo();
    }, []);

    const shopLinks = [
        { href: "/catalog", label: "Catálogo" },
        { href: "/#personalizados", label: "Pedidos Personalizados" },
        { href: "/size-guide", label: "Guía de Talles" },
        { href: "/#comunidad", label: "Comunidad" },
    ];

    const helpLinks = [
        { href: "/contact", label: "Contacto" },
        { href: "/faq", label: "Preguntas Frecuentes" },
        { href: "/profile", label: "Mis Pedidos" },
    ];

    return (
        <footer className="bg-surface-container-low border-t border-outline-variant/40 pt-14 pb-8 mt-auto">
            <div className="w-full px-margin md:px-gutter-desktop max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

                    {/* Marca */}
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="text-lg font-extrabold tracking-tight text-primary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-primary material-symbols-fill">layers</span>
                            pfstudio
                        </Link>
                        <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
                            Taller integral de estampado y sublimación. Confección propia de indumentaria Premium y Boxy Fit en Argentina.
                        </p>
                    </div>

                    {/* Tienda */}
                    <div>
                        <h4 className="text-sm font-bold text-on-surface mb-4">Tienda</h4>
                        <ul className="space-y-2.5">
                            {shopLinks.map(link => (
                                <li key={link.href + link.label}>
                                    <Link href={link.href} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Ayuda */}
                    <div>
                        <h4 className="text-sm font-bold text-on-surface mb-4">Ayuda</h4>
                        <ul className="space-y-2.5">
                            {helpLinks.map(link => (
                                <li key={link.href + link.label}>
                                    <Link href={link.href} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 className="text-sm font-bold text-on-surface mb-4">Contacto</h4>
                        <ul className="space-y-2.5">
                            <li>
                                <a href={`mailto:${storeInfo.email}`} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                                    {storeInfo.email}
                                </a>
                            </li>
                            {storeInfo.instagram && (
                                <li>
                                    <a href={`https://instagram.com/${storeInfo.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                                        @{storeInfo.instagram.replace('@', '')}
                                    </a>
                                </li>
                            )}
                            {storeInfo.whatsapp && (
                                <li>
                                    <a href={`https://wa.me/${storeInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                                        WhatsApp Soporte
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Barra inferior */}
                <div className="pt-6 border-t border-outline-variant/40 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-outline">
                        &copy; {new Date().getFullYear()} PFSTUDIO. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/terms-of-use" className="text-xs text-outline hover:text-on-surface transition-colors">Términos de Uso</Link>
                        <Link href="/privacy" className="text-xs text-outline hover:text-on-surface transition-colors">Privacidad</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
