"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={faq.question}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden transition-all duration-300 hover:border-[var(--color-primary)]/40"
          >
            <button
              onClick={() => toggle(index)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left font-display text-lg font-semibold text-[var(--color-text-light)] focus:outline-none"
              aria-expanded={isOpen}
            >
              <span>{faq.question}</span>
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-base)]/50 text-[var(--color-primary)] transition-transform duration-300">
                <ChevronRight
                  className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-90 text-[var(--color-secondary)]" : ""
                  }`}
                />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="border-t border-[var(--color-border)]/50 p-5 pt-4 text-sm leading-relaxed text-[var(--color-text-muted)] bg-[var(--color-base)]/10">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
