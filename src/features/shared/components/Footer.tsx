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

    return (
        <footer className="bg-surface-container-lowest border-t border-outline-variant pt-space-xl pb-space-lg">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl mb-space-xl">
                
                {/* Brand Column */}
                <div className="flex flex-col gap-space-sm">
                    <Link href="/" className="text-headline-lg font-headline-lg font-bold tracking-tight text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary material-symbols-fill">layers</span>
                        pfstudio
                    </Link>
                    <p className="text-body-sm font-body-sm text-on-surface-variant max-w-xs mt-2">
                        Taller integral de estampado y sublimación. Confección propia de indumentaria Premium y Boxy Fit en Argentina.
                    </p>
                </div>
                
                {/* Explore Column */}
                <div>
                    <h4 className="text-headline-sm font-headline-sm font-bold text-on-surface mb-space-sm">Catálogo</h4>
                    <ul className="space-y-2">
                        <li><Link href="/?cat=Remeras" className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors">Remeras & Prendas</Link></li>
                        <li><Link href="/?cat=Gorras" className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors">Gorras Exclusivas</Link></li>

                        <li><Link href="/?cat=Accesorios" className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors">Accesorios & Regalos</Link></li>
                    </ul>
                </div>
                
                {/* Services Column */}
                <div>
                    <h4 className="text-headline-sm font-headline-sm font-bold text-on-surface mb-space-sm">Servicios</h4>
                    <ul className="space-y-2">
                        <li><Link href="#personalizador" className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors">Custom Studio</Link></li>
                        <li><Link href="/size-guide" className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors">Guía de Talles</Link></li>
                        <li><Link href="/faq" className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors">Preguntas Frecuentes</Link></li>
                    </ul>
                </div>
                
                {/* Contact Column */}
                <div>
                    <h4 className="text-headline-sm font-headline-sm font-bold text-on-surface mb-space-sm">Contacto</h4>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-body-sm font-body-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            Buenos Aires, Argentina (Envíos a todo el país)
                        </li>
                        <li className="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                            <a href={`mailto:${storeInfo.email}`} className="hover:text-primary transition-colors">{storeInfo.email}</a>
                        </li>
                        {storeInfo.instagram && (
                            <li className="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                <a href={`https://instagram.com/${storeInfo.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">@{storeInfo.instagram.replace('@', '')}</a>
                            </li>
                        )}
                        {storeInfo.whatsapp && (
                            <li className="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-[18px]">phone</span>
                                <a href={`https://wa.me/${storeInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp Soporte</a>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="w-full px-margin-desktop max-w-7xl mx-auto pt-space-md border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-label-sm font-label-sm text-outline">
                    &copy; {new Date().getFullYear()} PFSTUDIO. Todos los derechos reservados.
                </p>
                <div className="flex items-center gap-4">
                    <Link href="/terms-of-use" className="text-outline hover:text-on-surface transition-colors">Términos de Uso</Link>
                    <Link href="/privacy" className="text-outline hover:text-on-surface transition-colors">Privacidad</Link>
                </div>
            </div>
        </footer>
    );
}
