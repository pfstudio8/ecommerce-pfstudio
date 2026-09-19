"use client";

import Link from "next/link";
import Image from "next/image";

export default function CustomStudioHero() {
    return (
        <section className="py-space-xl bg-surface-container-low border-b border-outline-variant relative overflow-hidden">
            <div className="absolute inset-0 custom-grid-pattern opacity-60 pointer-events-none"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-200 h-200 bg-tertiary-fixed/20 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="w-full px-margin-desktop max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-tertiary-fixed px-3 py-1 rounded-full mb-space-md">
                            <span className="material-symbols-outlined text-on-tertiary-fixed text-label-md material-symbols-fill">auto_fix_high</span>
                            <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-tertiary-fixed font-bold">Pfstudio Custom</span>
                        </div>
                        <h2 className="text-display-lg font-display-lg text-on-surface leading-tight mb-space-sm">
                            Tu marca, tu estilo.<br />
                            <span className="text-tertiary">Sin mínimos de compra.</span>
                        </h2>
                        <p className="text-body-lg font-body-lg text-on-surface-variant max-w-lg mb-space-lg">
                            Utilizá nuestro Custom Studio 2D/3D para estampar tus diseños en remeras, gorras, tazas y más. Vista previa en tiempo real y calidad fotográfica.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-space-sm">
                            <button className="inline-flex justify-center items-center gap-2 px-space-lg py-3 bg-on-surface text-surface font-headline-sm text-headline-sm rounded-lg shadow-sm hover:bg-on-surface-variant transition-colors active:scale-95">
                                <span className="material-symbols-outlined text-headline-sm">upload_file</span>
                                Subir mi Diseño
                            </button>
                            <button className="inline-flex justify-center items-center gap-2 px-space-lg py-3 bg-surface-container text-on-surface font-headline-sm text-headline-sm rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors active:scale-95">
                                <span className="material-symbols-outlined text-headline-sm">brush</span>
                                Usar Plantillas
                            </button>
                        </div>
                        
                        <div className="mt-space-lg flex items-center gap-space-md">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-[10px]">🎨</div>
                                <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-[10px]">✨</div>
                                <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-[10px]">🔥</div>
                            </div>
                            <p className="text-label-sm font-label-sm text-on-surface-variant">Más de 5.000 prendas personalizadas entregadas</p>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="aspect-square sm:aspect-video lg:aspect-square bg-surface-container-highest rounded-2xl border border-outline-variant p-4 shadow-sm relative overflow-hidden group">
                            <Image 
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover rounded-xl" 
                                alt="A person wearing a custom printed white t-shirt facing back" 
                                src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop"
                            />
                            
                            {/* Floating UI Elements indicating a "Customizer" interface */}
                            <div className="absolute top-8 left-8 bg-surface/90 backdrop-blur-md p-3 rounded-lg border border-outline-variant shadow-lg animate-pulseLogo">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-[16px]">format_color_fill</span>
                                    <span className="text-label-sm font-label-sm font-bold">Color Base</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-5 h-5 rounded-full bg-black border border-outline-variant"></div>
                                    <div className="w-5 h-5 rounded-full bg-white border border-outline-variant shadow-sm ring-2 ring-primary ring-offset-1"></div>
                                    <div className="w-5 h-5 rounded-full bg-stone-300 border border-outline-variant"></div>
                                </div>
                            </div>
                            
                            <div className="absolute bottom-8 right-8 bg-surface/90 backdrop-blur-md p-3 rounded-lg border border-outline-variant shadow-lg animate-slideInRight" style={{ animationDelay: '0.5s'}}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-tertiary text-[16px]">photo_camera</span>
                                    <span className="text-label-sm font-label-sm font-bold">Logo Frontal</span>
                                </div>
                                <div className="w-24 h-12 border-2 border-dashed border-outline-variant rounded flex items-center justify-center bg-surface-container-lowest">
                                    <span className="text-[10px] text-outline font-bold">LOGO.PNG</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
