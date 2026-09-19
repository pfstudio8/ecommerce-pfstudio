import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
    // CSRF Protection for mutating methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        // Excluir webhooks porque provienen de servicios externos (ej. MercadoPago)
        if (!request.nextUrl.pathname.startsWith('/api/webhooks')) {
            const origin = request.headers.get('origin')
            const host = request.headers.get('host')
            const referer = request.headers.get('referer')
            
            const sourceUrl = origin || referer
            
            if (!sourceUrl || !host) {
                return new NextResponse("CSRF Protection: Missing Origin/Referer", { status: 403 })
            }
            
            try {
                const sourceHost = new URL(sourceUrl).host
                if (sourceHost !== host) {
                    return new NextResponse("CSRF Protection: Invalid Origin", { status: 403 })
                }
            } catch (e) {
                return new NextResponse("CSRF Protection: Invalid URL", { status: 403 })
            }
        }
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
