import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
    // 1. CSRF Protection for mutating methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const origin = request.headers.get('origin') ?? request.headers.get('referer');
        const host = request.headers.get('host');

        // Allow keep-alive endpoints to bypass CSRF as they use signature/secret validation
        const isKeepAlive = request.nextUrl.pathname.startsWith('/api/keep-alive');

        if (!isKeepAlive) {
            let isValidOrigin = false;
            if (origin && host) {
                try {
                    const originHost = new URL(origin).host;
                    isValidOrigin = originHost === host;
                } catch {
                    isValidOrigin = false;
                }
            }

            if (!isValidOrigin) {
                console.error(`CSRF Protection block: Origin ${origin} does not match Host ${host}`);
                return new NextResponse('CSRF Validation Failed - Missing or Invalid Origin', { status: 403 });
            }
        }
    }

    // 2. CSP Security Headers with Cryptographic Nonce
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    let supabaseHostname = '';
    try {
        if (supabaseUrl) supabaseHostname = new URL(supabaseUrl).hostname;
    } catch {
        // fallback
    }

    const supabaseSrc = supabaseHostname ? `https://${supabaseHostname}` : '';

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https://images.unsplash.com ${supabaseSrc};
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' ${supabaseSrc};
        frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);

    // 3. Auth Session Management & Route Protection via Supabase
    const response = await updateSession(request, requestHeaders);

    // Propagate security headers to client response
    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('x-nonce', nonce);

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         * - Static image and media assets
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

export default middleware;
