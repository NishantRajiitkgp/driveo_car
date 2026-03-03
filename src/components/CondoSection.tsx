import { Droplets, MapPin, Camera, ShieldCheck, Sparkles } from 'lucide-react';
import { buildings } from '@/lib/data';

export function CondoSection() {
  return (
    <section className="py-32 px-6 md:px-12 border-b border-white/10 relative">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-20 items-center">
        <div className="lg:w-1/2">
          <span className="font-mono text-xs text-[#E23232] uppercase tracking-widest mb-6 block">Toronto&apos;s #1 condo car wash problem, solved</span>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-display uppercase leading-[0.9] mb-10">
            Live In A Condo?<br /><span className="text-[#E23232]">We Built This<br />For You.</span>
          </h2>
          <p className="font-serif italic text-xl md:text-2xl text-white/60 leading-relaxed mb-10 max-w-lg">
            <span className="text-white/80">30% of Toronto homes are condos.</span> Other guys show up with a hose and leave. We show up with waterless products — built for underground parking.
          </p>
          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#E23232]/10 flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4 text-[#E23232]" />
              </div>
              <span className="font-mono text-sm uppercase tracking-widest">100% waterless — zero building violations</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#E23232]/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#E23232]" />
              </div>
              <span className="font-mono text-sm uppercase tracking-widest">P1, P2, P3 — we find your car</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#E23232]/10 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 text-[#E23232]" />
              </div>
              <span className="font-mono text-sm uppercase tracking-widest">Done while you work — photos sent</span>
            </div>
          </div>
          <button className="font-mono text-xs uppercase tracking-widest border border-[#E23232] text-[#E23232] px-8 py-4 rounded-full hover:bg-[#E23232] hover:text-white transition-all">
            Book a Condo Wash
          </button>
        </div>

        <div className="lg:w-1/2 flex flex-col gap-5">
          {/* Hero stat card */}
          <div className="bg-gradient-to-br from-[#E23232] to-[#b91c1c] rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="font-display text-7xl md:text-8xl text-white leading-none block">500+</span>
                <span className="font-mono text-xs text-white/70 uppercase tracking-widest mt-2 block">Condo washes completed</span>
              </div>
              <div className="text-right">
                <span className="font-display text-7xl md:text-8xl text-white/20 leading-none block">0</span>
                <span className="font-mono text-xs text-white/50 uppercase tracking-widest mt-2 block">Complaints filed</span>
              </div>
            </div>
          </div>

          {/* Buildings grid */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8">
            <span className="font-mono text-[10px] text-[#E23232] uppercase tracking-[0.3em] block mb-5">Buildings we&apos;ve serviced</span>
            <div className="grid grid-cols-2 gap-3">
              {buildings.map((building) => (
                <div key={building} className="group flex items-center gap-3 bg-[#111] border border-white/5 rounded-xl px-4 py-3 hover:border-[#E23232]/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#E23232]/40 group-hover:bg-[#E23232] transition-colors shrink-0" />
                  <span className="font-mono text-[11px] text-white/50 uppercase tracking-wider group-hover:text-white/80 transition-colors">{building}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div className="flex gap-4">
            <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl p-5 flex items-center gap-4 group hover:border-[#E23232]/30 transition-colors">
              <ShieldCheck className="w-6 h-6 text-[#E23232] shrink-0" />
              <div>
                <span className="font-mono text-xs text-white/80 uppercase tracking-wider block">$2M Insured</span>
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">Every pro, every wash</span>
              </div>
            </div>
            <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl p-5 flex items-center gap-4 group hover:border-[#E23232]/30 transition-colors">
              <Sparkles className="w-6 h-6 text-[#E23232] shrink-0" />
              <div>
                <span className="font-mono text-xs text-white/80 uppercase tracking-wider block">Waterless</span>
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">Zero runoff, zero mess</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
