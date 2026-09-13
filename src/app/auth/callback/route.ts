import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // URL to redirect to after sign in process completes
  // If next is set in the URL (e.g. ?next=/profile), we redirect there. Otherwise, redirect to root.
  const next = requestUrl.searchParams.get('next') || '/'
  
  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Need to get cookies from request since this is an API route
            // For route handlers, we parse the cookie header manually
            const cookieHeader = request.headers.get('cookie')
            if (!cookieHeader) return []
            
            return cookieHeader.split(';').map(cookie => {
              const [name, ...rest] = cookie.split('=')
              return { name: name.trim(), value: rest.join('=').trim() }
            })
          },
          setAll() {
            // We don't strictly need setAll here if we use NextResponse.redirect
            // and set cookies on the response object directly, but for standard SSR:
            // This will be handled below.
          },
        },
      }
    )

    // Actually exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      // Create redirect response
      const response = NextResponse.redirect(new URL(next, requestUrl.origin))
      
      // Setting cookies is best done directly on the response to ensure they stick
      // Supabase sets multiple cookies (access-token, refresh-token, etc)
      // Since exchangeCodeForSession implicitly uses the setAll method, and we left it empty above,
      // it's safer to re-instantiate the client with response.cookies or just let Supabase handle it 
      // with a properly configured cookie handler.
      
      // A cleaner way for Next.js App Router Route Handlers:
      const supabaseServerClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.headers.get('cookie')?.split(';').map(c => {
                const [n, ...v] = c.split('=')
                return { name: n.trim(), value: v.join('=').trim() }
              }) || []
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set({ name, value, ...options })
              })
            },
          },
        }
      )
      
      // Calling getUser() or getSession() triggers the cookie refresh/set logic
      await supabaseServerClient.auth.getUser()
      
      return response
    }
  }

  // return the user to an error page with some instructions if login failed
  return NextResponse.redirect(new URL('/?error=auth', request.url))
}
