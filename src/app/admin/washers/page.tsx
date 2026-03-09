'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { UserCheck, UserX, Star, MapPin } from 'lucide-react';
import type { Profile, WasherProfile } from '@/types';
import { cn } from '@/lib/utils';

interface WasherFull extends Profile {
  washer_profiles: WasherProfile;
}

export default function AdminWashersPage() {
  const [washers, setWashers] = useState<WasherFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  async function loadWashers() {
    const supabase = createClient();
    let query = supabase
      .from('profiles')
      .select('*, washer_profiles(*)')
      .eq('role', 'washer')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('washer_profiles.status', filter);
    }

    const { data } = await query;
    if (data) setWashers(data.filter((w) => w.washer_profiles) as WasherFull[]);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    loadWashers();
  }, [filter]);

  async function updateWasherStatus(washerId: string, status: 'approved' | 'suspended' | 'rejected') {
    const supabase = createClient();
    const { error } = await supabase
      .from('washer_profiles')
      .update({ status })
      .eq('id', washerId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Washer ${status}`);
      loadWashers();
    }
  }

  return (
    <div className="space-y-6 md:pt-0 pt-14">
      <h1 className="text-2xl font-display text-white">Washers</h1>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-[#E23232] data-[state=active]:text-white">All</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-[#E23232] data-[state=active]:text-white">Pending</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs data-[state=active]:bg-[#E23232] data-[state=active]:text-white">Approved</TabsTrigger>
          <TabsTrigger value="suspended" className="text-xs data-[state=active]:bg-[#E23232] data-[state=active]:text-white">Suspended</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 bg-white/5" />)}
        </div>
      ) : washers.length === 0 ? (
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-8 text-center text-white/30">No washers found</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {washers.map((w) => {
            const wp = w.washer_profiles;
            return (
              <Card key={w.id} className="bg-[#0a0a0a] border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 font-display text-lg shrink-0">
                      {w.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-medium">{w.full_name}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            wp.status === 'pending' ? 'text-yellow-400 border-yellow-500/30' :
                            wp.status === 'approved' ? 'text-green-400 border-green-500/30' :
                            wp.status === 'suspended' ? 'text-red-400 border-red-500/30' :
                            'text-white/40'
                          )}
                        >
                          {wp.status}
                        </Badge>
                        {wp.is_online && (
                          <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">online</span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs mt-0.5">{w.email} · {w.phone}</p>
                      <div className="flex items-center gap-4 mt-2 text-white/30 text-xs">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" /> {wp.rating_avg?.toFixed(1) || '—'}
                        </span>
                        <span>{wp.jobs_completed} washes</span>
                        {wp.service_zones.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {wp.service_zones.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {wp.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateWasherStatus(w.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          >
                            <UserCheck className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateWasherStatus(w.id, 'rejected')}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                          >
                            <UserX className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {wp.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateWasherStatus(w.id, 'suspended')}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                        >
                          Suspend
                        </Button>
                      )}
                      {wp.status === 'suspended' && (
                        <Button
                          size="sm"
                          onClick={() => updateWasherStatus(w.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
