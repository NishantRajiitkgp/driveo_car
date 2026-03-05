'use client';

import { ArrowRight, ChevronDown, Car, CalendarCheck, Navigation, BadgeCheck, MessageSquareHeart } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { num: "01", Icon: Car, label: "Pick Your Car", sub: "Select vehicle type & location" },
  { num: "02", Icon: CalendarCheck, label: "Book a Wash", sub: "30 seconds — instant confirm" },
  { num: "03", Icon: Navigation, label: "Track Your Pro", sub: "Live updates to your phone" },
  { num: "04", Icon: BadgeCheck, label: "Approve Photos", sub: "10 before/after shots sent" },
  { num: "05", Icon: MessageSquareHeart, label: "Rate & Review", sub: "Tell us how we did" },
];

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const stepVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease },
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 md:px-12 border-b border-white/10 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[11px] text-[#E23232] uppercase tracking-[0.3em] mb-4"
          >
            5 steps. That&apos;s it.
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-display uppercase leading-[0.9]"
          >
            How <span className="text-[#E23232]">GLEAM</span> Works
          </motion.h2>
        </div>

        <div className="relative">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent origin-left"
          />
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ staggerChildren: 0.15 }}
          >
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                variants={stepVariants}
                className="group relative flex flex-col items-center text-center cursor-default"
              >
                <div className="relative mb-6">
                  <motion.div
                    className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center bg-[#0a0a0a] group-hover:border-[#E23232]/50 group-hover:bg-[#E23232]/[0.08] transition-all duration-500 relative z-10"
                    whileHover={{ scale: 1.08, transition: { duration: 0.3 } }}
                  >
                    <step.Icon className="w-10 h-10 text-white/40 group-hover:text-[#E23232] transition-all duration-500 group-hover:scale-110" />
                  </motion.div>
                  <span className="absolute -top-2 -right-2 font-display text-3xl text-[#E23232]/30 group-hover:text-[#E23232] transition-colors duration-300 z-20">{step.num}</span>
                </div>
                <h3 className="font-display text-xl uppercase mb-2 group-hover:text-[#E23232] transition-colors duration-300">{step.label}</h3>
                <p className="font-mono text-[10px] text-white/50 uppercase tracking-widest">{step.sub}</p>
                {idx < 4 && (
                  <motion.div
                    className="hidden lg:block absolute top-16 -right-4 z-20"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.15 }}
                  >
                    <ArrowRight className="w-4 h-4 text-white/20" />
                  </motion.div>
                )}
                {idx < 4 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ChevronDown className="w-5 h-5 text-white/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
