'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Car, MapPin, Sparkles, ChevronRight, CalendarDays, Zap, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_LABELS, centsToDisplay, PLAN_PRICES } from '@/lib/pricing';
import type { Profile, Vehicle, Booking, WashPlan } from '@/types';

const planCards: { plan: WashPlan; icon: React.ReactNode; label: string; accent: string }[] = [
  { plan: 'regular', icon: <Car className="w-5 h-5" />, label: 'Regular Wash', accent: '#3b82f6' },
  { plan: 'interior_exterior', icon: <Sparkles className="w-5 h-5" />, label: 'Interior & Exterior', accent: '#a855f7' },
  { plan: 'detailing', icon: <Zap className="w-5 h-5" />, label: 'Detailing', accent: '#f59e0b' },
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
      <div className="px-4 pt-6 space-y-5 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48 bg-white/[0.06] rounded-lg" />
        <Skeleton className="h-4 w-64 bg-white/[0.04] rounded" />
        <Skeleton className="h-16 w-full bg-white/[0.06] rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-28 bg-white/[0.06] rounded-2xl" />
          <Skeleton className="h-28 bg-white/[0.06] rounded-2xl" />
          <Skeleton className="h-28 bg-white/[0.06] rounded-2xl" />
        </div>
        <Skeleton className="h-16 w-full bg-white/[0.06] rounded-2xl" />
      </div>
    );
  }

  const primaryVehicle = vehicles.find((v) => v.is_primary) || vehicles[0];

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto animate-fade-in-up">
      <div className="space-y-5">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
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

        {/* Book a Wash CTA */}
        <Link href="/app/book" className="block">
          <div className="bg-[#E23232] rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
            <div>
              <p className="text-white font-bold text-lg">Book a Wash</p>
              <p className="text-white/70 text-sm mt-0.5">Instant or scheduled. Takes 60 seconds.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </Link>

        {/* Active Booking */}
        {activeBooking && (
          <Link href={`/app/track/${activeBooking.id}`} className="block">
            <div className="card-elevated p-4 border-l-3 border-l-green-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
                <span className="text-green-400 text-xs font-bold uppercase tracking-wider">
                  Active Wash
                </span>
              </div>
              <p className="text-white text-sm font-semibold">
                {PLAN_LABELS[activeBooking.wash_plan]} — {activeBooking.status.replace('_', ' ')}
              </p>
              <p className="text-white/40 text-xs mt-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {activeBooking.service_address}
              </p>
            </div>
          </Link>
        )}

        {/* Wash Plans */}
        <div>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
            Choose a Wash
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {planCards.map(({ plan, icon, label, accent }) => (
              <Link key={plan} href={`/app/book?plan=${plan}`} className="block">
                <div className="card-elevated p-4 flex flex-col items-center text-center gap-2.5 active:scale-[0.97] transition-transform">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${accent}18`, color: accent }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold leading-tight">{label}</p>
                    <p className="text-[#E23232] font-bold text-sm mt-1">{centsToDisplay(PLAN_PRICES[plan])}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Vehicle */}
        {primaryVehicle ? (
          <Link href="/app/vehicles" className="block">
            <div className="card-elevated p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                </p>
                <p className="text-white/40 text-xs capitalize mt-0.5">{primaryVehicle.type.replace('_', ' ')}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
            </div>
          </Link>
        ) : (
          <Link href="/app/onboarding" className="block">
            <div className="card-elevated p-4 flex items-center gap-3.5 border-dashed">
              <div className="w-11 h-11 rounded-xl bg-[#E23232]/10 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-[#E23232]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Add your vehicle</p>
                <p className="text-white/40 text-xs mt-0.5">Required to book a wash</p>
              </div>
            </div>
          </Link>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/app/bookings" className="block">
            <div className="card-elevated p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-white/70 text-sm font-medium">Wash History</span>
            </div>
          </Link>
          <Link href="/app/membership" className="block">
            <div className="card-elevated p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-white/70 text-sm font-medium">Membership</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
