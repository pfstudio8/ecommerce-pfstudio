import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (!product) {
        return {
            title: 'Producto no encontrado | PFSTUDIO'
        };
    }

    return {
        title: `${product.name} | PFSTUDIO`,
        description: product.description || `Comprá ${product.name} al mejor precio en PFSTUDIO.`,
        openGraph: {
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        }
    };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch product with variants from product_stock, ensuring active
    const { data: product, error } = await supabase
        .from('products')
        .select('*, product_stock(*)')
        .eq('id', id)
        .eq('active', true)
        .single();

    if (error || !product) {
        notFound();
    }

    // Fetch related active products from same category
    const { data: relatedProducts } = await supabase
        .from('products')
        .select('*, product_stock(*)')
        .eq('category', product.category)
        .eq('active', true)
        .neq('id', id)
        .limit(4);

    return <ProductClient product={product} relatedProducts={relatedProducts || []} />;
}
