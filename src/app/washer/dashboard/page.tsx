'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_LABELS, centsToDisplay, formatDuration } from '@/lib/pricing';
import { MapPin, Clock, DollarSign, Star, ChevronRight, Car, Power } from 'lucide-react';
import type { Booking, WasherProfile, Vehicle } from '@/types';
import { cn } from '@/lib/utils';

interface BookingWithVehicle extends Booking {
  vehicles: Vehicle;
}

export default function WasherDashboardPage() {
  const [washerProfile, setWasherProfile] = useState<WasherProfile | null>(null);
  const [todayJobs, setTodayJobs] = useState<BookingWithVehicle[]>([]);
  const [activeJob, setActiveJob] = useState<BookingWithVehicle | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayEarnings, setTodayEarnings] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get washer profile
      const { data: profile } = await supabase
        .from('washer_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setWasherProfile(profile);
        setIsOnline(profile.is_online);
      }

      // Get today's jobs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: jobs } = await supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .eq('washer_id', user.id)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false });

      if (jobs) {
        setTodayJobs(jobs);
        const active = jobs.find((j) =>
          ['assigned', 'en_route', 'arrived', 'washing'].includes(j.status)
        );
        if (active) setActiveJob(active);

        const earned = jobs
          .filter((j) => ['completed', 'paid'].includes(j.status))
          .reduce((sum, j) => sum + j.washer_payout, 0);
        setTodayEarnings(earned);
      }

      setLoading(false);

      // Subscribe to new job assignments
      const channel = supabase
        .channel(`washer-jobs:${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `washer_id=eq.${user.id}`,
        }, () => {
          // Reload on any change
          load();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
    load();
  }, []);

  async function toggleOnline(online: boolean) {
    setIsOnline(online);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('washer_profiles')
      .update({ is_online: online })
      .eq('id', user.id);
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48 bg-white/5" />
        <Skeleton className="h-24 w-full bg-white/5" />
        <Skeleton className="h-40 w-full bg-white/5" />
      </div>
    );
  }

  const completedToday = todayJobs.filter((j) => ['completed', 'paid'].includes(j.status)).length;

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto space-y-5">
      {/* Online Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-white">Dashboard</h1>
          <p className="text-white/40 text-sm">
            {washerProfile?.status === 'approved' ? (isOnline ? 'You\'re online' : 'You\'re offline') : 'Pending approval'}
          </p>
        </div>
        {washerProfile?.status === 'approved' && (
          <div className="flex items-center gap-2">
            <Power className={cn('w-4 h-4', isOnline ? 'text-green-500' : 'text-white/30')} />
            <Switch checked={isOnline} onCheckedChange={toggleOnline} />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-3 text-center">
            <DollarSign className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <p className="text-white font-semibold text-sm">{centsToDisplay(todayEarnings)}</p>
            <p className="text-white/30 text-[10px]">Today</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-3 text-center">
            <Car className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-white font-semibold text-sm">{completedToday}</p>
            <p className="text-white/30 text-[10px]">Washes</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-3 text-center">
            <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
            <p className="text-white font-semibold text-sm">{washerProfile?.rating_avg?.toFixed(1) || '—'}</p>
            <p className="text-white/30 text-[10px]">Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Job */}
      {activeJob && (
        <Link href={`/washer/jobs/${activeJob.id}`}>
          <Card className="bg-gradient-to-br from-[#E23232]/15 to-transparent border-[#E23232]/30 hover:border-[#E23232]/50 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#E23232] animate-pulse" />
                <span className="text-[#E23232] text-xs font-semibold uppercase tracking-wider">Active Job</span>
              </div>
              <p className="text-white font-medium text-sm">
                {PLAN_LABELS[activeJob.wash_plan]}
              </p>
              <div className="flex items-center gap-4 mt-2 text-white/40 text-xs">
                <span className="flex items-center gap-1">
                  <Car className="w-3 h-3" /> {activeJob.vehicles.year} {activeJob.vehicles.make} {activeJob.vehicles.model}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> {centsToDisplay(activeJob.washer_payout)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-white/30 text-xs">
                <MapPin className="w-3 h-3" /> {activeJob.service_address}
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Today's Jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Today&apos;s Jobs</h2>
          <Link href="/washer/jobs" className="text-[#E23232] text-xs hover:underline">View all</Link>
        </div>
        {todayJobs.length === 0 ? (
          <Card className="bg-[#0a0a0a] border-white/10">
            <CardContent className="p-6 text-center">
              <p className="text-white/30 text-sm">
                {isOnline ? 'No jobs yet today. Stay online!' : 'Go online to receive jobs.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {todayJobs.map((job) => (
              <Link key={job.id} href={`/washer/jobs/${job.id}`}>
                <Card className="bg-[#0a0a0a] border-white/10 hover:border-white/20 transition-all cursor-pointer mb-2">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm">{PLAN_LABELS[job.wash_plan]}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-white/30 text-xs mt-0.5">
                        {job.vehicles.year} {job.vehicles.make} {job.vehicles.model}
                      </p>
                    </div>
                    <span className="text-green-400 text-sm font-medium">{centsToDisplay(job.washer_payout)}</span>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
