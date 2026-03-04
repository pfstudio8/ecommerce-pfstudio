"use client";

import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[var(--background)] text-[var(--foreground)] py-16 border-t border-zinc-800">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand */}
                <div className="col-span-1 md:col-span-2">
                    <h2 className="text-3xl font-black tracking-[0.1em] mb-4">PFSTUDIO</h2>
                    <p className="text-gray-400 max-w-sm mb-6">
                        Ropa de alta calidad diseñada para la comodidad diaria sin sacrificar el estilo más actual.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[var(--color-main)] hover:border-transparent transition-colors">
                            <Instagram className="w-5 h-5 text-current" />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[var(--color-main)] hover:border-transparent transition-colors">
                            <Facebook className="w-5 h-5 text-current" />
                        </a>
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Enlaces Útiles</h3>
                    <ul className="flex flex-col gap-3 text-gray-400">
                        <li><a href="/" className="hover:text-white transition-colors">Inicio</a></li>
                        <li><a href="/#productos" className="hover:text-white transition-colors">Productos</a></li>
                        <li><a href="/" className="hover:text-white transition-colors">Quiénes Somos</a></li>
                        <li><a href="mailto:hola@pfstudio.com" className="hover:text-white transition-colors">Contacto</a></li>
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
