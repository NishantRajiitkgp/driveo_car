'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Car, MapPin, Sparkles, ChevronRight, CalendarDays, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_LABELS, centsToDisplay, PLAN_PRICES } from '@/lib/pricing';
import type { Profile, Vehicle, Booking, WashPlan } from '@/types';

const planCards: { plan: WashPlan; icon: React.ReactNode; color: string }[] = [
  { plan: 'regular', icon: <Car className="w-6 h-6" />, color: 'from-blue-500/20 to-blue-600/5' },
  { plan: 'interior_exterior', icon: <Sparkles className="w-6 h-6" />, color: 'from-purple-500/20 to-purple-600/5' },
  { plan: 'detailing', icon: <Zap className="w-6 h-6" />, color: 'from-amber-500/20 to-amber-600/5' },
];

export default function CustomerHomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, vehiclesRes, bookingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('vehicles').select('*').eq('customer_id', user.id).order('is_primary', { ascending: false }),
        supabase.from('bookings').select('*').eq('customer_id', user.id)
          .not('status', 'in', '("completed","paid","cancelled")')
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (bookingsRes.data?.[0]) setActiveBooking(bookingsRes.data[0]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="px-4 pt-6 space-y-6 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48 bg-white/5" />
        <Skeleton className="h-32 w-full bg-white/5" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-36 bg-white/5" />
          <Skeleton className="h-36 bg-white/5" />
          <Skeleton className="h-36 bg-white/5" />
        </div>
      </div>
    );
  }

  const primaryVehicle = vehicles.find((v) => v.is_primary) || vehicles[0];

  return (
    <div className="px-4 pt-6 pb-8 space-y-6 max-w-lg mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-display text-white">
          Hi, {profile?.full_name?.split(' ')[0] || 'there'}
        </h1>
        {primaryVehicle ? (
          <p className="text-white/50 text-sm mt-1">
            Your {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model} is ready for a wash.
          </p>
        ) : (
          <p className="text-white/50 text-sm mt-1">Add a vehicle to get started.</p>
        )}
      </div>

      {/* Quick Book CTA */}
      <Link href="/app/book">
        <Card className="bg-gradient-to-br from-[#E23232]/20 to-[#E23232]/5 border-[#E23232]/20 hover:border-[#E23232]/40 transition-all cursor-pointer group">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-lg">Book a Wash</p>
              <p className="text-white/50 text-sm mt-1">Instant or scheduled. Takes 60 seconds.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#E23232] group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
      </Link>

      {/* Active Booking */}
      {activeBooking && (
        <Link href={`/app/track/${activeBooking.id}`}>
          <Card className="bg-[#0a0a0a] border-green-500/30 hover:border-green-500/50 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">
                  Active Wash
                </span>
              </div>
              <p className="text-white text-sm font-medium">
                {PLAN_LABELS[activeBooking.wash_plan]} — {activeBooking.status.replace('_', ' ')}
              </p>
              <p className="text-white/40 text-xs mt-1">{activeBooking.service_address}</p>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Wash Plans */}
      <div>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
          Choose a wash
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {planCards.map(({ plan, icon, color }) => (
            <Link key={plan} href={`/app/book?plan=${plan}`}>
              <Card className={`bg-gradient-to-b ${color} border-white/10 hover:border-white/20 transition-all cursor-pointer h-full`}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="text-white/80">{icon}</div>
                  <p className="text-white text-xs font-medium leading-tight">{PLAN_LABELS[plan]}</p>
                  <p className="text-[#E23232] font-semibold text-sm">{centsToDisplay(PLAN_PRICES[plan])}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Vehicle */}
      {primaryVehicle ? (
        <Link href="/app/vehicles">
          <Card className="bg-[#0a0a0a] border-white/10 hover:border-white/20 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Car className="w-5 h-5 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                </p>
                <p className="text-white/40 text-xs capitalize">{primaryVehicle.type.replace('_', ' ')}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </CardContent>
          </Card>
        </Link>
      ) : (
        <Link href="/app/onboarding">
          <Card className="bg-[#0a0a0a] border-dashed border-white/20 hover:border-[#E23232]/40 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#E23232]/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-[#E23232]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Add your vehicle</p>
                <p className="text-white/40 text-xs">Required to book a wash</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/app/bookings">
          <Card className="bg-[#0a0a0a] border-white/10 hover:border-white/20 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-white/50" />
              <span className="text-white/70 text-sm">Wash History</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/subscription">
          <Card className="bg-[#0a0a0a] border-white/10 hover:border-white/20 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-white/50" />
              <span className="text-white/70 text-sm">Membership</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
