'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { centsToDisplay, PLAN_LABELS } from '@/lib/pricing';
import type { Booking, Vehicle, Profile } from '@/types';

interface BookingFull extends Booking {
  vehicles: Vehicle;
  profiles: Profile;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let query = supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      if (data) setBookings(data as BookingFull[]);
      setLoading(false);
    }
    setLoading(true);
    load();
  }, [filter]);

  return (
    <div className="space-y-6 md:pt-0 pt-14">
      <h1 className="text-2xl font-display text-white">Bookings</h1>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-[#E23232] data-[state=active]:text-white">All</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-[#E23232] data-[state=active]:text-white">Pending</TabsTrigger>
          <TabsTrigger value="assigned" className="text-xs data-[state=active]:bg-[#E23232] data-[state=active]:text-white">Active</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs data-[state=active]:bg-[#E23232] data-[state=active]:text-white">Done</TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs data-[state=active]:bg-[#E23232] data-[state=active]:text-white">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 bg-white/5" />)}
        </div>
      ) : (
        <Card className="bg-[#0a0a0a] border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Vehicle</th>
                  <th className="text-left p-3">Dirt</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-right p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-white/50 font-mono text-xs">#{b.id.slice(0, 8)}</td>
                    <td className="p-3 text-white">{PLAN_LABELS[b.wash_plan]}</td>
                    <td className="p-3 text-white/60">{b.vehicles?.year} {b.vehicles?.make} {b.vehicles?.model}</td>
                    <td className="p-3 text-white/50">{b.dirt_level}/10</td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={
                          b.status === 'pending' ? 'text-yellow-400 border-yellow-500/30' :
                          ['assigned', 'en_route', 'arrived', 'washing'].includes(b.status) ? 'text-blue-400 border-blue-500/30' :
                          ['completed', 'paid'].includes(b.status) ? 'text-green-400 border-green-500/30' :
                          b.status === 'cancelled' ? 'text-red-400 border-red-500/30' :
                          'text-white/40'
                        }
                      >
                        {b.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-right text-white font-medium">{centsToDisplay(b.total_price)}</td>
                    <td className="p-3 text-right text-white/30 text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-white/30">No bookings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
