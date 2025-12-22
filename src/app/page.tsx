import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-base)]">
      <Header />
      <Hero />
      <FeatureGrid />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-[var(--color-base)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-light)] mb-4">
              Loved by Ministry Teams
            </h2>
            <p className="text-lg text-[var(--color-text-muted)]">
              See what church leaders are saying about RevelationsHub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "RevelationsHub has transformed how we share our Sunday messages. What used to take hours now takes minutes.",
                author: "Pastor Michael",
                church: "Grace Community Church",
              },
              {
                quote: "The discussion guides feature alone is worth it. Our small groups have never been more engaged.",
                author: "Sarah Johnson",
                church: "New Life Fellowship",
              },
              {
                quote: "Finally, a tool that understands ministry. The AI picks out exactly the moments that resonate.",
                author: "Rev. David Kim",
                church: "Cornerstone Chapel",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-[var(--color-surface)] rounded-[var(--radius-default)] p-6 relative"
              >
                <Quote className="absolute top-4 right-4 h-8 w-8 text-[var(--color-secondary)]/20" />
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-[var(--color-base)] to-[var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-light)] mb-6">
            Ready to Amplify Your Ministry?
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] mb-10">
            Join hundreds of churches already using RevelationsHub to reach more people with their message.
          </p>
          <Link href="/sign-up">
            <Button size="xl" className="group">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-surface)] py-12 border-t border-[var(--color-primary)]/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]" />
                <span className="font-display text-xl font-bold text-[var(--color-text-light)]">
                  RevelationsHub
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                AI-powered ministry tools for modern churches.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-text-light)] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li><Link href="#features" className="hover:text-[var(--color-primary)]">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-[var(--color-primary)]">Pricing</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-primary)]">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-text-light)] mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li><Link href="#" className="hover:text-[var(--color-primary)]">Documentation</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-primary)]">Blog</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-primary)]">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-text-light)] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li><Link href="#" className="hover:text-[var(--color-primary)]">About</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-primary)]">Privacy</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-primary)]">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[var(--color-primary)]/10 text-center text-sm text-[var(--color-text-muted)]">
            © 2024 RevelationsHub. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
