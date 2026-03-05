'use client';

import { useState, useRef } from 'react';
import { ArrowUpRight, Star, MapPin, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCursor } from './CursorProvider';
import { vehiclePrices } from '@/lib/data';

export function HeroSection() {
  const { setIsHovering } = useCursor();
  const [selectedVehicle, setSelectedVehicle] = useState('Sedan');
  const containerRef = useRef(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroScroll, [0, 1], [0, 300]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pb-20 overflow-hidden -mt-[88px] pt-[88px]">
      {/* Video Background */}
      <motion.div style={{ y: heroY }} className="absolute inset-0 z-0 pointer-events-none">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#050505]/40" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #050505 20%, rgba(5,5,5,0.6) 50%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #050505 0%, transparent 15%)' }} />
      </motion.div>

      <div className="relative z-10 max-w-[1600px] mx-auto w-full flex flex-col gap-10">
        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#E23232] text-[#E23232]" />)}
            <span className="font-mono text-xs text-white/80 uppercase tracking-wider ml-1">4.9 on Google</span>
          </div>
          <span className="text-white/40">|</span>
          <span className="font-mono text-xs text-white/80 uppercase tracking-wider">2,400+ Cars Washed</span>
          <span className="text-white/40">|</span>
          <span className="font-mono text-xs text-white/80 uppercase tracking-wider">$2M Insured</span>
        </motion.div>

        <div className="w-full pt-12">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[11vw] sm:text-[9vw] md:text-[8vw] lg:text-[6.5vw] xl:text-[5.5vw] font-display leading-none uppercase tracking-tighter whitespace-nowrap"
          >
            Spotless Car Wash
          </motion.h1>
          <div className="flex items-center gap-4 md:gap-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#E23232] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.div>
            <motion.h1 initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="text-[12vw] lg:text-[7vw] font-display leading-[0.85] uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: "2px white" }}>
              In Your Spot.
            </motion.h1>
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="font-mono text-sm md:text-base text-white/80 uppercase tracking-widest max-w-2xl mt-4">
            Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof. No scratches. Ever.
          </motion.p>
        </div>

        {/* Hero Booking Widget */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="w-full max-w-xl border border-white/20 p-8 rounded-3xl backdrop-blur-md bg-black/40" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-4 h-4 text-[#E23232]" />
            <span className="font-mono text-xs text-[#E23232] uppercase tracking-widest">Spring Revival — 20% off your first wash</span>
          </div>
          <div className="flex items-center gap-4 border-b border-white/20 pb-6 mb-6">
            <MapPin className="text-[#E23232] w-6 h-6 shrink-0" />
            <input type="text" placeholder="WHERE SHOULD WE COME? (ADDRESS)" className="bg-transparent outline-none font-mono text-sm w-full uppercase placeholder:text-white/50 text-white" />
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.keys(vehiclePrices).map((vehicle) => (
              <button
                key={vehicle}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider rounded-full border transition-all ${selectedVehicle === vehicle ? 'bg-[#E23232] border-[#E23232] text-white' : 'border-white/20 text-white/80 hover:border-white hover:text-white'}`}
              >
                {vehicle}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="font-mono text-xs text-white/70 uppercase tracking-widest block mb-1">Full Wash From</span>
              <span className="font-display text-5xl text-[#E23232] leading-none">${vehiclePrices[selectedVehicle]}</span>
            </div>
            <button className="bg-[#E23232] text-white font-mono text-xs uppercase tracking-widest px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
              Book Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
