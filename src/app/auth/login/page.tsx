'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;

    // Route based on role
    if (redirect && redirect !== '/') {
      router.push(redirect);
    } else if (role === 'customer') {
      router.push('/app/home');
    } else if (role === 'washer') {
      router.push('/washer/dashboard');
    } else if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }

    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505]">
      <Card className="w-full max-w-md bg-[#0a0a0a] border-white/10">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="inline-block mx-auto">
            <Image src="/Driveo-logo.png" alt="Driveo" width={48} height={48} />
          </Link>
          <CardTitle className="text-2xl font-display text-white">Welcome back</CardTitle>
          <CardDescription className="text-white/60">
            Sign in to your Driveo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white/50">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-[#E23232] hover:underline">
              Sign up
            </Link>
          </div>
          <div className="mt-2 text-center text-sm text-white/50">
            Want to wash cars with Driveo?{' '}
            <Link href="/auth/signup?role=washer" className="text-[#E23232] hover:underline">
              Apply as a washer
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
