"use client";

import { Instagram, Facebook, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Footer() {
    const [settings, setSettings] = useState({ instagram: "pfstudio", email: "hola@pfstudio.com" });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'store_info')
                    .single();

                if (data?.value) {
                    setSettings({
                        instagram: data.value.instagram?.replace('@', '') || "pfstudio",
                        email: data.value.email || "hola@pfstudio.com"
                    });
                }
            } catch (err) { }
        };
        fetchSettings();
    }, []);
    return (
        <footer className="bg-[var(--background)] text-[var(--foreground)] border-t border-zinc-800 flex flex-col items-center overflow-hidden">
            {/* Infinite Marquee Banner */}
            <div className="w-full bg-[var(--foreground)] text-[var(--background)] py-4 overflow-hidden flex relative z-10 border-b border-black/10 dark:border-white/10">
                <motion.div
                    initial={{ x: "0%" }}
                    animate={{ x: "-50%" }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
                    className="flex whitespace-nowrap items-center font-bold uppercase tracking-widest text-sm"
                >
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <span className="mx-6">ENVÍOS A TODO EL PAÍS</span>
                            <span className="mx-6 text-[var(--color-main)]">✦</span>
                            <span className="mx-6">CALIDAD PREMIUM</span>
                            <span className="mx-6 text-[var(--color-main)]">✦</span>
                            <span className="mx-6">DISEÑOS EXCLUSIVOS</span>
                            <span className="mx-6 text-[var(--color-main)]">✦</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 py-16 w-full relative z-20 bg-[var(--background)]">

                {/* Brand */}
                <div className="col-span-1 md:col-span-2">
                    <h2 className="text-3xl font-black tracking-[0.1em] mb-4">PFSTUDIO</h2>
                    <p className="text-gray-400 max-w-sm mb-6">
                        Ropa de alta calidad diseñada para la comodidad diaria sin sacrificar el estilo más actual.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://www.instagram.com/pfstudio8/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[var(--color-main)] hover:border-transparent transition-colors">
                            <Instagram className="w-5 h-5 text-current" />
                        </a>
                        <a href="https://www.facebook.com/share/17MNa5si9S/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[var(--color-main)] hover:border-transparent transition-colors">
                            <Facebook className="w-5 h-5 text-current" />
                        </a>
                        <a href={`mailto:${settings.email}`} className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[var(--color-main)] hover:border-transparent transition-colors">
                            <Mail className="w-5 h-5 text-current" />
                        </a>
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Enlaces Útiles</h3>
                    <ul className="flex flex-col gap-3 text-gray-400">
                        <li><a href="/" className="hover:text-white transition-colors">Inicio</a></li>
                        <li><a href="/#productos" className="hover:text-white transition-colors">Productos</a></li>
                        <li><a href="/#quienes-somos" className="hover:text-white transition-colors">Quiénes Somos</a></li>
                        <li><a href="/contacto" className="hover:text-white transition-colors">Contacto</a></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Legal</h3>
                    <ul className="flex flex-col gap-3 text-gray-400">
                        <li><a href="/" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
                        <li><a href="/" className="hover:text-white transition-colors">Políticas de Privacidad</a></li>
                        <li><a href="/" className="hover:text-white transition-colors">Cambios y Devoluciones</a></li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p>© 2026 PFSTUDIO — Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}
