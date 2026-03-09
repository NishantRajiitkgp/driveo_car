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

const planCards: { plan: WashPlan; icon: React.ReactNode; color: string; glow: string }[] = [
  { plan: 'regular', icon: <Car className="w-6 h-6" />, color: 'from-blue-500/20 to-blue-600/5', glow: 'group-hover:shadow-blue-500/10' },
  { plan: 'interior_exterior', icon: <Sparkles className="w-6 h-6" />, color: 'from-purple-500/20 to-purple-600/5', glow: 'group-hover:shadow-purple-500/10' },
  { plan: 'detailing', icon: <Zap className="w-6 h-6" />, color: 'from-amber-500/20 to-amber-600/5', glow: 'group-hover:shadow-amber-500/10' },
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
        <Skeleton className="h-10 w-56 bg-white/5 rounded-lg" />
        <Skeleton className="h-4 w-72 bg-white/5 rounded" />
        <Skeleton className="h-28 w-full bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-40 bg-white/5 rounded-2xl" />
          <Skeleton className="h-40 bg-white/5 rounded-2xl" />
          <Skeleton className="h-40 bg-white/5 rounded-2xl" />
        </div>
        <Skeleton className="h-20 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const primaryVehicle = vehicles.find((v) => v.is_primary) || vehicles[0];

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto animate-fade-in-up">
      <div className="stagger-children space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-display text-white tracking-tight">
            Hi, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'there'}</span>
          </h1>
          {primaryVehicle ? (
            <p className="text-white/40 text-sm mt-2 leading-relaxed">
              Your {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model} is ready for a wash.
            </p>
          ) : (
            <p className="text-white/40 text-sm mt-2">Add a vehicle to get started.</p>
          )}
        </div>

        {/* Quick Book CTA */}
        <Link href="/app/book" className="block">
          <div className="gradient-border animate-glow-pulse rounded-2xl">
            <div className="glass-card rounded-2xl p-5 flex items-center justify-between group cursor-pointer">
              <div>
                <p className="text-white font-semibold text-lg tracking-tight">Book a Wash</p>
                <p className="text-white/40 text-sm mt-1">Instant or scheduled. Takes 60 seconds.</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#E23232]/20 flex items-center justify-center group-hover:bg-[#E23232]/30 transition-colors">
                <ChevronRight className="w-5 h-5 text-[#E23232] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* Active Booking */}
        {activeBooking && (
          <Link href={`/app/track/${activeBooking.id}`} className="block">
            <div className="glass-card rounded-2xl p-4 cursor-pointer border-green-500/20 hover:border-green-500/40 transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
                </div>
                <span className="text-green-400 text-xs font-semibold uppercase tracking-[0.15em]">
                  Active Wash
                </span>
              </div>
              <p className="text-white text-sm font-medium">
                {PLAN_LABELS[activeBooking.wash_plan]} — {activeBooking.status.replace('_', ' ')}
              </p>
              <p className="text-white/30 text-xs mt-1.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {activeBooking.service_address}
              </p>
            </div>
          </Link>
        )}

        {/* Wash Plans */}
        <div>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-4">
            Choose a wash
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {planCards.map(({ plan, icon, color, glow }) => (
              <Link key={plan} href={`/app/book?plan=${plan}`} className="block group">
                <div className={`glass-card rounded-2xl h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${glow}`}>
                  <div className={`absolute inset-0 bg-gradient-to-b ${color} rounded-2xl opacity-60`} />
                  <div className="relative p-4 flex flex-col items-center text-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/70 group-hover:text-white transition-colors">
                      {icon}
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium leading-tight">{PLAN_LABELS[plan]}</p>
                      <p className="text-[#E23232] font-bold text-base mt-1">{centsToDisplay(PLAN_PRICES[plan])}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Vehicle */}
        {primaryVehicle ? (
          <Link href="/app/vehicles" className="block">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Car className="w-5 h-5 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                </p>
                <p className="text-white/30 text-xs capitalize mt-0.5">{primaryVehicle.type.replace('_', ' ')}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </div>
          </Link>
        ) : (
          <Link href="/app/onboarding" className="block">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer border-dashed border-white/10 hover:border-[#E23232]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-[#E23232]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Add your vehicle</p>
                <p className="text-white/30 text-xs mt-0.5">Required to book a wash</p>
              </div>
            </div>
          </Link>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/app/bookings" className="block">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-white/40" />
              </div>
              <span className="text-white/60 text-sm font-medium">Wash History</span>
            </div>
          </Link>
          <Link href="/app/subscription" className="block">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white/40" />
              </div>
              <span className="text-white/60 text-sm font-medium">Membership</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
