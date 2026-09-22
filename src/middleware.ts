import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export function middleware(request: NextRequest) {
  // Generate a nonce using Web Crypto API
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrwogbouarapcxzsqwan.supabase.co';
  const supabaseHostname = new URL(supabaseUrl).hostname;
 
  // Construir CSP estricta usando nonce
  // Eliminamos 'unsafe-inline' de script-src en favor de 'nonce-...'
  // Next.js automáticamente propagará el nonce a los <Script> de Next.js si proveemos el header x-nonce.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://www.mercadopago.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://images.unsplash.com https://${supabaseHostname};
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://${supabaseHostname} https://api.mercadopago.com;
    frame-src 'self' https://www.mercadopago.com;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();
 
  const requestHeaders = new Headers(request.headers);
  // Setting x-nonce allows Next.js to read the nonce and inject it into its scripts automatically
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);
 
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  response.headers.set('Content-Security-Policy', cspHeader);
 
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
