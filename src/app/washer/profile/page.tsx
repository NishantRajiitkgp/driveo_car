'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Star, MapPin, Wrench, Briefcase, Car } from 'lucide-react';

interface WasherProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  washer_profiles: {
    status: string;
    bio: string | null;
    service_zones: string[] | null;
    vehicle_make: string | null;
    vehicle_model: string | null;
    vehicle_year: number | null;
    tools_owned: string[] | null;
    rating_avg: number;
    jobs_completed: number;
    is_online: boolean;
  } | null;
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function WasherProfilePage() {
  const [profile, setProfile] = useState<WasherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*, washer_profiles(*)')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data as WasherProfile);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <Skeleton className="h-64 w-full bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  const wp = profile?.washer_profiles;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Washer Profile</h1>

        {/* Header Card */}
        <Card className="bg-[#0a0a0a] border-white/10 mb-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#E23232]/20 flex items-center justify-center">
                <User className="w-8 h-8 text-[#E23232]" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{profile?.full_name}</p>
                <div className="flex items-center gap-3 mt-1">
                  {wp && (
                    <Badge
                      variant="outline"
                      className={statusColor[wp.status] || 'border-white/20'}
                    >
                      {wp.status}
                    </Badge>
                  )}
                  {wp?.is_online && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      Online
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            {wp && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-[#E23232] mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-lg">
                      {Number(wp.rating_avg).toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">Rating</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-white mb-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-bold text-lg">{wp.jobs_completed}</span>
                  </div>
                  <p className="text-xs text-white/40">Jobs Done</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bio */}
        {wp?.bio && (
          <Card className="bg-[#0a0a0a] border-white/10 mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/50 uppercase tracking-wide">
                Bio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">{wp.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Service Zones */}
        {wp?.service_zones && wp.service_zones.length > 0 && (
          <Card className="bg-[#0a0a0a] border-white/10 mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/50 uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Service Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {wp.service_zones.map((zone) => (
                  <Badge
                    key={zone}
                    variant="outline"
                    className="border-white/10 text-white/60"
                  >
                    {zone}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle */}
        {wp?.vehicle_make && (
          <Card className="bg-[#0a0a0a] border-white/10 mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/50 uppercase tracking-wide flex items-center gap-2">
                <Car className="w-4 h-4" />
                Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">
                {wp.vehicle_year} {wp.vehicle_make} {wp.vehicle_model}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tools */}
        {wp?.tools_owned && wp.tools_owned.length > 0 && (
          <Card className="bg-[#0a0a0a] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/50 uppercase tracking-wide flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Tools Owned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {wp.tools_owned.map((tool) => (
                  <Badge
                    key={tool}
                    variant="outline"
                    className="border-[#E23232]/30 text-[#E23232]/80"
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
