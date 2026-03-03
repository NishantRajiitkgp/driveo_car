import { MapPin, Camera, Zap, RefreshCw, ShieldCheck } from 'lucide-react';

export function USPGrid() {
  return (
    <section className="py-20 px-6 border-b border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#E23232]/[0.03] to-transparent pointer-events-none" />
      <div className="max-w-[1400px] mx-auto">
        <p className="font-mono text-[11px] text-[#E23232] uppercase tracking-[0.3em] text-center mb-12">Why GLEAM is different</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {[
            { Icon: MapPin, title: "We Come To You", sub: <>Condo underground<br />Driveway &middot; Office lot</> },
            { Icon: Camera, title: "Photo Proof", sub: <>Before &amp; after shots<br />on every single wash</> },
            { Icon: Zap, title: "Book in 30 Seconds", sub: <>No phone tag<br />No callbacks</> },
            { Icon: RefreshCw, title: "Plans That Make Sense", sub: <>Real subscriptions<br />Cancel anytime</> },
            { Icon: ShieldCheck, title: "Satisfaction Guaranteed", sub: <>Not happy? We&apos;ll<br />make it right — free</> },
          ].map(({ Icon, title, sub }, idx) => (
            <div key={idx} className="group flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center shrink-0 bg-white/[0.03] group-hover:border-[#E23232]/40 group-hover:bg-[#E23232]/[0.06] transition-all duration-300">
                <Icon className="w-6 h-6 text-[#E23232]" />
              </div>
              <div>
                <span className="font-display text-lg uppercase block leading-tight">{title}</span>
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1.5 block leading-relaxed">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
