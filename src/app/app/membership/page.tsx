'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Check, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  wash_plan: string;
  monthly_price: number;
  washes_per_month: number;
  description: string | null;
  is_active: boolean;
  display_order: number;
  stripe_price_id: string | null;
}

interface SubscriptionData {
  id: string;
  planId: string;
  vehicleId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: Plan;
}

interface UsageData {
  allocated: number;
  used: number;
  periodStart: string;
  periodEnd: string;
}

// Static plan definitions for display when DB plans aren't loaded yet
const PLAN_DISPLAY: {
  slug: string;
  name: string;
  pricePerWash: number;
  monthlyTotal: number;
  washPlan: string;
  features: string[];
}[] = [
  {
    slug: 'regular',
    name: 'Regular',
    pricePerWash: 18,
    monthlyTotal: 144,
    washPlan: 'regular',
    features: [
      '$18 per wash',
      '8 washes per month',
      'Exterior hand wash',
      'Tire & rim cleaning',
      'Window cleaning',
    ],
  },
  {
    slug: 'interior_exterior',
    name: 'Interior & Exterior',
    pricePerWash: 25,
    monthlyTotal: 200,
    washPlan: 'interior_exterior',
    features: [
      '$25 per wash',
      '8 washes per month',
      'Full exterior wash',
      'Interior vacuum & wipe',
      'Dashboard & console detail',
    ],
  },
  {
    slug: 'detailing',
    name: 'Detailing',
    pricePerWash: 189,
    monthlyTotal: 1512,
    washPlan: 'detailing',
    features: [
      '$189 per wash',
      '8 washes per month',
      'Full paint correction',
      'Clay bar treatment',
      'Interior deep clean',
    ],
  },
];

const planIcons: Record<string, React.ReactNode> = {
  regular: <Sparkles className="w-6 h-6" />,
  interior_exterior: <Sparkles className="w-6 h-6" />,
  detailing: <Crown className="w-6 h-6" />,
};

export default function MembershipPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchUsage();
  }, []);

  async function fetchUsage() {
    try {
      const res = await fetch('/api/subscriptions/usage');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSubscription(data.subscription);
      setUsage(data.usage);
    } catch (err) {
      console.error('Failed to load subscription data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(planSlug: string) {
    // In a real flow, you'd also pick a vehicleId. For now we pass the slug
    // and the planId would come from the DB. This is a simplified flow.
    setSubscribing(planSlug);
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: planSlug, vehicleId: '' }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to subscribe');
        return;
      }
      // In production, use data.clientSecret with Stripe Elements to confirm payment
      // For now, refresh subscription data
      await fetchUsage();
    } catch (err) {
      console.error('Subscribe error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubscribing(null);
    }
  }

  async function handleCancel() {
    if (!subscription) return;
    if (
      !confirm(
        'Are you sure you want to cancel? Your subscription will remain active until the end of the current billing period.'
      )
    ) {
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to cancel');
        return;
      }
      await fetchUsage();
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E23232]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Membership</h1>
        <p className="text-white/50 text-sm mb-8">
          8 washes per month, delivered to your door.
        </p>

        {/* Active Subscription Section */}
        {subscription && (
          <Card className="bg-[#0a0a0a] border-[#E23232]/30 mb-8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#E23232]/20 text-[#E23232]">
                    {planIcons[subscription.plan.wash_plan] || (
                      <Sparkles className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {subscription.plan.name}
                    </p>
                    <p className="text-sm text-white/40">
                      $
                      {(subscription.plan.monthly_price / 100).toFixed(0)}
                      /month
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    subscription.cancelAtPeriodEnd
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-green-500/20 text-green-400 border-green-500/30'
                  }
                >
                  {subscription.cancelAtPeriodEnd ? 'Cancelling' : 'Active'}
                </Badge>
              </div>

              {/* Usage Progress Bar */}
              {usage && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/50">Washes used</span>
                    <span className="text-white font-medium">
                      {usage.used} of {usage.allocated}
                    </span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E23232] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (usage.used / usage.allocated) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-white/30 mt-2">
                    {usage.allocated - usage.used} washes remaining this period
                  </p>
                </div>
              )}

              {/* Next Billing Date */}
              {subscription.currentPeriodEnd && (
                <p className="text-xs text-white/40">
                  {subscription.cancelAtPeriodEnd
                    ? 'Access ends '
                    : 'Next billing date: '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    'en-CA',
                    { month: 'long', day: 'numeric', year: 'numeric' }
                  )}
                </p>
              )}

              {/* Cancel Button */}
              {!subscription.cancelAtPeriodEnd && (
                <Button
                  variant="outline"
                  className="w-full mt-4 border-white/10 text-white/60 hover:text-white hover:border-white/20 bg-transparent"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Plan Cards */}
        {!subscription && (
          <>
            <h2 className="text-lg font-semibold mb-4">Choose Your Plan</h2>
            <div className="space-y-4">
              {PLAN_DISPLAY.map((plan) => (
                <Card
                  key={plan.slug}
                  className="bg-[#0a0a0a] border-white/10 hover:border-white/20 transition-colors"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/5 text-white/40">
                          {planIcons[plan.washPlan]}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {plan.name}
                          </p>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl font-bold text-white">
                              ${plan.monthlyTotal}
                            </span>
                            <span className="text-sm text-white/40">/mo</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-white/10 text-white/50 text-xs"
                      >
                        ${plan.pricePerWash}/wash
                      </Badge>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-white/60"
                        >
                          <Check className="w-3.5 h-3.5 text-[#E23232] shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full bg-[#E23232] hover:bg-[#E23232]/80 text-white"
                      onClick={() => handleSubscribe(plan.slug)}
                      disabled={subscribing !== null}
                    >
                      {subscribing === plan.slug ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
