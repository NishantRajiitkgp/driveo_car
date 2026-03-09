'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Car, DollarSign, Clock, Calendar } from 'lucide-react';

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
    <Card
      key={job.id}
      className="bg-[#0a0a0a] border-white/10 hover:border-white/20 transition-colors"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge
            variant="outline"
            className={statusColor[job.status] || 'border-white/20 text-white/60'}
          >
            {job.status.replace('_', ' ')}
          </Badge>
          <div className="flex items-center gap-1 text-[#E23232] font-semibold text-sm">
            <DollarSign className="w-3.5 h-3.5" />
            {(job.washer_payout / 100).toFixed(2)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white font-medium">
              {planLabel[job.wash_plan] || job.wash_plan}
            </span>
            <span className="text-white/30">|</span>
            <span className="text-white/50">Dirt {job.dirt_level}</span>
          </div>

          {job.vehicles && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Car className="w-3.5 h-3.5" />
              <span>
                {job.vehicles.year} {job.vehicles.make} {job.vehicles.model}
              </span>
              <span className="text-white/30 capitalize">({job.vehicles.type})</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-white/40">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{job.service_address}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/30">
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
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Jobs</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full bg-white/5 border border-white/10 mb-4">
              <TabsTrigger
                value="active"
                className="flex-1 data-[state=active]:bg-[#E23232] data-[state=active]:text-white text-white/50"
              >
                Active ({activeJobs.length})
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="flex-1 data-[state=active]:bg-[#E23232] data-[state=active]:text-white text-white/50"
              >
                Upcoming ({upcomingJobs.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex-1 data-[state=active]:bg-[#E23232] data-[state=active]:text-white text-white/50"
              >
                Done ({completedJobs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3">
              {activeJobs.length === 0 ? (
                <p className="text-center text-white/40 py-8">No active jobs</p>
              ) : (
                activeJobs.map(renderJobCard)
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-3">
              {upcomingJobs.length === 0 ? (
                <p className="text-center text-white/40 py-8">
                  No upcoming jobs
                </p>
              ) : (
                upcomingJobs.map(renderJobCard)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3">
              {completedJobs.length === 0 ? (
                <p className="text-center text-white/40 py-8">
                  No completed jobs yet
                </p>
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
