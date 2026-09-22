import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CatalogProductCard from "./CatalogProductCard";
import { Product } from "@/types/product";

export default async function FeaturedProducts() {
    let products: Product[] = [];
    
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase
            .from('products')
            .select('*, product_stock(size, stock_quantity)')
            .limit(4);

        if (error) throw error;
        if (data) {
            products = data as Product[];
        }
    } catch (error) {
        console.error('Error fetching featured products:', error);
    }


    return (
        <section id="remeras" className="py-space-xl bg-surface border-b border-outline-variant">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto flex flex-col gap-space-lg">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
                    <div>
                        <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-secondary">Tendencias de la Semana</span>
                        <h2 className="text-headline-lg font-headline-lg text-on-surface mt-1">Remeras & Prendas Destacadas</h2>
                        <p className="text-body-md font-body-md text-on-surface-variant">Oversize, Boxy Fit y cortes clásicos confeccionados con tejidos de calidad certificada.</p>
                    </div>
                    <Link href="/catalog">
                        <span className="text-label-md font-label-md font-medium text-secondary bg-surface-container hover:bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant self-start sm:self-auto cursor-pointer transition-colors">
                            Ver Todo el Catálogo
                        </span>
                    </Link>
                </div>
                
                {/* 4-Column Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
                    {products.length > 0 ? (
                        products.map(product => (
                            <CatalogProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-12 text-center bg-surface-container-low rounded-xl border border-outline-variant border-dashed">
                            <p className="text-body-lg text-on-surface-variant">No hay productos destacados disponibles en este momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

