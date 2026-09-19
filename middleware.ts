import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. CSRF Protection for mutating methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const origin = request.headers.get('origin') ?? request.headers.get('referer');
        const host = request.headers.get('host');

        // Allow webhooks to bypass CSRF as they use signature validation
        const isWebhook = request.nextUrl.pathname.startsWith('/api/webhooks');

        if (!isWebhook) {
            if (!origin || !host || !origin.includes(host)) {
                console.error(`CSRF Protection block: Origin ${origin} does not match Host ${host}`);
                return new NextResponse('CSRF Validation Failed - Missing or Invalid Origin', { status: 403 });
            }
        }
    }

    // 2. Auth Session Management
    return await updateSession(request);
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
