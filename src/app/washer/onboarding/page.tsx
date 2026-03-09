'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  MapPin,
  Car,
  Wrench,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
} from 'lucide-react';

const STEPS = [
  { id: 'bio', label: 'About You', icon: FileText },
  { id: 'zones', label: 'Service Zones', icon: MapPin },
  { id: 'vehicle', label: 'Your Vehicle', icon: Car },
  { id: 'tools', label: 'Tools', icon: Wrench },
];

const AVAILABLE_ZONES = [
  { code: 'M8', area: 'Etobicoke (M8)' },
  { code: 'M9', area: 'Etobicoke (M9)' },
  { code: 'L4Z', area: 'Mississauga Central (L4Z)' },
  { code: 'L5B', area: 'Mississauga Central (L5B)' },
  { code: 'L5G', area: 'Mississauga East (L5G)' },
  { code: 'L5J', area: 'Mississauga East (L5J)' },
];

const TOOL_OPTIONS = [
  'Pressure washer',
  'Foam cannon',
  'Vacuum (wet/dry)',
  'Polisher / buffer',
  'Steam cleaner',
  'Microfiber towels',
  'Clay bar kit',
  'Detailing brushes',
  'Water tank (portable)',
  'Generator',
];

export default function WasherOnboardingPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  const [form, setForm] = useState({
    bio: '',
    service_zones: [] as string[],
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_plate: '',
    tools_owned: [] as string[],
  });

  const toggleZone = (code: string) => {
    setForm((prev) => ({
      ...prev,
      service_zones: prev.service_zones.includes(code)
        ? prev.service_zones.filter((z) => z !== code)
        : [...prev.service_zones, code],
    }));
  };

  const toggleTool = (tool: string) => {
    setForm((prev) => ({
      ...prev,
      tools_owned: prev.tools_owned.includes(tool)
        ? prev.tools_owned.filter((t) => t !== tool)
        : [...prev.tools_owned, tool],
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('washer_profiles').upsert({
      id: user.id,
      bio: form.bio,
      service_zones: form.service_zones,
      vehicle_make: form.vehicle_make,
      vehicle_model: form.vehicle_model,
      vehicle_year: form.vehicle_year ? parseInt(form.vehicle_year) : null,
      vehicle_plate: form.vehicle_plate,
      tools_owned: form.tools_owned,
      status: 'pending',
    });

    if (!error) {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return form.bio.trim().length >= 10;
      case 1:
        return form.service_zones.length > 0;
      case 2:
        return form.vehicle_make && form.vehicle_model && form.vehicle_year;
      case 3:
        return form.tools_owned.length > 0;
      default:
        return false;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <Card className="bg-[#0a0a0a] border-white/10 max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Application Submitted</h2>
            <p className="text-white/50 text-sm">
              Your washer profile is under review. We will notify you once
              approved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Become a Washer</h1>
        <p className="text-white/40 text-sm mb-8">
          Complete your profile to start accepting jobs
        </p>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i <= step
                    ? 'bg-[#E23232] text-white'
                    : 'bg-white/5 text-white/30'
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    i < step ? 'bg-[#E23232]' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-[#0a0a0a] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              {(() => {
                const Icon = STEPS[step].icon;
                return <Icon className="w-5 h-5 text-[#E23232]" />;
              })()}
              {STEPS[step].label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 0: Bio */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white/50 text-sm">
                    Tell us about yourself
                  </Label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Share your experience with car washing, detailing, or related work..."
                    rows={5}
                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#E23232]/50 resize-none"
                  />
                  <p className="text-xs text-white/30 mt-1">
                    Minimum 10 characters
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Service Zones */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-white/50 mb-4">
                  Select the areas where you want to work
                </p>
                {AVAILABLE_ZONES.map((zone) => {
                  const selected = form.service_zones.includes(zone.code);
                  return (
                    <button
                      key={zone.code}
                      onClick={() => toggleZone(zone.code)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-left ${
                        selected
                          ? 'bg-[#E23232]/10 border-[#E23232]/40 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin
                          className={`w-4 h-4 ${
                            selected ? 'text-[#E23232]' : 'text-white/30'
                          }`}
                        />
                        <span className="text-sm">{zone.area}</span>
                      </div>
                      {selected && <Check className="w-4 h-4 text-[#E23232]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Vehicle */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white/50 text-sm">Make</Label>
                  <Input
                    value={form.vehicle_make}
                    onChange={(e) =>
                      setForm({ ...form, vehicle_make: e.target.value })
                    }
                    placeholder="e.g., Toyota"
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white/50 text-sm">Model</Label>
                  <Input
                    value={form.vehicle_model}
                    onChange={(e) =>
                      setForm({ ...form, vehicle_model: e.target.value })
                    }
                    placeholder="e.g., Corolla"
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/50 text-sm">Year</Label>
                    <Input
                      type="number"
                      value={form.vehicle_year}
                      onChange={(e) =>
                        setForm({ ...form, vehicle_year: e.target.value })
                      }
                      placeholder="2020"
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/50 text-sm">
                      License Plate
                    </Label>
                    <Input
                      value={form.vehicle_plate}
                      onChange={(e) =>
                        setForm({ ...form, vehicle_plate: e.target.value })
                      }
                      placeholder="ABC 1234"
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Tools */}
            {step === 3 && (
              <div className="space-y-3">
                <p className="text-sm text-white/50 mb-4">
                  Select the tools you own and can bring to jobs
                </p>
                <div className="flex flex-wrap gap-2">
                  {TOOL_OPTIONS.map((tool) => {
                    const selected = form.tools_owned.includes(tool);
                    return (
                      <button
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                          selected
                            ? 'bg-[#E23232]/10 border-[#E23232]/40 text-[#E23232]'
                            : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1" />}
                        {tool}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="border-white/10 text-white hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="bg-[#E23232] hover:bg-[#E23232]/80 text-white disabled:opacity-30"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="bg-[#E23232] hover:bg-[#E23232]/80 text-white disabled:opacity-30"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
