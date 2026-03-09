'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCheck,
  DollarSign,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/washers', label: 'Washers', icon: UserCheck },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/payouts', label: 'Payouts', icon: DollarSign },
  { href: '/admin/pricing', label: 'Pricing', icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: (typeof navItems)[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-2">
        <Image src="/Driveo-logo.png" alt="Driveo" width={28} height={28} />
        <span className="font-display text-lg text-white tracking-wide">DRIVEO</span>
        <span className="text-[9px] uppercase tracking-widest text-[#E23232] font-semibold bg-[#E23232]/10 px-1.5 py-0.5 rounded ml-1">Admin</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              isActive(item)
                ? 'bg-[#E23232]/10 text-[#E23232]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/10 z-40">
        {navContent}
      </aside>

      {/* Mobile header + drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/Driveo-logo.png" alt="Driveo" width={24} height={24} />
          <span className="font-display text-base text-white">DRIVEO</span>
          <span className="text-[8px] uppercase tracking-widest text-[#E23232]">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/60">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80" onClick={() => setMobileOpen(false)}>
          <aside
            className="w-64 h-full bg-[#0a0a0a] border-r border-white/10 pt-14"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
