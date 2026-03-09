'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_LABELS, centsToDisplay, formatDuration } from '@/lib/pricing';
import { Car, MapPin, Phone, MessageCircle, Clock, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type { Booking, Profile, WasherProfile, Vehicle } from '@/types';
import { cn } from '@/lib/utils';
import LiveTrackingMap from '@/components/LiveTrackingMap';

interface BookingWithRelations extends Booking {
  vehicles: Vehicle;
}

const STATUS_ORDER = ['pending', 'assigned', 'en_route', 'arrived', 'washing', 'completed', 'paid'] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: 'Finding a washer',
  assigned: 'Washer assigned',
  en_route: 'Washer en route',
  arrived: 'Washer arrived',
  washing: 'Wash in progress',
  completed: 'Wash complete',
  paid: 'Payment processed',
  cancelled: 'Cancelled',
};

export default function TrackingPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [washer, setWasher] = useState<(Profile & { washer_profiles: WasherProfile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [washerLat, setWasherLat] = useState<number | null>(null);
  const [washerLng, setWasherLng] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .eq('id', id)
        .single();

      if (data) {
        setBooking(data);
        if (data.washer_id) {
          const { data: washerData } = await supabase
            .from('profiles')
            .select('*, washer_profiles(*)')
            .eq('id', data.washer_id)
            .single();
          if (washerData) {
            setWasher(washerData);
            setWasherLat(washerData.washer_profiles?.current_lat ?? null);
            setWasherLng(washerData.washer_profiles?.current_lng ?? null);
          }
        }
      }
      setLoading(false);
    }
    load();

    // Subscribe to real-time booking updates
    const supabase = createClient();
    const bookingChannel = supabase
      .channel(`booking:${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${id}`,
      }, (payload) => {
        setBooking((prev) => prev ? { ...prev, ...payload.new } as BookingWithRelations : null);
      })
      .subscribe();

    return () => { supabase.removeChannel(bookingChannel); };
  }, [id]);

  // Subscribe to washer location updates in real-time
  useEffect(() => {
    if (!booking?.washer_id) return;

    const supabase = createClient();
    const washerChannel = supabase
      .channel(`washer-location:${booking.washer_id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'washer_profiles',
        filter: `id=eq.${booking.washer_id}`,
      }, (payload) => {
        const updated = payload.new as WasherProfile;
        setWasherLat(updated.current_lat);
        setWasherLng(updated.current_lng);
      })
      .subscribe();

    return () => { supabase.removeChannel(washerChannel); };
  }, [booking?.washer_id]);

  if (loading) {
    return (
      <div className="px-4 pt-6 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48 bg-white/5" />
        <Skeleton className="h-48 w-full bg-white/5" />
        <Skeleton className="h-32 w-full bg-white/5" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="px-4 pt-20 text-center">
        <p className="text-white/40">Booking not found</p>
      </div>
    );
  }

  const currentStatusIdx = STATUS_ORDER.indexOf(booking.status as typeof STATUS_ORDER[number]);
  const vehicle = booking.vehicles;

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Badge
            className={cn(
              'text-xs',
              booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              booking.status === 'en_route' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              booking.status === 'washing' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
              ['completed', 'paid'].includes(booking.status) ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              'bg-white/10 text-white/60 border-white/20'
            )}
          >
            {booking.status === 'pending' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {STATUS_LABELS[booking.status]}
          </Badge>
        </div>
        <span className="text-white/30 text-xs">#{booking.id.slice(0, 8)}</span>
      </div>

      {/* Washer Info (if assigned) */}
      {washer && (
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E23232]/10 flex items-center justify-center text-[#E23232] font-display text-lg">
              {washer.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{washer.full_name}</p>
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <span>★ {washer.washer_profiles?.rating_avg?.toFixed(1) || '—'}</span>
                <span>·</span>
                <span>{washer.washer_profiles?.jobs_completed || 0} washes</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <Phone className="w-4 h-4 text-white/50" />
              </button>
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <MessageCircle className="w-4 h-4 text-white/50" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Map */}
      {['assigned', 'en_route', 'arrived', 'washing'].includes(booking.status) && (
        <LiveTrackingMap
          serviceLat={booking.service_lat}
          serviceLng={booking.service_lng}
          washerLat={washerLat}
          washerLng={washerLng}
          washerName={washer?.full_name || 'Washer'}
          status={booking.status}
        />
      )}

      {/* Status Timeline */}
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardContent className="p-4 space-y-0">
          {STATUS_ORDER.map((status, i) => {
            const isPast = i < currentStatusIdx;
            const isCurrent = i === currentStatusIdx;
            const timestamp = status === 'assigned' ? booking.washer_assigned_at :
              status === 'en_route' ? booking.washer_en_route_at :
              status === 'arrived' ? booking.washer_arrived_at :
              status === 'washing' ? booking.wash_started_at :
              status === 'completed' ? booking.wash_completed_at :
              status === 'paid' ? booking.payment_captured_at :
              booking.created_at;

            return (
              <div key={status} className="flex items-start gap-3 py-2">
                <div className="flex flex-col items-center">
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full bg-[#E23232] animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-white/15" />
                  )}
                  {i < STATUS_ORDER.length - 1 && (
                    <div className={cn('w-0.5 h-6', isPast ? 'bg-green-500/30' : 'bg-white/10')} />
                  )}
                </div>
                <div className="flex-1 flex justify-between items-start">
                  <span className={cn(
                    'text-sm',
                    isPast ? 'text-white/60' : isCurrent ? 'text-white font-medium' : 'text-white/20'
                  )}>
                    {STATUS_LABELS[status]}
                  </span>
                  {(isPast || isCurrent) && timestamp && (
                    <span className="text-white/30 text-xs">
                      {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardContent className="p-4 space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <Car className="w-4 h-4 text-white/30" />
            <span className="text-white/70">{vehicle.year} {vehicle.make} {vehicle.model}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-white/30" />
            <span className="text-white/70">{booking.service_address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-white/30" />
            <span className="text-white/70">~{formatDuration(booking.estimated_duration_min || 0)}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
            <span className="text-white/60">{PLAN_LABELS[booking.wash_plan]} · Dirt {booking.dirt_level}</span>
            <span className="text-[#E23232]">{centsToDisplay(booking.total_price)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
