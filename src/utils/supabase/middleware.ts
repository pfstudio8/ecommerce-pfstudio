import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
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
    // Optionally, you can pass a query param ?login=true to automatically open the modal if you want
    // loginUrl.searchParams.set('login', 'true')

    // Protect /perfil routes
    if (request.nextUrl.pathname.startsWith('/perfil') && !user) {
        return NextResponse.redirect(loginUrl)
    }

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        console.log("=== MIDDLEWARE ADMIN CHECK ===");
        console.log("All Cookies:", request.cookies.getAll().map(c => c.name));
        console.log("User:", user?.email);

        if (!user) {
            console.log("No user, redirecting to home");
            return NextResponse.redirect(new URL('/', request.url))
        }

        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
        console.log("Admin Emails list from ENV:", adminEmails);

        if (!user.email || !adminEmails.includes(user.email)) {
            // If logged in but not an admin, redirect to home
            console.log("Access denied for email:", user.email);
            return NextResponse.redirect(new URL('/', request.url))
        }

        console.log("Access GRANTED");
    }

    return supabaseResponse
}
