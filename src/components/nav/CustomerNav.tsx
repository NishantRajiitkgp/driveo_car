'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Car, CalendarDays, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/app/home', label: 'Home', icon: Home },
  { href: '/app/book', label: 'Book', icon: Car },
  { href: '/app/bookings', label: 'Washes', icon: CalendarDays },
  { href: '/app/notifications', label: 'Alerts', icon: Bell },
  { href: '/app/profile', label: 'Profile', icon: User },
];

export function CustomerNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center justify-between px-8 h-16 border-b border-white/[0.08] bg-[#0a0a0a] sticky top-0 z-50">
        <Link href="/app/home" className="flex items-center gap-2.5">
          <Image src="/Driveo-logo.png" alt="Driveo" width={32} height={32} />
          <span className="font-display text-xl text-white tracking-wide">DRIVEO</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#E23232] text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom nav — solid, clean */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#0a0a0a]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-colors',
                  isActive ? 'text-[#E23232]' : 'text-white/40 active:text-white/60'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
