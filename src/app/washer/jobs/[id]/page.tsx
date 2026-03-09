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

export default function WasherJobPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [customer, setCustomer] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<BookingPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
    } else {
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      setBooking((prev) => prev ? { ...prev, status: newStatus as Booking['status'], ...timestamps } : null);
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
        <Skeleton className="h-8 w-48 bg-white/5" />
        <Skeleton className="h-40 w-full bg-white/5" />
        <Skeleton className="h-32 w-full bg-white/5" />
      </div>
    );
  }

  if (!booking) {
    return <div className="px-4 pt-20 text-center text-white/40">Job not found</div>;
  }

  const vehicle = booking.vehicles;
  const beforePhotos = photos.filter((p) => p.photo_type === 'before');
  const afterPhotos = photos.filter((p) => p.photo_type === 'after');
  const currentAction = statusFlow.find((s) => s.status === booking.status);

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-display text-white">{PLAN_LABELS[booking.wash_plan]}</h1>
        <Badge variant="outline" className="capitalize">{booking.status.replace('_', ' ')}</Badge>
      </div>

      {/* Customer Info */}
      {customer && (
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-white/50" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{customer.full_name}</p>
              <p className="text-white/40 text-xs">{customer.phone || customer.email}</p>
            </div>
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="p-2 rounded-full bg-white/5 hover:bg-white/10">
                <Phone className="w-4 h-4 text-white/50" />
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vehicle & Location */}
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardContent className="p-4 space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Car className="w-4 h-4 text-white/30" />
            <span className="text-white">{vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.type.replace('_', ' ')})</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-white/30" />
            <span className="text-white/70">{booking.service_address}</span>
          </div>
          {booking.location_notes && (
            <p className="text-amber-400/80 text-xs pl-7">{booking.location_notes}</p>
          )}
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-white/30" />
            <span className="text-white/50">~{formatDuration(booking.estimated_duration_min || 0)} · Dirt level {booking.dirt_level}</span>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-green-500/50" />
            <span className="text-green-400 font-medium">You earn {centsToDisplay(booking.washer_payout)}</span>
          </div>
          <a
            href={`https://maps.google.com/?q=${booking.service_lat},${booking.service_lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#E23232] text-xs hover:underline pl-7"
          >
            <Navigation className="w-3 h-3" /> Open in Google Maps
          </a>
        </CardContent>
      </Card>

      {/* Photo Upload */}
      {['arrived', 'washing', 'completed'].includes(booking.status) && (
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-4 space-y-4">
            {/* Before Photos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm font-medium">Before Photos ({beforePhotos.length}/5)</p>
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
                    <span className="flex items-center gap-1 text-[#E23232] text-xs">
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
                      'aspect-square rounded-lg border flex items-center justify-center text-[10px]',
                      i < beforePhotos.length
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : 'border-white/10 bg-white/5 text-white/20'
                    )}
                  >
                    {i < beforePhotos.length ? '✓' : ['F', 'R', 'L', 'R', 'Int'][i]}
                  </div>
                ))}
              </div>
            </div>

            {/* After Photos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm font-medium">After Photos ({afterPhotos.length}/5)</p>
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
                    <span className="flex items-center gap-1 text-[#E23232] text-xs">
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
                      'aspect-square rounded-lg border flex items-center justify-center text-[10px]',
                      i < afterPhotos.length
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : 'border-white/10 bg-white/5 text-white/20'
                    )}
                  >
                    {i < afterPhotos.length ? '✓' : ['F', 'R', 'L', 'R', 'Int'][i]}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Action Button */}
      {currentAction && (
        <Button
          onClick={() => updateStatus(currentAction.action)}
          disabled={updating || (currentAction.action === 'completed' && afterPhotos.length < 5)}
          className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold py-6 text-base"
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
