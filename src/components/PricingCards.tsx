'use client';

import { useCursor } from './CursorProvider';
import { pricingCards } from '@/lib/data';

export function PricingCards() {
  const { setIsHovering } = useCursor();

  return (
    <section id="plans" className="py-32 px-6 md:px-12 border-b border-white/10">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-8">
          <div>
            <h2 className="text-6xl md:text-8xl font-display uppercase leading-[0.9]">Monthly<br />Plans</h2>
            <p className="font-mono text-xs text-white/50 uppercase tracking-widest mt-4 max-w-md">Cancel anytime — 30-day notice, no fees, no guilt trip. We don&apos;t do contracts because we&apos;d rather earn your business every month.</p>
          </div>
          <button
            className="font-mono text-xs uppercase tracking-widest border border-white/30 px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            View One-Time Prices
          </button>
        </div>

        <p className="font-serif italic text-lg text-white/40 max-w-2xl mb-20">
          Subscriptions save you 25-35% vs. booking one-time washes — and you never have to remember to book. We schedule, we show up, your car stays clean.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {pricingCards.map((card, idx) => (
            <div
              key={idx}
              className={`${card.bg} ${card.text} p-12 rounded-3xl flex flex-col h-auto min-h-[580px] border border-white/10 transition-transform duration-300 hover:scale-[1.03] hover:-translate-y-2 cursor-default relative`}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {'popular' in card && card.popular && <span className="absolute top-6 right-6 font-mono text-[10px] uppercase tracking-widest bg-black text-white px-4 py-1.5 rounded-full">Most Popular</span>}
              <div className="flex items-baseline gap-1 mb-6">
                <h3 className={`text-7xl font-display ${card.accent}`}>{card.price}</h3>
                <span className="font-mono text-sm opacity-60">{card.label}</span>
              </div>
              <h4 className="text-3xl font-display uppercase mb-3">{card.title}</h4>
              <span className="font-mono text-xs opacity-50 uppercase tracking-widest mb-6 block">{card.services}</span>
              <p className="font-serif italic text-lg opacity-70 mb-12 flex-grow">{card.desc}</p>
              <button className={`font-mono text-xs uppercase tracking-widest border ${card.bg === 'bg-[#E23232]' ? 'border-black hover:bg-black hover:text-[#E23232]' : 'border-white/30 hover:bg-white hover:text-black'} px-8 py-4 rounded-full transition-all self-start`}>
                Start Your Plan
              </button>
            </div>
          ))}
        </div>

        {/* GLEAM Prime */}
        <div
          className="bg-[#111] border border-[#E23232]/30 p-12 rounded-3xl flex flex-col md:flex-row gap-10 items-center cursor-default relative overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E23232]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex-grow relative z-10">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#E23232] block mb-3">The complete package</span>
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="text-6xl font-display text-[#E23232]">$179</h3>
              <span className="font-mono text-sm text-white/60">/month</span>
            </div>
            <h4 className="text-3xl font-display uppercase mb-4">GLEAM Prime</h4>
            <p className="font-serif italic text-lg text-white/60 max-w-xl mb-6">
              Everything in GLEAM Full, plus a monthly salt flush in winter, priority scheduling so you always get your preferred time slot, and 15% off any add-on services. For anyone who wants their car looking showroom-clean at all times — without thinking about it.
            </p>
            <span className="font-mono text-xs text-white/30 uppercase tracking-widest">All GLEAM Full Washes + Salt Flush + Priority + 15% Off Add-Ons</span>
          </div>
          <button className="font-mono text-xs uppercase tracking-widest border border-[#E23232] text-[#E23232] px-8 py-4 rounded-full hover:bg-[#E23232] hover:text-white transition-all shrink-0 relative z-10">
            Go Prime
          </button>
        </div>

        <p className="font-mono text-xs text-white/30 uppercase tracking-widest text-center mt-8">
          Second vehicle in the same household? 20% off the second plan.
        </p>
      </div>
    </section>
  );
}
