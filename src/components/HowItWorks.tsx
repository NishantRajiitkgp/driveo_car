import { ArrowRight, ChevronDown, Car, CalendarCheck, Navigation, BadgeCheck, MessageSquareHeart } from 'lucide-react';

const steps = [
  { num: "01", Icon: Car, label: "Pick Your Car", sub: "Select vehicle type & location" },
  { num: "02", Icon: CalendarCheck, label: "Book a Wash", sub: "30 seconds — instant confirm" },
  { num: "03", Icon: Navigation, label: "Track Your Pro", sub: "Live updates to your phone" },
  { num: "04", Icon: BadgeCheck, label: "Approve Photos", sub: "10 before/after shots sent" },
  { num: "05", Icon: MessageSquareHeart, label: "Rate & Review", sub: "Tell us how we did" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 md:px-12 border-b border-white/10 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <p className="font-mono text-[11px] text-[#E23232] uppercase tracking-[0.3em] mb-4">5 steps. That&apos;s it.</p>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-display uppercase leading-[0.9]">
            How <span className="text-[#E23232]">GLEAM</span> Works
          </h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="group relative flex flex-col items-center text-center cursor-default">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center bg-[#0a0a0a] group-hover:border-[#E23232]/50 group-hover:bg-[#E23232]/[0.08] transition-all duration-500 relative z-10">
                    <step.Icon className="w-10 h-10 text-white/20 group-hover:text-[#E23232] transition-all duration-500 group-hover:scale-110" />
                  </div>
                  <span className="absolute -top-2 -right-2 font-display text-3xl text-[#E23232]/30 group-hover:text-[#E23232] transition-colors duration-300 z-20">{step.num}</span>
                </div>
                <h3 className="font-display text-xl uppercase mb-2 group-hover:text-[#E23232] transition-colors duration-300">{step.label}</h3>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">{step.sub}</p>
                {idx < 4 && (
                  <div className="hidden lg:block absolute top-16 -right-4 z-20">
                    <ArrowRight className="w-4 h-4 text-white/10" />
                  </div>
                )}
                {idx < 4 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ChevronDown className="w-5 h-5 text-white/10" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
