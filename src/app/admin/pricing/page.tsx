'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Save, DollarSign, Car, Gauge } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PlanPricing {
  id: string;
  name: string;
  slug: string;
  wash_plan: string;
  monthly_price: number;
  washes_per_month: number;
}

// From DRIVEO_ARCHITECTURE.md
const VEHICLE_MULTIPLIERS = [
  { type: 'Sedan / Coupe', key: 'sedan', multiplier: 1.0 },
  { type: 'Crossover', key: 'crossover', multiplier: 1.15 },
  { type: 'SUV', key: 'suv', multiplier: 1.25 },
  { type: 'Minivan', key: 'minivan', multiplier: 1.25 },
  { type: 'Pickup', key: 'pickup', multiplier: 1.2 },
  { type: 'Large SUV / Truck', key: 'large_suv', multiplier: 1.4 },
];

const DIRT_MULTIPLIERS = [
  { level: '0-5', multiplier: 1.0, description: 'Light to normal' },
  { level: '6', multiplier: 1.15, description: 'Moderately dirty' },
  { level: '7', multiplier: 1.3, description: 'Dirty' },
  { level: '8', multiplier: 1.5, description: 'Very dirty' },
  { level: '9', multiplier: 1.75, description: 'Heavily soiled' },
  { level: '10', multiplier: 2.0, description: 'Extreme' },
];

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PlanPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicleMults, setVehicleMults] = useState(VEHICLE_MULTIPLIERS);
  const [dirtMults, setDirtMults] = useState(DIRT_MULTIPLIERS);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPricing() {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order');

      if (data) setPlans(data as PlanPricing[]);
      setLoading(false);
    }

    fetchPricing();
  }, [supabase]);

  const updatePlanPrice = (id: string, cents: number) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, monthly_price: cents } : p))
    );
  };

  const updateVehicleMult = (key: string, value: number) => {
    setVehicleMults((prev) =>
      prev.map((v) => (v.key === key ? { ...v, multiplier: value } : v))
    );
  };

  const updateDirtMult = (level: string, value: number) => {
    setDirtMults((prev) =>
      prev.map((d) => (d.level === level ? { ...d, multiplier: value } : d))
    );
  };

  const handleSave = async () => {
    setSaving(true);

    // Update plan prices in DB
    for (const plan of plans) {
      await supabase
        .from('subscription_plans')
        .update({ monthly_price: plan.monthly_price })
        .eq('id', plan.id);
    }

    // Vehicle and dirt multipliers would be stored in a config table or env
    // For now, this saves plan prices to the database
    setSaving(false);
  };

  const perWashPrice: Record<string, number> = {
    regular: 1800,
    interior_exterior: 2500,
    detailing: 18900,
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#E23232]" />
            <h1 className="text-2xl font-bold">Pricing Configuration</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#E23232] hover:bg-[#E23232]/80 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Base Plan Prices */}
            <Card className="bg-[#0a0a0a] border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#E23232]" />
                  Base Prices (per wash)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(perWashPrice).map(([plan, cents]) => (
                    <div
                      key={plan}
                      className="bg-white/5 rounded-lg p-4 border border-white/5"
                    >
                      <Label className="text-white/50 text-xs uppercase tracking-wide">
                        {plan === 'interior_exterior'
                          ? 'Interior & Exterior'
                          : plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </Label>
                      <p className="text-2xl font-bold text-white mt-1">
                        ${(cents / 100).toFixed(0)}
                      </p>
                      <p className="text-xs text-white/30 mt-1">per wash</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Subscription Prices */}
            <Card className="bg-[#0a0a0a] border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#E23232]" />
                  Monthly Subscription Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/5"
                    >
                      <div>
                        <p className="font-medium text-white">{plan.name}</p>
                        <p className="text-xs text-white/30">
                          {plan.washes_per_month} washes/month
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/40">$</span>
                        <Input
                          type="number"
                          value={(plan.monthly_price / 100).toFixed(0)}
                          onChange={(e) =>
                            updatePlanPrice(
                              plan.id,
                              Math.round(parseFloat(e.target.value) * 100) || 0
                            )
                          }
                          className="w-24 bg-white/5 border-white/10 text-white text-right"
                        />
                        <span className="text-white/40 text-sm">/mo</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Multipliers */}
            <Card className="bg-[#0a0a0a] border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#E23232]" />
                  Vehicle Type Multipliers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vehicleMults.map((v) => (
                    <div
                      key={v.key}
                      className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/5"
                    >
                      <span className="text-sm text-white/70">{v.type}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.05"
                          value={v.multiplier}
                          onChange={(e) =>
                            updateVehicleMult(
                              v.key,
                              parseFloat(e.target.value) || 1
                            )
                          }
                          className="w-20 bg-white/5 border-white/10 text-white text-right text-sm"
                        />
                        <span className="text-white/30 text-sm">x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dirt Level Multipliers */}
            <Card className="bg-[#0a0a0a] border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-[#E23232]" />
                  Dirt Level Multipliers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dirtMults.map((d) => (
                    <div
                      key={d.level}
                      className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/5"
                    >
                      <div>
                        <span className="text-sm text-white/70">
                          Level {d.level}
                        </span>
                        <span className="text-xs text-white/30 ml-2">
                          ({d.description})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.05"
                          value={d.multiplier}
                          onChange={(e) =>
                            updateDirtMult(
                              d.level,
                              parseFloat(e.target.value) || 1
                            )
                          }
                          className="w-20 bg-white/5 border-white/10 text-white text-right text-sm"
                        />
                        <span className="text-white/30 text-sm">x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
