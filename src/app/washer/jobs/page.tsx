'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Car, DollarSign, Clock, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  wash_plan: string;
  dirt_level: number;
  status: string;
  service_address: string;
  is_instant: boolean;
  scheduled_at: string | null;
  washer_payout: number;
  created_at: string;
  wash_completed_at: string | null;
  vehicles: {
    make: string;
    model: string;
    year: number;
    type: string;
  } | null;
}

const planLabel: Record<string, string> = {
  regular: 'Regular',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Detailing',
};

const statusColor: Record<string, string> = {
  assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  en_route: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  arrived: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  washing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  paid: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusBorderAccent: Record<string, string> = {
  assigned: 'border-l-blue-500',
  en_route: 'border-l-blue-500',
  arrived: 'border-l-purple-500',
  washing: 'border-l-purple-500',
  completed: 'border-l-green-500',
  paid: 'border-l-green-500',
};

const statusGlow: Record<string, string> = {
  assigned: 'shadow-[0_0_12px_rgba(59,130,246,0.08)]',
  en_route: 'shadow-[0_0_12px_rgba(59,130,246,0.08)]',
  arrived: 'shadow-[0_0_12px_rgba(168,85,247,0.08)]',
  washing: 'shadow-[0_0_12px_rgba(168,85,247,0.08)]',
  completed: 'shadow-[0_0_12px_rgba(34,197,94,0.08)]',
  paid: 'shadow-[0_0_12px_rgba(34,197,94,0.08)]',
};

export default function WasherJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchJobs() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('*, vehicles(make, model, year, type)')
        .eq('washer_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setJobs(data as Job[]);
      }
      setLoading(false);
    }

    fetchJobs();
  }, [supabase]);

  const activeStatuses = ['assigned', 'en_route', 'arrived', 'washing'];
  const upcomingFilter = (j: Job) =>
    j.status === 'assigned' && j.scheduled_at && new Date(j.scheduled_at) > new Date();
  const activeFilter = (j: Job) =>
    activeStatuses.includes(j.status) && !upcomingFilter(j);
  const completedFilter = (j: Job) =>
    j.status === 'completed' || j.status === 'paid';

  const activeJobs = jobs.filter(activeFilter);
  const upcomingJobs = jobs.filter(upcomingFilter);
  const completedJobs = jobs.filter(completedFilter);

  const renderJobCard = (job: Job) => (
    <Link key={job.id} href={`/washer/jobs/${job.id}`}>
      <div
        className={`glass-card rounded-2xl border-l-[3px] ${statusBorderAccent[job.status] || 'border-l-white/10'} ${statusGlow[job.status] || ''} hover:bg-white/[0.04] transition-all duration-300 cursor-pointer`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Badge
              variant="outline"
              className={`${statusColor[job.status] || 'border-white/20 text-white/60'} rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-medium`}
            >
              {job.status.replace('_', ' ')}
            </Badge>
            <div className="flex items-center gap-1 text-green-400 font-bold text-sm">
              <DollarSign className="w-3.5 h-3.5" />
              {(job.washer_payout / 100).toFixed(2)}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white font-semibold">
                {planLabel[job.wash_plan] || job.wash_plan}
              </span>
              <span className="text-white/15">|</span>
              <span className="text-white/40 text-xs">Dirt {job.dirt_level}</span>
            </div>

            {job.vehicles && (
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Car className="w-3.5 h-3.5 text-white/30" />
                <span>
                  {job.vehicles.year} {job.vehicles.make} {job.vehicles.model}
                </span>
                <span className="text-white/20 capitalize text-xs">({job.vehicles.type})</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-white/35">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{job.service_address}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-white/25 pt-1 border-t border-white/[0.04]">
              <div className="flex items-center gap-2">
                {job.scheduled_at ? (
                  <>
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(job.scheduled_at).toLocaleDateString('en-CA', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>Instant</span>
                  </>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-white/15" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const renderEmptyState = (message: string) => (
    <div className="glass-card rounded-2xl p-12 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#E23232]/5 blur-3xl pointer-events-none" />
      <p className="text-white/30 text-sm relative">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in-up">
        <h1 className="text-2xl font-display text-white tracking-tight mb-6">My Jobs</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="shimmer h-36 w-full bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full glass rounded-full p-1 border border-white/[0.06] mb-6 h-auto">
              <TabsTrigger
                value="active"
                className="flex-1 rounded-full py-2.5 text-sm font-medium data-[state=active]:bg-[#E23232] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(226,50,50,0.3)] text-white/40 transition-all duration-300"
              >
                Active ({activeJobs.length})
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="flex-1 rounded-full py-2.5 text-sm font-medium data-[state=active]:bg-[#E23232] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(226,50,50,0.3)] text-white/40 transition-all duration-300"
              >
                Upcoming ({upcomingJobs.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex-1 rounded-full py-2.5 text-sm font-medium data-[state=active]:bg-[#E23232] data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(226,50,50,0.3)] text-white/40 transition-all duration-300"
              >
                Done ({completedJobs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3 stagger-children">
              {activeJobs.length === 0 ? (
                renderEmptyState('No active jobs')
              ) : (
                activeJobs.map(renderJobCard)
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-3 stagger-children">
              {upcomingJobs.length === 0 ? (
                renderEmptyState('No upcoming jobs')
              ) : (
                upcomingJobs.map(renderJobCard)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 stagger-children">
              {completedJobs.length === 0 ? (
                renderEmptyState('No completed jobs yet')
              ) : (
                completedJobs.map(renderJobCard)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
