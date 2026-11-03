"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface DBCategory {
    name: string;
    description?: string;
    productCount?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
    "Oversize": "styler",
    "Boxy Fit": "checkroom",
    "Clásicas": "apparel",
    "Llaveros": "key",
    "Gorras": "explore",
    "Tazas": "local_cafe",
    "Vasos": "water_bottle",
    "Buzos": "dry_cleaning",
    "Pantalones": "styler",
    "Shorts": "styler",
    "Botineros": "sports_soccer",
    "Camisetas": "sports_jersey",
    "Encendedores": "local_fire_department",
    "Accesorios": "shopping_bag"
};

export default function CategoryExplore() {
    const [categories, setCategories] = useState<DBCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // 1. Fetch from categories table
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('name, description')
                    .order('name');

                // 2. Fetch active products to count per category
                const { data: prodData } = await supabase
                    .from('products')
                    .select('category')
                    .eq('active', true);

                const counts: Record<string, number> = {};
                (prodData || []).forEach(p => {
                    if (p.category) {
                        counts[p.category] = (counts[p.category] || 0) + 1;
                    }
                });

                if (catData && catData.length > 0) {
                    const mapped = catData.map(c => ({
                        name: c.name,
                        description: c.description || "Insumos y confecciones personalizadas.",
                        productCount: counts[c.name] || 0
                    }));
                    setCategories(mapped);
                } else {
                    // Fallback to distinct product categories if categories table is empty
                    const distinctCats = Object.keys(counts).map(name => ({
                        name,
                        description: "Artículos disponibles en taller.",
                        productCount: counts[name]
                    }));
                    setCategories(distinctCats);
                }
            } catch (err) {
                console.warn("Error fetching categories in explore section:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

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
                    <div>
                        <Link href="/catalog" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
                            Ver catálogo completo
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                </div>
                
                {/* Dynamic Bento Grid from Database */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
                    {categories.slice(0, 5).map((category, index) => {
                        const icon = CATEGORY_ICONS[category.name] || "category";
                        const isFirst = index === 0;

                        return (
                            <Link 
                                key={category.name}
                                href={`/catalog?cat=${encodeURIComponent(category.name)}`} 
                                className="relative rounded-2xl overflow-hidden group shadow-sm border border-outline-variant p-space-md flex flex-col justify-between hover:border-primary transition-all duration-200 hover:shadow-md bg-surface-container-lowest"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                            <span className="material-symbols-outlined text-headline-md">{icon}</span>
                                        </div>
                                        {isFirst ? (
                                            <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-primary-fixed text-on-primary-fixed font-bold">
                                                DESTACADO
                                            </span>
                                        ) : category.productCount !== undefined && category.productCount > 0 ? (
                                            <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-bold">
                                                {category.productCount} {category.productCount === 1 ? 'modelo' : 'modelos'}
                                            </span>
                                        ) : null}
                                    </div>
                                    <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors font-bold">
                                        {category.name}
                                    </h3>
                                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                                        {category.description}
                                    </p>
                                </div>
                                <div className="mt-6 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-secondary">
                                    <span className="text-label-sm font-label-sm font-medium">Ver opciones</span>
                                    <span className="material-symbols-outlined text-headline-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </div>
                            </Link>
                        );
                    })}
                    
                    {/* Bento Box: Diseños Personalizados */}
                    <Link href="#personalizados" className="group relative bg-surface-container-high border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-primary transition-all duration-200 hover:shadow-md">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-headline-md material-symbols-fill">chat</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-[#25D366]/20 text-[#25D366] font-bold">A MEDIDA</span>
                            </div>
                            <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors font-bold">Diseños Personalizados</h3>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Envianos tus ilustraciones, logos o fotos por WhatsApp y te armamos la muestra previa sin cargo.</p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-[#25D366]">
                            <span className="text-label-sm font-label-sm font-bold">Consultá por WhatsApp</span>
                            <span className="material-symbols-outlined text-headline-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
