"use client";

import Link from "next/link";

export default function CategoryExplore() {
    return (
        <section id="catalogo" className="py-space-xl bg-surface border-b border-outline-variant">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto flex flex-col gap-space-lg">
                {/* Header & Category Intro */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-primary">Colecciones pfstudio</span>
                        </div>
                        <h2 className="text-headline-lg font-headline-lg text-on-surface mt-1">Explorá por Categoría</h2>
                        <p className="text-body-md font-body-md text-on-surface-variant">Encontrá el corte y el estilo perfecto para tu outfit diario o creá tu prenda personalizada desde cero.</p>
                    </div>
                    <div className="flex items-center gap-space-sm overflow-x-auto pb-1 custom-scrollbar w-full md:w-auto">
                        <span className="text-body-sm font-body-sm text-on-surface-variant shrink-0">Filtrar vista:</span>
                        <button className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-label-md font-label-md shrink-0">Todos</button>
                        <button className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container rounded-lg text-label-md font-label-md text-on-surface-variant shrink-0">Prendas</button>
                        <button className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container rounded-lg text-label-md font-label-md text-on-surface-variant shrink-0">Accesorios</button>
                    </div>
                </div>
                
                {/* 5-Card Interactive Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
                    {/* Bento Box 1: Remeras Oversize (Large) */}
                    <Link href="/catalog?cat=Oversize" className="relative rounded-2xl overflow-hidden group shadow-sm border border-outline-variant p-space-md flex flex-col justify-between hover:border-primary transition-all duration-200 hover:shadow-md bg-surface-container-lowest">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                    <span className="material-symbols-outlined text-headline-md">styler</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-primary-fixed text-on-primary-fixed">POPULAR</span>
                            </div>
                            <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors">Remeras Oversize</h3>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Oversize, Boxy Fit y cortes clásicos de alto gramaje.</p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-secondary">
                            <span className="text-label-sm font-label-sm font-medium">Ver opciones</span>
                            <span className="material-symbols-outlined text-headline-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </Link>
                    
                    {/* Bento Box 2: Llaveros Custom (Small) */}
                    <Link href="/catalog?cat=Llaveros" className="relative rounded-2xl overflow-hidden group shadow-sm border border-outline-variant p-space-md flex flex-col justify-between hover:border-primary transition-all duration-200 hover:shadow-md bg-surface-container-lowest">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                    <span className="material-symbols-outlined text-headline-md">key</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-tertiary-fixed text-on-tertiary-fixed">NUEVO</span>
                            </div>
                            <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors">Llaveros Custom</h3>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Círculo, corazón, camiseta y credencial reforzada.</p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-secondary">
                            <span className="text-label-sm font-label-sm font-medium">Personalizar 2D</span>
                            <span className="material-symbols-outlined text-headline-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </Link>
                    
                    {/* Category 3: Camisetas & Deportivas */}
                    <Link href="/catalog?cat=Camisetas" className="group relative bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-primary transition-all duration-200 hover:shadow-md">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                    <span className="material-symbols-outlined text-headline-md">sports_soccer</span>
                                </div>
                            </div>
                            <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors">Camisetas</h3>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Línea deportiva, conjuntos de fútbol y street style.</p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-secondary">
                            <span className="text-label-sm font-label-sm font-medium">Ver opciones</span>
                            <span className="material-symbols-outlined text-headline-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </Link>
                    
                    {/* Category 4: Gorras & Caps */}
                    <Link href="/catalog?cat=Gorras" className="group relative bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-primary transition-all duration-200 hover:shadow-md">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                    <span className="material-symbols-outlined text-headline-md">explore</span>
                                </div>
                            </div>
                            <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors">Gorras & Caps</h3>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Trucker, gabardina y caps con parches sublimados.</p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-secondary">
                            <span className="text-label-sm font-label-sm font-medium">Ver opciones</span>
                            <span className="material-symbols-outlined text-headline-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </Link>
                    
                    {/* Category 5: Tazas y Chopps */}
                    <Link href="/catalog?cat=Tazas" className="group relative bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-primary transition-all duration-200 hover:shadow-md">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                    <span className="material-symbols-outlined text-headline-md">local_cafe</span>
                                </div>
                            </div>
                            <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors">Tazas & Chopps</h3>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Mágicas, cerámicas y chopps cerveceros sublimados.</p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-secondary">
                            <span className="text-label-sm font-label-sm font-medium">Ver opciones</span>
                            <span className="material-symbols-outlined text-headline-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </Link>
                    
                    {/* Category 6: Custom Studio 2D/3D */}
                    <Link href="#personalizador" className="group relative bg-surface-container-high border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-tertiary transition-all duration-200 hover:shadow-md">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                                    <span className="material-symbols-outlined text-headline-md material-symbols-fill">palette</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-error-container text-on-error-container font-bold">CUSTOM 2D/3D</span>
                            </div>
                            <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-tertiary transition-colors">Custom Studio</h3>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Subí tus ilustraciones, logos o fotos con render inmediato.</p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-tertiary">
                            <span className="text-label-sm font-label-sm font-bold">Abrir Editor</span>
                            <span className="material-symbols-outlined text-headline-sm group-hover:translate-x-1 transition-transform">brush</span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
