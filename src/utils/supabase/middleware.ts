import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, requestHeaders?: Headers) {
    let supabaseResponse = NextResponse.next({
        request: requestHeaders ? { headers: requestHeaders } : request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If Supabase environment variables are missing, do not crash the entire middleware
    if (!supabaseUrl || !supabaseAnonKey) {
        // Enforce security: restrict protected routes even without Supabase config
        if (request.nextUrl.pathname.startsWith('/profile') || request.nextUrl.pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return supabaseResponse
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request: requestHeaders ? { headers: requestHeaders } : request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Define URLs
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/'
        loginUrl.searchParams.set('login', 'true')

        // Protect /profile routes
        if (request.nextUrl.pathname.startsWith('/profile') && !user) {
            return NextResponse.redirect(loginUrl)
        }

        // Protect /admin routes using profiles.role (replaces ADMIN_EMAILS)
        if (request.nextUrl.pathname.startsWith('/admin')) {
            if (!user) {
                return NextResponse.redirect(new URL('/', request.url))
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const hasAdminRole = profile && (profile.role === 'admin' || profile.role === 'employee');

            if (!hasAdminRole) {
                // Graceful transition fallback in case profiles table is pending initial migration
                const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
                if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
                    return NextResponse.redirect(new URL('/', request.url))
                }
            }
        }
    } catch (err) {
        console.error('Middleware session error:', err)
        if (request.nextUrl.pathname.startsWith('/profile') || request.nextUrl.pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return supabaseResponse
}
