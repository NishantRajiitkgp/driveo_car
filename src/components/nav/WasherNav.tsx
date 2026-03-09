'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, DollarSign, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/washer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/washer/jobs', label: 'Jobs', icon: ClipboardList },
  { href: '/washer/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/washer/availability', label: 'Schedule', icon: Clock },
  { href: '/washer/profile', label: 'Profile', icon: User },
];

export function WasherNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#050505]/70 backdrop-blur-2xl sticky top-0 z-50">
        <Link href="/washer/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Image src="/Driveo-logo.png" alt="Driveo" width={34} height={34} className="transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-[#E23232]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display text-xl text-white tracking-wide">DRIVEO</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#E23232] font-semibold bg-[#E23232]/10 px-2.5 py-1 rounded-lg border border-[#E23232]/20">Washer</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#E23232]/10 text-[#E23232]'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-2 pt-0">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/[0.06] rounded-2xl px-2 py-2 flex justify-around shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all duration-200 relative',
                  isActive ? 'text-[#E23232]' : 'text-white/35 active:scale-95'
                )}
              >
                <div className="relative">
                  <item.icon className={cn('w-5 h-5 transition-all', isActive && 'drop-shadow-[0_0_8px_rgba(226,50,50,0.6)]')} />
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E23232] shadow-[0_0_6px_rgba(226,50,50,0.8)]" />
                  )}
                </div>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
