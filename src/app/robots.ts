import { MetadataRoute } from 'next';

const URL = 'https://pfstudio.com.ar'; // Update this when deploying

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/perfil/'],
        },
        sitemap: `${URL}/sitemap.xml`,
    };
}
