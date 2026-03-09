'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { DriveoSlide } from '@/components/driveo-slide/DriveoSlide';
import { calculatePrice, centsToDisplay, formatDuration, PLAN_LABELS } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Car, MapPin, ChevronRight, ChevronLeft, Zap, CalendarDays, Sparkles,
  Clock, CreditCard, CheckCircle2, Loader2,
} from 'lucide-react';
import type { Vehicle, WashPlan, BookingFormData } from '@/types';

const STEPS = ['Vehicle', 'Location', 'Wash & Dirt', 'When', 'Confirm'];

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get('plan') as WashPlan | null;

  const [step, setStep] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<BookingFormData>({
    vehicleId: '',
    vehicle: null,
    address: '',
    lat: 0,
    lng: 0,
    locationNotes: '',
    washPlan: preselectedPlan || 'regular',
    dirtLevel: 5,
    isInstant: true,
    scheduledAt: null,
  });

  useEffect(() => {
    async function loadVehicles() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', user.id)
        .order('is_primary', { ascending: false });

      if (data && data.length > 0) {
        setVehicles(data);
        const primary = data.find((v) => v.is_primary) || data[0];
        setForm((f) => ({ ...f, vehicleId: primary.id, vehicle: primary }));
      }
      setLoading(false);
    }
    loadVehicles();
  }, []);

  const price = form.vehicle
    ? calculatePrice(form.washPlan, form.vehicle.type, form.dirtLevel)
    : null;

  function nextStep() {
    if (step === 0 && !form.vehicleId) {
      toast.error('Select a vehicle');
      return;
    }
    if (step === 1 && !form.address) {
      toast.error('Enter your address');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleBook() {
    if (!form.vehicle || !price) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: form.vehicleId,
          washPlan: form.washPlan,
          dirtLevel: form.dirtLevel,
          serviceAddress: form.address,
          serviceLat: form.lat,
          serviceLng: form.lng,
          locationNotes: form.locationNotes,
          isInstant: form.isInstant,
          scheduledAt: form.scheduledAt,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to create booking');
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      toast.success('Booking confirmed! Finding you a washer...');
      router.push(`/app/track/${data.bookingId}`);
    } catch {
      toast.error('Something went wrong');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#E23232] animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8 max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn(
                'h-1 w-full rounded-full transition-colors',
                i <= step ? 'bg-[#E23232]' : 'bg-white/10'
              )}
            />
            <span className={cn(
              'text-[10px]',
              i <= step ? 'text-white/60' : 'text-white/20'
            )}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Step 0: Vehicle */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-display text-white">What car are you washing?</h2>
          {vehicles.length === 0 ? (
            <Card className="bg-[#0a0a0a] border-dashed border-white/20">
              <CardContent className="p-6 text-center">
                <p className="text-white/40 text-sm mb-3">No vehicles saved yet</p>
                <Button onClick={() => router.push('/app/onboarding')} className="bg-[#E23232] text-white">
                  Add Vehicle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setForm((f) => ({ ...f, vehicleId: v.id, vehicle: v }))}
                  className={cn(
                    'w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all',
                    form.vehicleId === v.id
                      ? 'border-[#E23232] bg-[#E23232]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <Car className={cn('w-5 h-5', form.vehicleId === v.id ? 'text-[#E23232]' : 'text-white/40')} />
                  <div>
                    <p className="text-white text-sm font-medium">{v.year} {v.make} {v.model}</p>
                    <p className="text-white/40 text-xs capitalize">{v.type.replace('_', ' ')}{v.color ? ` · ${v.color}` : ''}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <Button onClick={nextStep} disabled={!form.vehicleId} className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white mt-2">
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-display text-white">Where is your car?</h2>
          <div className="space-y-3">
            <AddressAutocomplete
              value={form.address}
              onChange={(address, lat, lng) => setForm((f) => ({ ...f, address, lat, lng }))}
              placeholder="Enter your address"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            <Input
              placeholder="Notes (e.g. parking spot P2, gate code 1234)"
              value={form.locationNotes}
              onChange={(e) => setForm((f) => ({ ...f, locationNotes: e.target.value }))}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1 border-white/10 text-white hover:bg-white/5">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={nextStep} disabled={!form.address} className="flex-1 bg-[#E23232] hover:bg-[#c92a2a] text-white">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Driveo Slide + Plan */}
      {step === 2 && form.vehicle && (
        <div className="space-y-4">
          <DriveoSlide
            vehicleType={form.vehicle.type}
            vehicleImageUrl={form.vehicle.image_url || '/car-placeholder.svg'}
            vehicleLabel={`${form.vehicle.year} ${form.vehicle.make} ${form.vehicle.model}`}
            selectedPlan={form.washPlan}
            onPlanSelect={(plan) => setForm((f) => ({ ...f, washPlan: plan }))}
            onDirtLevelChange={(level) => setForm((f) => ({ ...f, dirtLevel: level }))}
            initialDirtLevel={form.dirtLevel}
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1 border-white/10 text-white hover:bg-white/5">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={nextStep} className="flex-1 bg-[#E23232] hover:bg-[#c92a2a] text-white">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: When */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-display text-white">When do you want it?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setForm((f) => ({ ...f, isInstant: true, scheduledAt: null }))}
              className={cn(
                'p-5 rounded-xl border text-center transition-all',
                form.isInstant
                  ? 'border-[#E23232] bg-[#E23232]/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <Zap className={cn('w-6 h-6 mx-auto mb-2', form.isInstant ? 'text-[#E23232]' : 'text-white/40')} />
              <p className={cn('text-sm font-semibold', form.isInstant ? 'text-white' : 'text-white/60')}>Now</p>
              <p className="text-white/30 text-xs mt-1">Next available washer</p>
            </button>
            <button
              onClick={() => setForm((f) => ({ ...f, isInstant: false }))}
              className={cn(
                'p-5 rounded-xl border text-center transition-all',
                !form.isInstant
                  ? 'border-[#E23232] bg-[#E23232]/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <CalendarDays className={cn('w-6 h-6 mx-auto mb-2', !form.isInstant ? 'text-[#E23232]' : 'text-white/40')} />
              <p className={cn('text-sm font-semibold', !form.isInstant ? 'text-white' : 'text-white/60')}>Schedule</p>
              <p className="text-white/30 text-xs mt-1">Pick date & time</p>
            </button>
          </div>

          {!form.isInstant && (
            <Input
              type="datetime-local"
              value={form.scheduledAt || ''}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className="bg-white/5 border-white/10 text-white"
            />
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1 border-white/10 text-white hover:bg-white/5">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!form.isInstant && !form.scheduledAt}
              className="flex-1 bg-[#E23232] hover:bg-[#c92a2a] text-white"
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && form.vehicle && price && (
        <div className="space-y-4">
          <h2 className="text-lg font-display text-white">Confirm your booking</h2>

          <Card className="bg-[#0a0a0a] border-white/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-white/40" />
                <span className="text-white text-sm">{form.vehicle.year} {form.vehicle.make} {form.vehicle.model}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-white/40" />
                <span className="text-white text-sm">{form.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-white/40" />
                <span className="text-white text-sm">{PLAN_LABELS[form.washPlan]} · Dirt level {form.dirtLevel}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-white/40" />
                <span className="text-white text-sm">
                  {form.isInstant ? 'Now — next available' : new Date(form.scheduledAt!).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-white/10">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">{price.planLabel}</span>
                <span className="text-white">{centsToDisplay(price.basePriceCents)}</span>
              </div>
              {price.vehicleMultiplier !== 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Vehicle ({price.vehicleMultiplier}x)</span>
                  <span className="text-white/70">+{centsToDisplay(Math.round(price.basePriceCents * (price.vehicleMultiplier - 1)))}</span>
                </div>
              )}
              {price.dirtMultiplier !== 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Dirt level {form.dirtLevel} ({price.dirtMultiplier}x)</span>
                  <span className="text-amber-400">+{centsToDisplay(Math.round(price.basePriceCents * price.vehicleMultiplier * (price.dirtMultiplier - 1)))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-white/50">HST (13%)</span>
                <span className="text-white/70">{centsToDisplay(price.hstCents)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                <span className="text-white">Total</span>
                <span className="text-[#E23232] text-lg">{centsToDisplay(price.totalCents)}</span>
              </div>
              <p className="text-white/30 text-[10px] flex items-center gap-1 pt-1">
                <CreditCard className="w-3 h-3" />
                Card pre-authorized. Charged only after wash is complete.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1 border-white/10 text-white hover:bg-white/5">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={handleBook}
              disabled={submitting}
              className="flex-1 bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Booking</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingForm />
    </Suspense>
  );
}
