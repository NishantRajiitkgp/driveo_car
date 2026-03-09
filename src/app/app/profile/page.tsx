'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Phone, Copy, Check, Pencil, Save } from 'lucide-react';

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  customer_profiles: {
    referral_code: string | null;
    default_address: string | null;
  } | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*, customer_profiles(*)')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data as ProfileData);
        setForm({ full_name: data.full_name, phone: data.phone || '' });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [supabase]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, full_name: form.full_name, phone: form.phone });
      setEditing(false);
    }
    setSaving(false);
  };

  const copyReferral = () => {
    const code = profile?.customer_profiles?.referral_code;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Pencil className="w-3.5 h-3.5 mr-2" />
              Edit
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#E23232] hover:bg-[#E23232]/80 text-white"
            >
              <Save className="w-3.5 h-3.5 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>

        <Card className="bg-[#0a0a0a] border-white/10 mb-4">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-[#E23232]/20 flex items-center justify-center">
                <User className="w-8 h-8 text-[#E23232]" />
              </div>
              <div>
                <p className="text-lg font-semibold">{profile?.full_name}</p>
                <p className="text-sm text-white/40">Customer</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white/50 text-xs uppercase tracking-wide">
                  Full Name
                </Label>
                {editing ? (
                  <Input
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                ) : (
                  <p className="mt-1 text-white">{profile?.full_name}</p>
                )}
              </div>

              <div>
                <Label className="text-white/50 text-xs uppercase tracking-wide">
                  Email
                </Label>
                <div className="flex items-center gap-2 mt-1 text-white/80">
                  <Mail className="w-4 h-4 text-white/40" />
                  <span>{profile?.email}</span>
                </div>
              </div>

              <div>
                <Label className="text-white/50 text-xs uppercase tracking-wide">
                  Phone
                </Label>
                {editing ? (
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+1 (416) 555-0123"
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1 text-white/80">
                    <Phone className="w-4 h-4 text-white/40" />
                    <span>{profile?.phone || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {profile?.customer_profiles?.referral_code && (
          <Card className="bg-[#0a0a0a] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/50 uppercase tracking-wide">
                Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-lg font-mono text-[#E23232] tracking-widest">
                  {profile.customer_profiles.referral_code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyReferral}
                  className="border-white/10 text-white hover:bg-white/5 shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-white/30 mt-2">
                Share this code with friends to earn rewards
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
