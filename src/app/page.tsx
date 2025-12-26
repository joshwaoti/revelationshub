"use client";

import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import { ScrollAnimationWrapper } from "@/components/animations/ScrollAnimationWrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const testimonials = [
    {
      quote:
        "RevelationsHub has transformed how we share our Sunday messages. What used to take hours now takes minutes.",
      author: "Pastor Michael",
      church: "Grace Community Church",
    },
    {
      quote:
        "The discussion guides feature alone is worth it. Our small groups have never been more engaged.",
      author: "Sarah Johnson",
      church: "New Life Fellowship",
    },
    {
      quote:
        "Finally, a tool that understands ministry. The algorithm picks out exactly the moments that resonate.",
      author: "Rev. David Kim",
      church: "Cornerstone Chapel",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-base)]">
      <Header />
      <Hero />
      <FeatureShowcase />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-[var(--color-base)]">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollAnimationWrapper animation="fadeUp">
            <div className="text-center mb-16" data-animate>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-light)] mb-4">
                Loved by Ministry Teams
              </h2>
              <p className="text-lg text-[var(--color-text-muted)]">
                See what church leaders are saying about RevelationsHub
              </p>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <ScrollAnimationWrapper
                key={testimonial.author}
                animation="fadeUp"
                delay={index * 0.1}
              >
                <motion.div
                  className="bg-[var(--color-surface)] rounded-[var(--radius-default)] p-6 relative h-full"
                  whileHover={{
                    y: -4,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  }}
                  transition={{ duration: 0.3 }}
                  data-animate
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 0.2, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Quote className="absolute top-4 right-4 h-8 w-8 text-[var(--color-secondary)]" />
                  </motion.div>
                  <p className="text-[var(--color-text-light)] mb-6 relative z-10">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div>
                    <p className="font-semibold text-[var(--color-text-light)]">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {testimonial.church}
                    </p>
                  </div>
                </motion.div>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-[var(--color-base)] to-[var(--color-surface)]">
        <ScrollAnimationWrapper animation="scale">
          <div
            className="mx-auto max-w-4xl px-6 text-center"
            data-animate
          >
            <motion.h2
              className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-light)] mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to Amplify Your Ministry?
            </motion.h2>
            <motion.p
              className="text-lg text-[var(--color-text-muted)] mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Join hundreds of churches already using RevelationsHub to reach
              more people with their message.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link href="/sign-up">
                <Button size="xl" className="group">
                  Start Your Free Trial
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </ScrollAnimationWrapper>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-surface)] py-12 border-t border-[var(--color-primary)]/10">
        <ScrollAnimationWrapper animation="fadeIn">
          <div className="mx-auto max-w-7xl px-6" data-animate>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <motion.div
                  className="flex items-center gap-2 mb-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]" />
                  <span className="font-display text-xl font-bold text-[var(--color-text-light)]">
                    RevelationsHub
                  </span>
                </motion.div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Intelligent ministry tools for modern churches.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-light)] mb-4">
                  Product
                </h4>
                <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  <li>
                    <Link
                      href="#features"
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      Integrations
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-light)] mb-4">
                  Resources
                </h4>
                <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  <li>
                    <Link
                      href="#"
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      Support
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-light)] mb-4">
                  Company
                </h4>
                <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  <li>
                    <Link
                      href="#"
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-[var(--color-primary)]/10 text-center text-sm text-[var(--color-text-muted)]">
              © 2024 RevelationsHub. All rights reserved.
            </div>
          </div>
        </ScrollAnimationWrapper>
      </footer>
    </main>
  );
}
