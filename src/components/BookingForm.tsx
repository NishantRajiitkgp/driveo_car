'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useCursor } from './CursorProvider';

export function BookingForm() {
  const { setIsHovering } = useCursor();

  return (
    <section className="py-32 px-6 md:px-12 border-b border-white/10 relative">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-0 rounded-3xl overflow-hidden border border-white/10">
          {/* Left — CTA side */}
          <div className="lg:w-[45%] relative overflow-hidden">
            <Image src="/booking-bg.jpeg" alt="GLEAM wash" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
            <div className="relative z-10 p-10 md:p-14 flex flex-col justify-end h-full min-h-[400px] lg:min-h-0">
              <p className="font-mono text-[11px] text-[#E23232] uppercase tracking-[0.3em] mb-4">Ready to see the difference?</p>
              <h2 className="text-5xl md:text-6xl font-display uppercase leading-[0.9] mb-6">
                Book Your<br /><span className="text-[#E23232]">First Wash</span>
              </h2>
              <p className="font-serif italic text-lg text-white/50 mb-8 max-w-sm">
                If it&apos;s not the best car wash you&apos;ve ever had, it&apos;s free.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] text-white/30 uppercase tracking-widest">
                <span>$2M insured</span>
                <span>Photo proof</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right — Form side */}
          <div className="lg:w-[55%] bg-[#0a0a0a] p-10 md:p-14">
            <form className="flex flex-col gap-6 h-full">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full group">
                  <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-[#111] border border-white/10 rounded-xl px-5 py-4 font-mono text-sm outline-none focus:border-[#E23232] transition-colors text-white placeholder:text-white/20" />
                </div>
                <div className="w-full group">
                  <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">Email</label>
                  <input type="email" placeholder="john@email.com" className="w-full bg-[#111] border border-white/10 rounded-xl px-5 py-4 font-mono text-sm outline-none focus:border-[#E23232] transition-colors text-white placeholder:text-white/20" />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full group">
                  <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">Phone</label>
                  <input type="tel" placeholder="(416) 000-0000" className="w-full bg-[#111] border border-white/10 rounded-xl px-5 py-4 font-mono text-sm outline-none focus:border-[#E23232] transition-colors text-white placeholder:text-white/20" />
                </div>
                <div className="w-full group">
                  <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">Vehicle</label>
                  <input type="text" placeholder="BMW M4, Tesla Model 3..." className="w-full bg-[#111] border border-white/10 rounded-xl px-5 py-4 font-mono text-sm outline-none focus:border-[#E23232] transition-colors text-white placeholder:text-white/20" />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full group">
                  <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">Wash Type</label>
                  <select className="w-full bg-[#111] border border-white/10 rounded-xl px-5 py-4 font-mono text-sm outline-none focus:border-[#E23232] transition-colors text-white appearance-none cursor-pointer" defaultValue="">
                    <option value="" disabled className="bg-[#111]">Select a wash</option>
                    <option value="express" className="bg-[#111]">Express Wash ($49+)</option>
                    <option value="interior" className="bg-[#111]">Interior Clean ($69+)</option>
                    <option value="full" className="bg-[#111]">Full Wash ($99+)</option>
                    <option value="subscription" className="bg-[#111]">Monthly Plan</option>
                  </select>
                </div>
                <div className="w-full group">
                  <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">Location</label>
                  <select className="w-full bg-[#111] border border-white/10 rounded-xl px-5 py-4 font-mono text-sm outline-none focus:border-[#E23232] transition-colors text-white appearance-none cursor-pointer" defaultValue="">
                    <option value="" disabled className="bg-[#111]">Where&apos;s your car?</option>
                    <option value="condo" className="bg-[#111]">Condo Underground</option>
                    <option value="driveway" className="bg-[#111]">Home Driveway</option>
                    <option value="office" className="bg-[#111]">Office Parking Lot</option>
                    <option value="other" className="bg-[#111]">Other</option>
                  </select>
                </div>
              </div>
              <div className="w-full">
                <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">Notes (optional)</label>
                <textarea placeholder="Gate codes, parking level, pet hair situation..." rows={2} className="w-full bg-[#111] border border-white/10 rounded-xl px-5 py-4 font-mono text-sm outline-none focus:border-[#E23232] transition-colors text-white placeholder:text-white/20 resize-none"></textarea>
              </div>
              <button
                type="button"
                className="w-full bg-[#E23232] text-white font-display text-xl uppercase tracking-wider py-5 rounded-xl hover:bg-white hover:text-black transition-all mt-2 group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <span className="flex items-center justify-center gap-3">
                  Book My Wash — 20% Off
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest text-center">
                Spring special — 20% off first wash. Satisfaction guaranteed.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
