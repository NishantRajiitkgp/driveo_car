'use client';

import { Menu } from 'lucide-react';
import { useCursor } from './CursorProvider';

export function Navbar() {
  const { setIsHovering } = useCursor();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-6">
        <div
          className="font-display text-2xl tracking-widest uppercase relative cursor-pointer inline-block"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          GLEAM
          <svg width="100%" height="10" viewBox="0 0 80 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -top-3 left-0 w-full">
            <path d="M2 8 C 15 1, 35 -1, 55 3 C 65 5, 75 7, 78 8" stroke="#E23232" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <span className="hidden lg:block font-mono text-[10px] text-white/40 uppercase tracking-widest border-l border-white/10 pl-6">Serving Etobicoke &amp; Mississauga</span>
      </div>
      <div className="hidden md:flex gap-8 font-mono text-xs uppercase tracking-widest">
        {['How It Works', 'Services', 'Plans', 'Reviews'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
            className="hover:text-[#E23232] transition-colors"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {item}
          </a>
        ))}
      </div>
      <button
        className="hidden md:block font-mono text-xs uppercase tracking-widest border border-white/30 px-6 py-3 rounded-full hover:bg-[#E23232] hover:border-[#E23232] hover:text-white transition-all"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        Book Your First Wash
      </button>
      <button className="md:hidden text-white"><Menu /></button>
    </nav>
  );
}
