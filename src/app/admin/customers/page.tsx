'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Users, Search, Car, ClipboardList, Mail } from 'lucide-react';

interface CustomerRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  vehicles: { id: string }[];
  bookings: { id: string }[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, created_at, vehicles(id), bookings:bookings!bookings_customer_id_fkey(id)')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCustomers(data as CustomerRow[]);
      }
      setLoading(false);
    }

    fetchCustomers();
  }, [supabase]);

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-[#E23232]" />
            <h1 className="text-2xl font-bold">Customers</h1>
            <span className="text-sm text-white/40">({customers.length})</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-10 bg-[#0a0a0a] border-white/10 text-white placeholder:text-white/30"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-white/40 uppercase tracking-wide border-b border-white/10 mb-2">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2 text-center">Vehicles</div>
              <div className="col-span-2 text-center">Bookings</div>
              <div className="col-span-1 text-right">Joined</div>
            </div>

            {filtered.length === 0 ? (
              <Card className="bg-[#0a0a0a] border-white/10">
                <CardContent className="py-12 text-center">
                  <p className="text-white/40">No customers found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map((customer) => (
                  <Card
                    key={customer.id}
                    className="bg-[#0a0a0a] border-white/10 hover:border-white/20 transition-colors"
                  >
                    <CardContent className="p-4">
                      {/* Desktop */}
                      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4">
                          <p className="font-medium text-white">
                            {customer.full_name}
                          </p>
                          {customer.phone && (
                            <p className="text-xs text-white/30">{customer.phone}</p>
                          )}
                        </div>
                        <div className="col-span-3 text-sm text-white/60 truncate">
                          {customer.email}
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="inline-flex items-center gap-1 text-sm text-white/60">
                            <Car className="w-3.5 h-3.5" />
                            {customer.vehicles.length}
                          </span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="inline-flex items-center gap-1 text-sm text-white/60">
                            <ClipboardList className="w-3.5 h-3.5" />
                            {customer.bookings.length}
                          </span>
                        </div>
                        <div className="col-span-1 text-right text-xs text-white/30">
                          {new Date(customer.created_at).toLocaleDateString(
                            'en-CA',
                            { month: 'short', day: 'numeric' }
                          )}
                        </div>
                      </div>

                      {/* Mobile */}
                      <div className="md:hidden">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-white">
                            {customer.full_name}
                          </p>
                          <span className="text-xs text-white/30">
                            {new Date(customer.created_at).toLocaleDateString(
                              'en-CA',
                              { month: 'short', day: 'numeric' }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/50 mb-2">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            {customer.vehicles.length} vehicles
                          </span>
                          <span className="flex items-center gap-1">
                            <ClipboardList className="w-3 h-3" />
                            {customer.bookings.length} bookings
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
