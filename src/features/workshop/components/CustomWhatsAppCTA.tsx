"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Sparkles, Shirt, Award, Send, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CustomWhatsAppCTA() {
    const [whatsapp, setWhatsapp] = useState("5493704245651");

    useEffect(() => {
        const fetchStoreInfo = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'store_info')
                    .single();

                if (data?.value?.whatsapp) {
                    setWhatsapp(data.value.whatsapp);
                }
            } catch (err) {
                // Ignore fallback
            }
        };

        fetchStoreInfo();
    }, []);

    const handleWhatsAppClick = () => {
        const message = encodeURIComponent(
            "¡Hola PFSTUDIO! 👋 Quiero consultar por un diseño o producto personalizado para sublimar. ¿Cómo coordinamos?"
        );
        window.open(`https://wa.me/${whatsapp}?text=${message}`, "_blank");
    };

    return (
        <section id="personalizados" className="py-20 bg-surface border-b border-outline-variant relative overflow-hidden">
            <div className="absolute inset-0 custom-grid-pattern opacity-30 pointer-events-none"></div>

            <div className="w-full px-margin-desktop max-w-7xl mx-auto relative z-10">
                <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-8 md:p-14 shadow-xl overflow-hidden relative">
                    {/* Decorative Background Glow */}
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-tertiary-fixed/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Left Column: Text & Features */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full border border-outline-variant">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                                    Taller de Sublimación & Estampado a Medida
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tight leading-tight font-sans">
                                ¿Buscás un diseño único o personalizado?
                            </h2>

                            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed max-w-2xl">
                                Estampamos tus propias ilustraciones, fotos, logos de empresa o marcas sobre cualquiera de nuestros insumos: 
                                <strong> Remeras Boxy Fit y Oversize, Tazas mágicas, Chopps, Llaveros, Gorras y Vasos térmicos</strong>.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-on-surface-variant font-medium">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                    <span>Sublimación HD resistente al lavado</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                    <span>Precios especiales por cantidad / mayoristas</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                    <span>Asesoramiento y muestra digital previa</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                    <span>Despachos a todo el país en 24-48 hs</span>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="bg-[#25D366] hover:bg-[#20ba59] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-xs md:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#25D366]/20 active:scale-95"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Consultá por WhatsApp
                                </button>
                                <span className="text-xs text-outline text-center sm:text-left">
                                    Te respondemos de inmediato con presupuesto y mockup.
                                </span>
                            </div>
                        </div>

                        {/* Right Column: Visual Showcase Card */}
                        <div className="lg:col-span-5">
                            <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-5 shadow-sm">
                                <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-outline">
                                        Proceso de Personalización
                                    </span>
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container border border-primary">
                                        Fácil y Rápido
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-outline-variant">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-on-surface">Elegí tu insumo o prenda</h4>
                                            <p className="text-xs text-outline mt-0.5">Remeras, gorras, tazas, llaveros o botineros.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-outline-variant">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-on-surface">Envianos tu idea o archivo</h4>
                                            <p className="text-xs text-outline mt-0.5">Por WhatsApp en formato imagen, PDF o vector.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-outline-variant">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-on-surface">Aprobás el diseño y estampamos</h4>
                                            <p className="text-xs text-outline mt-0.5">Te enviamos foto previa antes de confeccionar y despachar.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-outline-variant flex items-center justify-between text-xs text-secondary font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                        Garantía de calidad
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-primary" />
                                        Entregas coordinadas
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

