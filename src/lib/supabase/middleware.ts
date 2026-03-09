import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Public routes — no auth needed
    const publicRoutes = ['/', '/auth', '/plans', '/how-it-works', '/apply'];
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    );
    const isApiRoute = pathname.startsWith('/api');
    const isStaticAsset = pathname.startsWith('/_next') || pathname.includes('.');

    if (isPublicRoute || isApiRoute || isStaticAsset) {
      return supabaseResponse;
    }

    // Not logged in → redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Get user role from metadata
    const role = user.user_metadata?.role as string | undefined;

    // Role-based route protection
    if (pathname.startsWith('/app') && role !== 'customer') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (pathname.startsWith('/washer') && role !== 'washer') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return supabaseResponse;
  } catch (e) {
    console.error('Middleware auth error:', e);
    return supabaseResponse;
  }
}
