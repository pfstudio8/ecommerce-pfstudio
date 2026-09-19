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
        }
    ];

    try {
        const { data: products } = await supabase.from('products').select('id, updated_at');
        const { data: categories } = await supabase.from('categories').select('slug');

        let allRoutes = [...routes];

        if (categories) {
            const categoryRoutes = categories.map((cat) => ({
                url: `${URL}/category/${cat.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.9,
            }));
            allRoutes = [...allRoutes, ...categoryRoutes];
        }

        if (products) {
            const productRoutes = products.map((product) => ({
                url: `${URL}/product/${product.id}`,
                lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));
            allRoutes = [...allRoutes, ...productRoutes];
        }

        return allRoutes;
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }

    return routes;
}
