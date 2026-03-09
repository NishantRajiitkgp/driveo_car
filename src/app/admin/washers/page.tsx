'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UserCheck, UserX, Star, MapPin, MessageSquare, Mail } from 'lucide-react';
import type { Profile, WasherProfile } from '@/types';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface WasherFull extends Profile {
  washer_profiles: WasherProfile;
}

export default function AdminWashersPage() {
  const [washers, setWashers] = useState<WasherFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [queryWasherId, setQueryWasherId] = useState('');
  const [queryMessage, setQueryMessage] = useState('');

  async function loadWashers() {
    const res = await fetch('/api/admin/washers');
    const data = await res.json();
    let list = (data.washers || []).filter((w: WasherFull) => w.washer_profiles);
    if (filter !== 'all') {
      list = list.filter((w: WasherFull) => w.washer_profiles.status === filter);
    }
    setWashers(list);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    loadWashers();
  }, [filter]);

  async function updateWasherStatus(washerId: string, status: string, message?: string) {
    const res = await fetch('/api/admin/washers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ washerId, status, query_message: message }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || 'Failed to update status');
    } else {
      toast.success(status === 'query' ? 'Query sent to washer' : `Washer ${status}`);
      loadWashers();
    }
  }

  function openQuery(washerId: string) {
    setQueryWasherId(washerId);
    setQueryMessage('');
    setQueryDialogOpen(true);
  }

  function submitQuery() {
    if (!queryMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    updateWasherStatus(queryWasherId, 'query', queryMessage);
    setQueryDialogOpen(false);
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
                            wp.status === 'suspended' || wp.status === 'rejected' ? 'text-red-400 border-red-500/30' :
                            wp.status === 'query' ? 'text-blue-400 border-blue-500/30' :
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
                      {wp.bio && (
                        <p className="text-white/30 text-xs mt-1 line-clamp-2">{wp.bio}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-white/30 text-xs">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" /> {wp.rating_avg?.toFixed(1) || '—'}
                        </span>
                        <span>{wp.jobs_completed} washes</span>
                        {wp.service_zones && wp.service_zones.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {wp.service_zones.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      {(wp.status === 'pending' || wp.status === 'query') && (
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openQuery(w.id)}
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" /> Query
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
                      {(wp.status === 'suspended' || wp.status === 'rejected') && (
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

      {/* Query Dialog */}
      <Dialog open={queryDialogOpen} onOpenChange={setQueryDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              Send Query to Washer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/50 text-sm">This message will be sent to the washer via email and saved as admin notes.</p>
            <textarea
              value={queryMessage}
              onChange={(e) => setQueryMessage(e.target.value)}
              placeholder="e.g., Please provide a clearer photo of your government ID..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setQueryDialogOpen(false)} className="border-white/10 text-white/60">
                Cancel
              </Button>
              <Button onClick={submitQuery} className="bg-blue-600 hover:bg-blue-700 text-white">
                Send Query
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
