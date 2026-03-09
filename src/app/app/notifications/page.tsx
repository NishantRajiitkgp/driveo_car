'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellOff, CheckCheck } from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
      setLoading(false);
    }

    fetchNotifications();
  }, [supabase]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some((n) => !n.is_read) && (
            <span className="text-xs text-white/40">
              {notifications.filter((n) => !n.is_read).length} unread
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="bg-[#0a0a0a] border-white/10">
            <CardContent className="py-16 text-center">
              <BellOff className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No notifications</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                onClick={() => {
                  if (!notification.is_read) markAsRead(notification.id);
                }}
                className={`bg-[#0a0a0a] border-white/10 cursor-pointer transition-colors ${
                  !notification.is_read
                    ? 'border-l-2 border-l-[#E23232]'
                    : 'opacity-60'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 p-2 rounded-full shrink-0 ${
                        !notification.is_read
                          ? 'bg-[#E23232]/20 text-[#E23232]'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {notification.is_read ? (
                        <CheckCheck className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${
                            !notification.is_read ? 'text-white' : 'text-white/60'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <span className="text-xs text-white/30 shrink-0">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
