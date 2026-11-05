import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // URL to redirect to after sign in process completes
  let next = searchParams.get('next') || '/'
  
  // Protect against Open Redirect Vulnerability: ensure 'next' is a relative path
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/'
  }

  // Handle forwarded host if behind a reverse proxy (e.g. Vercel)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectOrigin = forwardedHost && !isLocalEnv ? `${forwardedProto}://${forwardedHost}` : origin
  
  if (code) {
    const cookieStore = await cookies()
    // Create the redirect response upfront so cookies set during code exchange are attached to it
    const response = NextResponse.redirect(new URL(next, redirectOrigin))
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch {
                // Ignore if called from context where cookieStore is read-only
              }
              // Explicitly attach the session cookies to the response headers
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Exchange the code for a session, which will automatically trigger setAll to save the tokens
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return response
    } else {
      console.error('Supabase Auth Error in Callback:', error)
    }
  }

  // return the user to an error page with instructions if login failed
  return NextResponse.redirect(new URL('/?error=auth', redirectOrigin))
}
