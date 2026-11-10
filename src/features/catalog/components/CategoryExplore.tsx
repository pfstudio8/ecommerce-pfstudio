"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Shirt, Coffee, Key, MessageCircle, Layers } from "lucide-react";

interface DBCategory {
    name: string;
    description?: string;
    productCount?: number;
}

export default function CategoryExplore() {
    const [categories, setCategories] = useState<DBCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data: catData } = await supabase
                    .from('categories')
                    .select('name, description')
                    .order('name');

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
                        description: c.description || "Insumos y confecciones de producción local.",
                        productCount: counts[c.name] || 0
                    }));
                    setCategories(mapped);
                } else {
                    const distinctCats = Object.keys(counts).map(name => ({
                        name,
                        description: "Artículos listos para confeccionar y despachar.",
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

    const getCategoryIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes("remera") || lower.includes("oversize") || lower.includes("boxy") || lower.includes("buzo")) {
            return <Shirt className="w-5 h-5" />;
        }
        if (lower.includes("taza") || lower.includes("chopp") || lower.includes("vaso")) {
            return <Coffee className="w-5 h-5" />;
        }
        if (lower.includes("llavero")) {
            return <Key className="w-5 h-5" />;
        }
        return <Layers className="w-5 h-5" />;
    };

    return (
        <section id="catalogo" className="py-16 md:py-24 bg-surface">
            <div className="w-full px-margin md:px-gutter-desktop max-w-7xl mx-auto flex flex-col gap-10">
                {/* Encabezado de sección */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="eyebrow">Colecciones de Taller</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Explorá por categoría</h2>
                        <p className="text-sm text-on-surface-variant">Cortes oversize, siluetas streetwear e insumos sublimables.</p>
                    </div>
                    <Link 
                        href="/catalog" 
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all self-start sm:self-auto"
                    >
                        <span>Ver todo el catálogo</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categories.slice(0, 5).map((category, index) => {
                        const isFirst = index === 0;

                        return (
                            <Link 
                                key={category.name}
                                href={`/catalog?cat=${encodeURIComponent(category.name)}`} 
                                className="group relative rounded-2xl bg-surface-container-lowest p-6 flex flex-col justify-between shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                            {getCategoryIcon(category.name)}
                                        </div>
                                        {isFirst ? (
                                            <span className="px-3 py-1 rounded-full text-[11px] bg-primary/10 text-primary font-bold">
                                                Destacado
                                            </span>
                                        ) : category.productCount !== undefined && category.productCount > 0 ? (
                                            <span className="px-3 py-1 rounded-full text-[11px] bg-surface-container text-on-surface-variant font-semibold">
                                                {category.productCount} {category.productCount === 1 ? 'modelo' : 'modelos'}
                                            </span>
                                        ) : null}
                                    </div>
                                    <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">
                                        {category.description}
                                    </p>
                                </div>
                                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-primary">
                                    <span>Ver artículos</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}

                    {/* Tarjeta de pedidos personalizados */}
                    <Link 
                        href="#personalizados" 
                        className="group relative rounded-2xl bg-surface-container-lowest p-6 flex flex-col justify-between shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <div className="w-11 h-11 rounded-2xl bg-[#25D366]/12 text-[#25D366] flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <span className="px-3 py-1 rounded-full text-[11px] bg-[#25D366]/12 text-[#1faa53] font-bold">
                                    A medida
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-on-surface group-hover:text-[#1faa53] transition-colors">
                                Pedidos Personalizados
                            </h3>
                            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                                Elegí prenda, talle y estampa. Te armamos el mockup digital previo y coordinamos por WhatsApp.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#1faa53]">
                            <span>Cotizar por WhatsApp</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
