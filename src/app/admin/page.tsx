'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { centsToDisplay, PLAN_LABELS } from '@/lib/pricing';
import {
  DollarSign, Users, UserCheck, CalendarDays,
  AlertTriangle, ChevronRight, Car, TrendingUp,
} from 'lucide-react';
import type { Booking, Vehicle } from '@/types';

export const dynamic = 'force-dynamic';

interface BookingWithVehicle extends Booking {
  vehicles: Vehicle;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeBookings: 0,
    washersOnline: 0,
    totalCustomers: 0,
    pendingApplications: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Parallel queries for dashboard stats
      const [
        revenueRes,
        activeRes,
        washersRes,
        customersRes,
        applicationsRes,
        pendingRes,
        recentRes,
      ] = await Promise.all([
        supabase.from('bookings').select('total_price').in('status', ['completed', 'paid']),
        supabase.from('bookings').select('id', { count: 'exact' }).in('status', ['assigned', 'en_route', 'arrived', 'washing']),
        supabase.from('washer_profiles').select('id', { count: 'exact' }).eq('is_online', true),
        supabase.from('customer_profiles').select('id', { count: 'exact' }),
        supabase.from('washer_profiles').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('bookings').select('*, vehicles(*)').order('created_at', { ascending: false }).limit(10),
      ]);

      const totalRevenue = (revenueRes.data || []).reduce((sum, b) => sum + (b.total_price || 0), 0);

      setStats({
        totalRevenue,
        activeBookings: activeRes.count || 0,
        washersOnline: washersRes.count || 0,
        totalCustomers: customersRes.count || 0,
        pendingApplications: applicationsRes.count || 0,
        pendingBookings: pendingRes.count || 0,
      });

      if (recentRes.data) setRecentBookings(recentRes.data as BookingWithVehicle[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 md:pt-0 pt-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 bg-white/5" />)}
        </div>
        <Skeleton className="h-64 bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:pt-0 pt-14">
      <h1 className="text-2xl font-display text-white">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-white/40 text-xs">Total Revenue</span>
            </div>
            <p className="text-white text-xl font-semibold">{centsToDisplay(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-4 h-4 text-blue-400" />
              <span className="text-white/40 text-xs">Active Washes</span>
            </div>
            <p className="text-white text-xl font-semibold">{stats.activeBookings}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span className="text-white/40 text-xs">Washers Online</span>
            </div>
            <p className="text-white text-xl font-semibold">{stats.washersOnline}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-white/40 text-xs">Customers</span>
            </div>
            <p className="text-white text-xl font-semibold">{stats.totalCustomers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.pendingApplications > 0 || stats.pendingBookings > 0) && (
        <div className="space-y-2">
          {stats.pendingApplications > 0 && (
            <Link href="/admin/washers">
              <Card className="bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer mb-2">
                <CardContent className="p-3 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-white text-sm flex-1">{stats.pendingApplications} washer application{stats.pendingApplications > 1 ? 's' : ''} pending</span>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </CardContent>
              </Card>
            </Link>
          )}
          {stats.pendingBookings > 0 && (
            <Link href="/admin/bookings">
              <Card className="bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer">
                <CardContent className="p-3 flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm flex-1">{stats.pendingBookings} booking{stats.pendingBookings > 1 ? 's' : ''} awaiting washer</span>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-[#E23232] text-xs hover:underline">View all</Link>
        </div>
        <Card className="bg-[#0a0a0a] border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">
                      {PLAN_LABELS[b.wash_plan]}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        b.status === 'pending' ? 'text-yellow-400 border-yellow-500/30' :
                        ['assigned', 'en_route', 'arrived', 'washing'].includes(b.status) ? 'text-blue-400 border-blue-500/30' :
                        ['completed', 'paid'].includes(b.status) ? 'text-green-400 border-green-500/30' :
                        'text-white/40 border-white/20'
                      }
                    >
                      {b.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-white/30 text-xs mt-0.5 truncate">
                    {b.vehicles?.year} {b.vehicles?.make} {b.vehicles?.model} · {b.service_address}
                  </p>
                </div>
                <span className="text-white/70 text-sm font-medium whitespace-nowrap">
                  {centsToDisplay(b.total_price)}
                </span>
                <span className="text-white/30 text-xs whitespace-nowrap">
                  {new Date(b.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <div className="p-8 text-center text-white/30 text-sm">No bookings yet</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
