'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_LABELS, centsToDisplay, formatDuration } from '@/lib/pricing';
import { toast } from 'sonner';
import {
  Car, MapPin, Phone, Navigation, Camera, Clock,
  DollarSign, CheckCircle2, Loader2, ArrowRight,
  User,
} from 'lucide-react';
import type { Booking, Profile, Vehicle, BookingPhoto } from '@/types';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface BookingWithDetails extends Booking {
  vehicles: Vehicle;
  profiles: Profile; // customer profile via customer_id
}

const statusFlow = [
  { status: 'assigned', label: 'Accept Job', action: 'en_route', icon: Navigation },
  { status: 'en_route', label: 'I\'ve Arrived', action: 'arrived', icon: MapPin },
  { status: 'arrived', label: 'Start Wash', action: 'washing', icon: Car },
  { status: 'washing', label: 'Mark Complete', action: 'completed', icon: CheckCircle2 },
];

const statusTimelineLabels: Record<string, string> = {
  assigned: 'Assigned',
  en_route: 'En Route',
  arrived: 'Arrived',
  washing: 'Washing',
  completed: 'Completed',
  paid: 'Paid',
};

const statusOrder = ['assigned', 'en_route', 'arrived', 'washing', 'completed', 'paid'];

export default function WasherJobPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [customer, setCustomer] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<BookingPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Send washer GPS location while en_route or washing
  useEffect(() => {
    if (!booking || !['en_route', 'arrived', 'washing'].includes(booking.status)) return;
    if (!navigator.geolocation) return;

    let active = true;
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        if (!active) return;
        try {
          await fetch('/api/washer/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
        } catch { /* silently fail */ }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => {
      active = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [booking?.status, booking?.id]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .eq('id', id)
        .single();

      if (bookingData) {
        setBooking(bookingData);

        // Get customer info
        const { data: customerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', bookingData.customer_id)
          .single();
        if (customerData) setCustomer(customerData);

        // Get photos
        const { data: photosData } = await supabase
          .from('booking_photos')
          .select('*')
          .eq('booking_id', bookingData.id)
          .order('created_at', { ascending: true });
        if (photosData) setPhotos(photosData);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(newStatus: string) {
    if (!booking) return;

    // Check photo requirements for completion
    if (newStatus === 'completed') {
      const afterPhotos = photos.filter((p) => p.photo_type === 'after');
      if (afterPhotos.length < 5) {
        toast.error(`Upload at least 5 after photos (${afterPhotos.length}/5)`);
        return;
      }
    }

    setUpdating(true);
    const supabase = createClient();

    const timestamps: Record<string, string> = {};
    if (newStatus === 'en_route') timestamps.washer_en_route_at = new Date().toISOString();
    if (newStatus === 'arrived') timestamps.washer_arrived_at = new Date().toISOString();
    if (newStatus === 'washing') timestamps.wash_started_at = new Date().toISOString();
    if (newStatus === 'completed') timestamps.wash_completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, ...timestamps })
      .eq('id', booking.id);

    if (error) {
      toast.error('Failed to update status');
      setUpdating(false);
      return;
    }

    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    setBooking((prev) => prev ? { ...prev, status: newStatus as Booking['status'], ...timestamps } : null);

    // Trigger payment capture when wash is completed
    if (newStatus === 'completed') {
      try {
        const captureRes = await fetch('/api/bookings/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id }),
        });

        if (captureRes.ok) {
          toast.success('Payment captured successfully');
          setBooking((prev) => prev ? { ...prev, payment_status: 'captured', status: 'paid' } : null);
        } else {
          const captureErr = await captureRes.json();
          console.error('Payment capture failed:', captureErr);
          toast.error('Wash completed, but payment capture failed. Admin will handle it.');
        }
      } catch (captureError) {
        console.error('Payment capture error:', captureError);
        toast.error('Wash completed, but payment capture failed. Admin will handle it.');
      }
    }

    setUpdating(false);
  }

  async function handlePhotoUpload(type: 'before' | 'after', files: FileList | null) {
    if (!files || !booking) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const angles = ['front', 'rear', 'driver_side', 'passenger_side', 'interior'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const angle = angles[photos.filter((p) => p.photo_type === type).length + i] || 'front';
      const path = `booking-photos/${booking.id}/${type}/${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('booking-photos')
        .upload(path, file, { contentType: 'image/jpeg' });

      if (uploadError) {
        toast.error(`Failed to upload photo: ${uploadError.message}`);
        continue;
      }

      const { error: insertError } = await supabase.from('booking_photos').insert({
        booking_id: booking.id,
        washer_id: user.id,
        photo_type: type,
        storage_path: path,
        angle_label: angle,
      });

      if (!insertError) {
        setPhotos((prev) => [...prev, {
          id: crypto.randomUUID(),
          booking_id: booking.id,
          washer_id: user.id,
          photo_type: type,
          storage_path: path,
          angle_label: angle as BookingPhoto['angle_label'],
          created_at: new Date().toISOString(),
        }]);
      }
    }
    toast.success('Photos uploaded');
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 max-w-lg mx-auto space-y-4">
        <div className="shimmer h-8 w-48 rounded-lg bg-white/5" />
        <div className="shimmer h-44 w-full rounded-2xl bg-white/5" />
        <div className="shimmer h-36 w-full rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="px-4 pt-20 text-center">
        <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#E23232]/5 blur-3xl pointer-events-none" />
          <p className="text-white/40 relative">Job not found</p>
        </div>
      </div>
    );
  }

  const vehicle = booking.vehicles;
  const beforePhotos = photos.filter((p) => p.photo_type === 'before');
  const afterPhotos = photos.filter((p) => p.photo_type === 'after');
  const currentAction = statusFlow.find((s) => s.status === booking.status);
  const currentStatusIdx = statusOrder.indexOf(booking.status);

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto space-y-5 animate-fade-in-up">
      {/* Status Header */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E23232]/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-display text-white tracking-tight">{PLAN_LABELS[booking.wash_plan]}</h1>
            <Badge variant="outline" className="capitalize rounded-full px-3 py-1 text-xs bg-[#E23232]/10 text-[#E23232] border-[#E23232]/30">
              {booking.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Timeline indicator */}
          <div className="flex items-center gap-1">
            {statusOrder.slice(0, 5).map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={cn(
                  'h-1 w-full rounded-full transition-all duration-500',
                  i <= currentStatusIdx
                    ? 'bg-[#E23232]'
                    : 'bg-white/[0.06]'
                )} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {statusOrder.slice(0, 5).map((s, i) => (
              <span key={s} className={cn(
                'text-[9px] uppercase tracking-wider',
                i <= currentStatusIdx ? 'text-[#E23232]/70' : 'text-white/20'
              )}>
                {statusTimelineLabels[s]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Info */}
      {customer && (
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3 font-medium">Customer</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/[0.03] flex items-center justify-center border border-white/[0.06]">
              <User className="w-5 h-5 text-white/40" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{customer.full_name}</p>
              <p className="text-white/35 text-xs mt-0.5">{customer.phone || customer.email}</p>
            </div>
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="w-10 h-10 rounded-full glass flex items-center justify-center border border-white/[0.08] hover:border-[#E23232]/30 hover:bg-[#E23232]/5 transition-all duration-300">
                <Phone className="w-4 h-4 text-white/50" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Vehicle & Location */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Job Details</p>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <Car className="w-4 h-4 text-white/40" />
            </div>
            <span className="text-white font-medium">{vehicle.year} {vehicle.make} {vehicle.model} <span className="text-white/30 font-normal">({vehicle.type.replace('_', ' ')})</span></span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white/40" />
            </div>
            <span className="text-white/60">{booking.service_address}</span>
          </div>

          {booking.location_notes && (
            <div className="ml-11 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <p className="text-amber-400/80 text-xs">{booking.location_notes}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <Clock className="w-4 h-4 text-white/40" />
            </div>
            <span className="text-white/45">~{formatDuration(booking.estimated_duration_min || 0)} · Dirt level {booking.dirt_level}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/[0.06] flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-400/60" />
            </div>
            <span className="text-green-400 font-semibold">You earn {centsToDisplay(booking.washer_payout)}</span>
          </div>

          <a
            href={`https://maps.google.com/?q=${booking.service_lat},${booking.service_lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-11 inline-flex items-center gap-1.5 text-[#E23232] text-xs hover:text-[#E23232]/80 transition-colors font-medium"
          >
            <Navigation className="w-3 h-3" /> Open in Google Maps
          </a>
        </div>
      </div>

      {/* Photo Upload */}
      {['arrived', 'washing', 'completed'].includes(booking.status) && (
        <div className="glass-card rounded-2xl p-5 space-y-5">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Photos</p>

          {/* Before Photos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-semibold">Before Photos <span className="text-white/30 font-normal">({beforePhotos.length}/5)</span></p>
              {booking.status === 'arrived' && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoUpload('before', e.target.files)}
                  />
                  <span className="flex items-center gap-1.5 text-[#E23232] text-xs font-medium px-3 py-1.5 rounded-full bg-[#E23232]/10 border border-[#E23232]/20 hover:bg-[#E23232]/15 transition-colors">
                    <Camera className="w-3 h-3" /> Take Photo
                  </span>
                </label>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'aspect-square rounded-xl border-2 border-dashed flex items-center justify-center text-[10px] font-medium transition-all duration-300',
                    i < beforePhotos.length
                      ? 'border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.1)]'
                      : 'border-white/[0.08] bg-white/[0.02] text-white/20 hover:border-white/15 hover:bg-white/[0.04] hover:shadow-[0_0_12px_rgba(255,255,255,0.03)]'
                  )}
                >
                  {i < beforePhotos.length ? '✓' : ['F', 'R', 'L', 'R', 'Int'][i]}
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.04]" />

          {/* After Photos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-semibold">After Photos <span className="text-white/30 font-normal">({afterPhotos.length}/5)</span></p>
              {booking.status === 'washing' && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoUpload('after', e.target.files)}
                  />
                  <span className="flex items-center gap-1.5 text-[#E23232] text-xs font-medium px-3 py-1.5 rounded-full bg-[#E23232]/10 border border-[#E23232]/20 hover:bg-[#E23232]/15 transition-colors">
                    <Camera className="w-3 h-3" /> Take Photo
                  </span>
                </label>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'aspect-square rounded-xl border-2 border-dashed flex items-center justify-center text-[10px] font-medium transition-all duration-300',
                    i < afterPhotos.length
                      ? 'border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.1)]'
                      : 'border-white/[0.08] bg-white/[0.02] text-white/20 hover:border-white/15 hover:bg-white/[0.04] hover:shadow-[0_0_12px_rgba(255,255,255,0.03)]'
                  )}
                >
                  {i < afterPhotos.length ? '✓' : ['F', 'R', 'L', 'R', 'Int'][i]}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Action Button */}
      {currentAction && (
        <Button
          onClick={() => updateStatus(currentAction.action)}
          disabled={updating || (currentAction.action === 'completed' && afterPhotos.length < 5)}
          className="w-full bg-gradient-to-r from-[#E23232] to-[#c92a2a] hover:from-[#c92a2a] hover:to-[#a82222] text-white font-semibold py-7 text-base rounded-2xl shadow-[0_0_30px_rgba(226,50,50,0.25)] hover:shadow-[0_0_40px_rgba(226,50,50,0.35)] transition-all duration-300 border-0"
        >
          {updating ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating...</>
          ) : (
            <>
              <currentAction.icon className="w-5 h-5 mr-2" />
              {currentAction.label}
              {currentAction.action === 'completed' && afterPhotos.length < 5 && (
                <span className="ml-2 text-xs opacity-60">({afterPhotos.length}/5 photos)</span>
              )}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
