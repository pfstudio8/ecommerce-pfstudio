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

            <div className="container mx-auto px-6 md:px-8 max-w-[1400px] grid grid-cols-1 md:grid-cols-2 gap-12 py-16 w-full relative z-20 bg-[var(--background)]">

                {/* Brand */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-3xl font-black tracking-[0.1em] mb-2">PFSTUDIO</h2>
                    <p className="text-gray-400 text-sm max-w-xs mb-4">
                        Curaduría digital de ropa oversize y clásica. Elevando lo esencial a través del minimalismo estructural.
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

                {/* Grid for Links */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Links */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Enlaces</h3>
                        <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Inicio</a>
                        <a href="/#productos" className="text-gray-400 hover:text-white transition-colors text-sm">Productos</a>
                        <a href="/#quienes-somos" className="text-gray-400 hover:text-white transition-colors text-sm">Quiénes Somos</a>
                        <a href="/contacto" className="text-gray-400 hover:text-white transition-colors text-sm">Contacto</a>
                    </div>

                    {/* Legal */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Legal & Info</h3>
                        <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Términos y Condiciones</a>
                        <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Políticas de Privacidad</a>
                        <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Envíos y Devoluciones</a>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 md:px-8 max-w-[1400px] border-t border-gray-800 py-8 text-left text-gray-500 text-sm">
                <p>© 2026 PFSTUDIO. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}
