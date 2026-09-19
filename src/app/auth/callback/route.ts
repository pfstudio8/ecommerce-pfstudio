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
  
  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )

    // Exchange the code for a session, which will automatically trigger setAll to save the tokens
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    } else {
      console.error('Supabase Auth Error in Callback:', error)
    }
  }

  // return the user to an error page with some instructions if login failed
  return NextResponse.redirect(new URL('/?error=auth', origin))
}
