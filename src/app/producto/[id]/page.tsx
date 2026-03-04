import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;

    // Fetch product
    const { data: product } = await supabase.from('products').select('*').eq('id', id).single();

    if (!product) {
        return {
            title: 'Producto no encontrado | PFSTUDIO'
        };
    }

    return {
        title: `${product.name} | PFSTUDIO`,
        description: `Comprá ${product.name} al mejor precio en PFSTUDIO.`,
        openGraph: {
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        }
    };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch product
    const { data: product } = await supabase.from('products').select('*').eq('id', id).single();

    if (!product) {
        notFound();
    }

    // Fetch related products (same category, excluding current product)
    const { data: relatedProducts } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .neq('id', id)
        .limit(4);

    return <ProductClient product={product} relatedProducts={relatedProducts || []} />;
}
