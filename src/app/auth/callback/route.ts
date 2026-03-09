import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;

      // Route based on role
      if (next !== '/') {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (role === 'customer') {
        return NextResponse.redirect(`${origin}/app/home`);
      }
      if (role === 'washer') {
        return NextResponse.redirect(`${origin}/washer/dashboard`);
      }
      if (role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`);
      }
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
