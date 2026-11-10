import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CatalogProductCard from "./CatalogProductCard";
import { Product } from "@/types/product";
import { ArrowRight, Sparkles } from "lucide-react";
import { isSupabaseConfigured } from "@/utils/supabase/config";

const DEFAULT_FEATURED_PRODUCTS: Product[] = [
    {
        id: "remera-boxy-heavy",
        name: "Remera Boxy Fit Heavyweight 24/1",
        category: "Boxy Fit",
        price: 18500,
        description: "Algodón 100% peinado 24/1 con cuello rib grueso de 3 cm y hombros caídos estructurados.",
        image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
        isNew: true,
        active: true,
        stock: 35,
        product_stock: [
            { size: "S", stock_quantity: 8 },
            { size: "M", stock_quantity: 12 },
            { size: "L", stock_quantity: 10 },
            { size: "XL", stock_quantity: 5 }
        ]
    },
    {
        id: "remera-marfil-oversize",
        name: "Remera Classic Fit Peinado Marfil",
        category: "Remeras",
        price: 16500,
        description: "Tono crudo / marfil con hilado peinado suave al tacto y caída holgada.",
        image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
        active: true,
        stock: 28,
        product_stock: [
            { size: "S", stock_quantity: 6 },
            { size: "M", stock_quantity: 10 },
            { size: "L", stock_quantity: 8 },
            { size: "XL", stock_quantity: 4 }
        ]
    },
    {
        id: "jogger-rustico-taller",
        name: "Pantalón Jogger Rústico Pesado",
        category: "Conjuntos",
        price: 28000,
        description: "Frisa invisible premium con bolsillos profundos, puños rib y cordón de ajuste pesado al tono.",
        image_url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop",
        active: true,
        stock: 18,
        product_stock: [
            { size: "1 (S/M)", stock_quantity: 9 },
            { size: "2 (L/XL)", stock_quantity: 9 }
        ]
    },
    {
        id: "gorra-trucker-pf",
        name: "Gorra Trucker PFStudio Custom",
        category: "Gorras",
        price: 9500,
        description: "Frente acolchado de alta densidad con malla respirable. Ideal para bordado o DTF de alto impacto.",
        image_url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop",
        active: true,
        stock: 25,
        product_stock: [{ size: "Único", stock_quantity: 25 }]
    }
];

export default async function FeaturedProducts() {
    let products: Product[] = [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (isSupabaseConfigured(supabaseUrl, supabaseKey)) {
        try {
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { data, error } = await supabase
                .from('products')
                .select('*, product_stock(size, stock_quantity)')
                .eq('active', true)
                .limit(4);

            if (!error && data && data.length > 0) {
                products = data as Product[];
            } else if (error) {
                // Fallback si la relación product_stock aún no fue migrada
                const fallback = await supabase
                    .from('products')
                    .select('*')
                    .eq('active', true)
                    .limit(4);

                if (!fallback.error && fallback.data && fallback.data.length > 0) {
                    products = fallback.data as Product[];
                }
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.warn("No se pudieron obtener productos destacados:", msg);
        }
    }

    // Fallback asegurado para que la tienda siempre muestre las prendas clave
    if (products.length === 0) {
        products = DEFAULT_FEATURED_PRODUCTS;
    }

    return (
        <section id="remeras" className="py-16 md:py-24 bg-[#FFF4E2]/40 border-b border-[#472825]/10">
            <div className="w-full px-margin md:px-gutter-desktop max-w-7xl mx-auto flex flex-col gap-10">
                {/* Header editorial Wonder Theme */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#472825]/10 pb-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#454e15]" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#454e15]">
                                SELECCIÓN DEL TALLER // DESTACADOS
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-[#472825] tracking-tight">
                            Prendas de Colección
                        </h2>
                        <p className="text-sm text-[#472825]/70 max-w-xl">
                            Hilado peinado 24/1, caídas estructuradas streetwear y terminaciones de taller. Tocá cualquier prenda para abrir el panel de personalización.
                        </p>
                    </div>

                    <Link 
                        href="/catalog"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#472825] text-[#FFF4E2] text-xs font-black tracking-wider uppercase hover:bg-[#351c19] transition-all self-start sm:self-auto shadow-sm"
                    >
                        <span>Ver catálogo completo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Grid de 4 columnas de productos limpios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                    {products.map((product, idx) => (
                        <CatalogProductCard key={product.id} product={product} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
}
