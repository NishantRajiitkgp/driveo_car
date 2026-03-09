'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Car, DollarSign, ChevronRight } from 'lucide-react';
import type { Booking } from '@/types';

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  en_route: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  arrived: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  washing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  disputed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const planLabel: Record<string, string> = {
  regular: 'Regular',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Detailing',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBookings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('*, vehicles(make, model, year, type)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBookings(data as Booking[]);
      }
      setLoading(false);
    }

    fetchBookings();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card className="bg-[#0a0a0a] border-white/10">
            <CardContent className="py-12 text-center">
              <p className="text-white/50">No bookings yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const vehicle = (booking as any).vehicles;
              return (
                <Link
                  key={booking.id}
                  href={`/app/track/${booking.id}`}
                  className="block"
                >
                  <Card className="bg-[#0a0a0a] border-white/10 hover:border-[#E23232]/40 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="outline"
                          className={statusColor[booking.status] || 'border-white/20 text-white/60'}
                        >
                          {booking.status.replace('_', ' ')}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#E23232] font-semibold">
                            {planLabel[booking.wash_plan] || booking.wash_plan}
                          </span>
                          <span className="text-white/30">|</span>
                          <span className="text-white/50">
                            Dirt Level {booking.dirt_level}
                          </span>
                        </div>

                        {vehicle && (
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <Car className="w-3.5 h-3.5" />
                            <span>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-white/40">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(booking.created_at).toLocaleDateString('en-CA', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-white font-medium">
                            <DollarSign className="w-3.5 h-3.5" />
                            {(booking.total_price / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
