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
import type { UserRole } from '@/types';

function SignupForm() {
  const searchParams = useSearchParams();
  const isWasher = searchParams.get('role') === 'washer';
  const redirectTo = searchParams.get('redirect');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const role: UserRole = isWasher ? 'washer' : 'customer';
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Create profile via API (triggers DB insert with proper role)
    if (data.user) {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          fullName,
          email,
          phone,
          role,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to create profile');
        setLoading(false);
        return;
      }
    }

    toast.success('Account created! Welcome to Driveo.');

    if (redirectTo) {
      router.push(redirectTo);
    } else if (isWasher) {
      router.push('/washer/dashboard');
    } else {
      router.push('/app/onboarding');
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
          <CardTitle className="text-2xl font-display text-white">
            {isWasher ? 'Apply as a Washer' : 'Create your account'}
          </CardTitle>
          <CardDescription className="text-white/60">
            {isWasher
              ? 'Join Driveo and start earning on your schedule'
              : 'Book your first car wash in under 60 seconds'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (416) 555-0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold"
            >
              {loading ? 'Creating account...' : isWasher ? 'Apply Now' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#E23232] hover:underline">
              Sign in
            </Link>
          </div>
          {!isWasher && (
            <div className="mt-2 text-center text-sm text-white/50">
              Want to wash cars?{' '}
              <Link href="/apply" className="text-[#E23232] hover:underline">
                Apply as a washer
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
