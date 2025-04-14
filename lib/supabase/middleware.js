import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public paths that don't require authentication
  const isPublicPath = request.nextUrl.pathname.startsWith('/auth') || 
                       request.nextUrl.pathname === '/';

  // Define protected paths that require authentication
  const isProtectedPath = request.nextUrl.pathname.startsWith('/listings') || 
                          request.nextUrl.pathname.startsWith('/protected') ||
                          request.nextUrl.pathname.startsWith('/chats');

  // If no user and trying to access protected route, redirect to login
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url);
  }

  // If user exists and trying to access auth pages (like login/signup), redirect to listings
  if (user && isPublicPath && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/listings'
    return NextResponse.redirect(url);
  }

  return supabaseResponse
}
