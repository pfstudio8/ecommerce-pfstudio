import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CatalogProductCard from "./CatalogProductCard";
import { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";

export default async function FeaturedProducts() {
    let products: Product[] = [];
    
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
        
            const { data, error } = await supabase
                .from('products')
                .select('*, product_stock(size, stock_quantity)')
                .eq('active', true)
                .limit(4);

            if (error) throw error;
            if (data) {
                products = data as Product[];
            }
        }
    } catch (error) {
        console.error('Error fetching featured products:', error);
    }

    return (
        <section id="remeras" className="py-16 md:py-20 bg-surface border-b border-outline-variant">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary">Selección Exclusiva</span>
                        <h2 className="text-2xl sm:text-3xl font-black text-on-surface mt-1">Prendas Destacadas</h2>
                        <p className="text-sm text-on-surface-variant mt-1">
                            Prendas confeccionadas con hilado peinado 24/1 y molderías urbanas estructuradas.
                        </p>
                    </div>
                    <Link 
                        href="/catalog"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:opacity-80 transition-opacity"
                    >
                        <span>Ver catálogo completo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
                
                {/* 4-Column Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.length > 0 ? (
                        products.map(product => (
                            <CatalogProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant border-dashed">
                            <p className="text-sm text-on-surface-variant">No hay productos destacados disponibles en este momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
