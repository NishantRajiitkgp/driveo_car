'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Send, User, AlertCircle } from 'lucide-react';

interface WasherPayout {
  id: string;
  full_name: string;
  email: string;
  stripe_account_id: string | null;
  pending_earnings: number;
  completed_jobs: number;
}

export default function AdminPayoutsPage() {
  const [washers, setWashers] = useState<WasherPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPayouts() {
      // Fetch washers with their completed but unpaid bookings
      const { data: washerData, error: washerError } = await supabase
        .from('profiles')
        .select('id, full_name, email, washer_profiles(stripe_account_id)')
        .eq('role', 'washer');

      if (washerError || !washerData) {
        setLoading(false);
        return;
      }

      // For each washer, calculate pending earnings
      const payouts: WasherPayout[] = [];

      for (const washer of washerData) {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('washer_payout')
          .eq('washer_id', washer.id)
          .eq('status', 'completed');

        const pendingEarnings = (bookings || []).reduce(
          (sum: number, b: { washer_payout: number }) => sum + b.washer_payout,
          0
        );

        const wp = Array.isArray(washer.washer_profiles)
          ? washer.washer_profiles[0]
          : washer.washer_profiles;

        payouts.push({
          id: washer.id,
          full_name: washer.full_name,
          email: washer.email,
          stripe_account_id: wp?.stripe_account_id || null,
          pending_earnings: pendingEarnings,
          completed_jobs: (bookings || []).length,
        });
      }

      // Sort by pending earnings descending
      payouts.sort((a, b) => b.pending_earnings - a.pending_earnings);
      setWashers(payouts);
      setLoading(false);
    }

    fetchPayouts();
  }, [supabase]);

  const handlePayout = async (washerId: string) => {
    setProcessingId(washerId);

    // In production, this would call /api/admin/payouts to trigger Stripe Connect transfer
    const response = await fetch('/api/admin/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ washer_id: washerId }),
    });

    if (response.ok) {
      // Update the local state — mark earnings as paid
      setWashers((prev) =>
        prev.map((w) =>
          w.id === washerId
            ? { ...w, pending_earnings: 0, completed_jobs: 0 }
            : w
        )
      );
    }

    setProcessingId(null);
  };

  const totalPending = washers.reduce((sum, w) => sum + w.pending_earnings, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-[#E23232]" />
            <h1 className="text-2xl font-bold">Payouts</h1>
          </div>
          <Card className="bg-[#0a0a0a] border-[#E23232]/30">
            <CardContent className="px-4 py-2">
              <p className="text-xs text-white/40">Total Pending</p>
              <p className="text-lg font-bold text-[#E23232]">
                ${(totalPending / 100).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : washers.length === 0 ? (
          <Card className="bg-[#0a0a0a] border-white/10">
            <CardContent className="py-12 text-center">
              <p className="text-white/40">No washers found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {washers.map((washer) => (
              <Card
                key={washer.id}
                className="bg-[#0a0a0a] border-white/10"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <User className="w-5 h-5 text-white/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">
                            {washer.full_name}
                          </p>
                          {!washer.stripe_account_id && (
                            <span className="flex items-center gap-1 text-xs text-orange-400">
                              <AlertCircle className="w-3 h-3" />
                              No Stripe
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 truncate">
                          {washer.email}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">
                          {washer.completed_jobs} completed jobs pending payout
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          ${(washer.pending_earnings / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-white/30">pending</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePayout(washer.id)}
                        disabled={
                          washer.pending_earnings === 0 ||
                          !washer.stripe_account_id ||
                          processingId === washer.id
                        }
                        className="bg-[#E23232] hover:bg-[#E23232]/80 text-white disabled:opacity-30"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        {processingId === washer.id ? 'Sending...' : 'Payout'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
