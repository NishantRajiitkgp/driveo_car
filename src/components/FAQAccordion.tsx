'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from './CursorProvider';
import { faqItems } from '@/lib/data';

export function FAQAccordion() {
  const { setIsHovering } = useCursor();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-32 px-6 md:px-12 border-b border-white/10">
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-6xl md:text-8xl font-display uppercase leading-[0.9] mb-6 text-center">Questions?<br /><span className="text-[#E23232]">Answers.</span></h2>
        <p className="font-mono text-xs text-white/40 uppercase tracking-widest text-center mb-20">Everything you&apos;d want to know before booking</p>

        <div className="flex flex-col gap-4">
          {faqItems.map((item, idx) => (
            <div key={idx} className="border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-8 text-left cursor-pointer"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <span className="font-mono text-sm uppercase tracking-widest pr-8">{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#E23232] shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-8 pb-8 font-sans text-white/60 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
