'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Car, CalendarDays, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/app/home', label: 'Home', icon: Home },
  { href: '/app/book', label: 'Book', icon: Car },
  { href: '/app/bookings', label: 'My Washes', icon: CalendarDays },
  { href: '/app/notifications', label: 'Alerts', icon: Bell },
  { href: '/app/profile', label: 'Profile', icon: User },
];

export function CustomerNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/app/home" className="flex items-center gap-2">
          <Image src="/Driveo-logo.png" alt="Driveo" width={32} height={32} />
          <span className="font-display text-xl text-white tracking-wide">DRIVEO</span>
        </Link>
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 text-sm transition-colors',
                pathname.startsWith(item.href)
                  ? 'text-[#E23232]'
                  : 'text-white/60 hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 px-2 py-2 flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 text-[10px] transition-colors',
                isActive ? 'text-[#E23232]' : 'text-white/40'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_6px_#E23232]')} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
