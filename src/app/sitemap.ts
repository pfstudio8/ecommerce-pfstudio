import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// Production URL (Update this when deploying to the real domain)
const URL = 'https://pfstudio.com.ar';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base routes
    const routes = [
        {
            url: `${URL}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${URL}/perfil`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        },
    ];

    // Fetch all products to add them to the sitemap dynamically
    try {
        const { data: products } = await supabase.from('products').select('id, updated_at');

        if (products) {
            const productRoutes = products.map((product) => ({
                url: `${URL}/producto/${product.id}`,
                lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));

            return [...routes, ...productRoutes];
        }
    } catch (error) {
        console.error('Error generating sitemap for products:', error);
    }

    return routes;
}
