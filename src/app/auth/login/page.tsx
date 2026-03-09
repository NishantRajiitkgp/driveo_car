'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, Loader2 } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    if (redirect && redirect !== '/') router.push(redirect);
    else if (role === 'customer') router.push('/app/home');
    else if (role === 'washer') router.push('/washer/dashboard');
    else if (role === 'admin') router.push('/admin');
    else router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E23232]/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#E23232]/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] animate-fade-in-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <div className="relative inline-flex items-center justify-center">
              <Image src="/Driveo-logo.png" alt="Driveo" width={56} height={56} className="transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-[#E23232]/20 blur-2xl rounded-full opacity-60" />
            </div>
          </Link>
          <h1 className="font-display text-3xl text-white mt-6 tracking-wide">WELCOME BACK</h1>
          <p className="text-white/40 text-sm mt-2">Sign in to your Driveo account</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const supabase = createClient();
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
                  queryParams: { access_type: 'offline', prompt: 'consent' },
                },
              });
              if (error) { toast.error(error.message); setLoading(false); }
            }}
            className="w-full h-12 bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15] font-medium rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 text-white/25 bg-[#050505]/50 backdrop-blur-sm">or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/50 text-xs uppercase tracking-wider font-medium">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl premium-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/50 text-xs uppercase tracking-wider font-medium">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl premium-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_24px_rgba(226,50,50,0.25)] hover:shadow-[0_8px_32px_rgba(226,50,50,0.35)] group">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>Sign In<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" /></>)}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-white/35">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-[#E23232] hover:text-[#ff6b6b] transition-colors font-medium">Sign up</Link>
            </p>
            <p className="text-sm text-white/35">
              Want to wash cars?{' '}
              <Link href="/auth/signup?role=washer" className="text-[#E23232] hover:text-[#ff6b6b] transition-colors font-medium">Apply as a washer</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
