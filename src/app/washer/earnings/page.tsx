'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Car,
} from 'lucide-react';

interface EarningsJob {
  id: string;
  wash_plan: string;
  washer_payout: number;
  status: string;
  wash_completed_at: string | null;
  created_at: string;
  vehicles: {
    make: string;
    model: string;
    year: number;
  } | null;
}

const planLabel: Record<string, string> = {
  regular: 'Regular',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Detailing',
};

export default function WasherEarningsPage() {
  const [jobs, setJobs] = useState<EarningsJob[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEarnings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('id, wash_plan, washer_payout, status, wash_completed_at, created_at, vehicles(make, model, year)')
        .eq('washer_id', user.id)
        .in('status', ['completed', 'paid'])
        .order('wash_completed_at', { ascending: false });

      if (!error && data) {
        setJobs(data as unknown as EarningsJob[]);
      }
      setLoading(false);
    }

    fetchEarnings();
  }, [supabase]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayEarnings = jobs
    .filter((j) => j.wash_completed_at && new Date(j.wash_completed_at) >= todayStart)
    .reduce((sum, j) => sum + j.washer_payout, 0);

  const monthEarnings = jobs
    .filter((j) => j.wash_completed_at && new Date(j.wash_completed_at) >= monthStart)
    .reduce((sum, j) => sum + j.washer_payout, 0);

  const allTimeEarnings = jobs.reduce((sum, j) => sum + j.washer_payout, 0);

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Earnings</h1>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 bg-white/5 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 w-full bg-white/5 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <Card className="bg-[#0a0a0a] border-white/10">
                <CardContent className="p-4 text-center">
                  <Clock className="w-4 h-4 text-[#E23232] mx-auto mb-1" />
                  <p className="text-xs text-white/40 mb-1">Today</p>
                  <p className="text-lg font-bold text-white">
                    {formatCents(todayEarnings)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-[#E23232]/30">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-4 h-4 text-[#E23232] mx-auto mb-1" />
                  <p className="text-xs text-white/40 mb-1">This Month</p>
                  <p className="text-lg font-bold text-[#E23232]">
                    {formatCents(monthEarnings)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-white/10">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-4 h-4 text-[#E23232] mx-auto mb-1" />
                  <p className="text-xs text-white/40 mb-1">All Time</p>
                  <p className="text-lg font-bold text-white">
                    {formatCents(allTimeEarnings)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Job History */}
            <h2 className="text-lg font-semibold mb-4">Job History</h2>

            {jobs.length === 0 ? (
              <Card className="bg-[#0a0a0a] border-white/10">
                <CardContent className="py-12 text-center">
                  <p className="text-white/40">No completed jobs yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="bg-[#0a0a0a] border-white/10"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">
                              {planLabel[job.wash_plan] || job.wash_plan}
                            </span>
                            {job.vehicles && (
                              <span className="text-xs text-white/30">
                                {job.vehicles.year} {job.vehicles.make}{' '}
                                {job.vehicles.model}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/30">
                            {job.wash_completed_at
                              ? new Date(job.wash_completed_at).toLocaleDateString(
                                  'en-CA',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )
                              : 'Pending'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[#E23232] font-bold">
                          <DollarSign className="w-4 h-4" />
                          {(job.washer_payout / 100).toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
