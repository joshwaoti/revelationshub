import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Key,
  Cloud,
  Database,
  Sparkles,
  Palette,
} from "lucide-react";
import { Header } from "@/components/marketing/Header";
import { Button } from "@/components/ui/button";
import { LogoLockup, LogoMark } from "@/components/brand/RevelationsLogo";
import { MacBookMockup } from "@/components/marketing/DeviceMockups";
import { BrandKitScreen } from "@/components/marketing/ProductScreens";
import { ScrollProductTour } from "@/components/marketing/LandingMotion";
import { HeroAnimated } from "@/components/marketing/HeroAnimated";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ParallaxLayer } from "@/components/animations/ParallaxLayer";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";

const trustPoints = [
  { text: "Secure team sign-in with organization workspaces", icon: Key },
  { text: "Your media lives in your own private storage", icon: Cloud },
  { text: "Live status on every upload and render", icon: Database },
  { text: "GPU-powered processing built for full-length services", icon: Zap },
];

const faqs = [
  {
    question: "Does it work for podcasts too?",
    answer: "Yes. Podcasts get their own pipeline: active-speaker framing for multi-person shows, clip selection tuned for stories, hot takes and Q&A, plus show notes, chapters, and listener guides instead of church-specific content.",
  },
  {
    question: "Can we use sermons already on YouTube?",
    answer: "Yes. Paste a YouTube link and RevelationsHub pulls in the video with its title, thumbnail, and duration, then processes it like any upload.",
  },
  {
    question: "Will captions match our church brand?",
    answer: "Yes. Caption styles stay tied to your brand kit: colors, fonts, position, and highlight presets carry into every rendered clip.",
  },
  {
    question: "What happens while clips are processing?",
    answer: "Processing runs in the background and every status updates live, so your team keeps working without refreshing the page.",
  },
];

const footerGroups = [
  { heading: "Product", links: ["Product tour", "Features", "Brand kit"] },
  { heading: "Resources", links: ["Pricing", "Blog", "Support"] },
  { heading: "Company", links: ["Privacy", "Terms", "Contact"] },
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RevelationsHub",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Transform sermons and podcast episodes into ranked clips with broadcast-quality captions, discussion guides, devotionals, quote graphics, carousels, and blogs. Built for churches and creators.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "RevelationsHub",
      "url": "https://revelationshub.com"
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-base)] text-[var(--color-text-light)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <HeroAnimated />
      <ScrollProductTour />
      <FeatureShowcase />
      <BrandSection />
      <PricingAndFaqSection />
      <Footer />
    </main>
  );
}

function BrandSection() {
  return (
    <section id="brand" className="relative bg-[var(--color-surface)] py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 landing-grid opacity-10 pointer-events-none" />

      <ScrollReveal animation="fadeUp" className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Left side Macbook frame */}
        <div className="relative group">
          {/* Subtle background glow behind MacBook */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-3xl opacity-10 blur-2xl group-hover:opacity-15 transition-all duration-500" />

          <MacBookMockup>
            <BrandKitScreen />
          </MacBookMockup>

          {/* Floating Brand Badges with Parallax */}
          <ParallaxLayer speed={0.15} className="absolute -top-6 -right-6 hidden sm:block z-20">
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-surface)]/90 px-4 py-2 text-xs font-semibold text-[var(--color-secondary)] shadow-lg backdrop-blur-md">
              <Palette className="h-3.5 w-3.5" />
              Custom Fonts
            </span>
          </ParallaxLayer>
          <ParallaxLayer speed={-0.12} className="absolute -bottom-6 -left-6 hidden sm:block z-20">
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-surface)]/90 px-4 py-2 text-xs font-semibold text-[var(--color-primary)] shadow-lg backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Dynamic Colors
            </span>
          </ParallaxLayer>
        </div>

        {/* Right side copy content */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-secondary)]">Brand Kit</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl text-[var(--color-text-light)]">
            Every output should feel like your church made it.
          </h2>
          <p className="mt-5 text-pretty text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
            Set your logos, colors, typography, and caption styles once — they carry through every clip, quote graphic, and carousel the app generates.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "Logo Variants",
              "Caption Presets",
              "Quote Graphics",
              "Carousel Colors",
              "Typography",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-base)]/50 hover:bg-[var(--color-base)] hover:border-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-light)] shadow-sm hover:shadow transition-all duration-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

function PricingAndFaqSection() {
  return (
    <section id="pricing" className="relative bg-[var(--color-base)] py-20 sm:py-28 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] rounded-full bg-[var(--color-secondary)]/5 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Slim trust strip */}
        <ScrollReveal animation="fadeUp" className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <item.icon className="h-4 w-4" />
              </div>
              <p className="text-sm leading-snug text-[var(--color-text-muted)]">{item.text}</p>
            </div>
          ))}
        </ScrollReveal>

        <ScrollReveal animation="fadeUp" className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          {/* Pricing CTA Card with gradient borders and grain overlay */}
          <div className="gradient-border-card shadow-lg">
            <div className="gradient-border-card-inner p-6 sm:p-10 flex flex-col justify-between h-full min-h-[400px] grain-overlay">
              <div>
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] mb-6 shadow-inner">
                  <Zap className="h-7 w-7" />
                </div>
                <h2 className="text-balance font-display text-3xl font-extrabold leading-tight sm:text-4xl text-[var(--color-text-light)]">
                  Ready to multiply your message?
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[var(--color-text-muted)]">
                  Upload one sermon and watch it become a week of clips, guides, devotionals, and graphics. Every plan starts with a free trial.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto bg-[var(--color-surface)]/60">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="flex flex-col justify-center">
            <h3 className="font-display text-2xl font-bold mb-6 text-[var(--color-text-light)] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--color-secondary)]" />
              Frequently Asked Questions
            </h3>
            <FaqAccordion faqs={faqs} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] pt-0 pb-16 text-[var(--color-text-muted)]">
      {/* Floating background watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-4 select-none text-center font-display text-[15vw] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-[var(--color-primary)]/10 to-[var(--color-secondary)]/5 opacity-50"
        style={{ animation: "footerDrift 12s ease-in-out infinite" }}
      >
        RevelationsHub
      </div>

      {/* Actual footer links content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <LogoLockup markClassName="h-9 w-9" textClassName="text-xl" />
            <p className="max-w-sm text-sm leading-relaxed">
              Sermon clipping, captioning, and content generation for churches that want Sunday to keep speaking all week.
            </p>
            {/* Social media icons links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { name: "Twitter", href: "https://twitter.com", icon: "X" },
                { name: "Instagram", href: "https://instagram.com", icon: "IG" },
                { name: "YouTube", href: "https://youtube.com", icon: "YT" },
                { name: "Facebook", href: "https://facebook.com", icon: "FB" }
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-base)]/50 hover:bg-[var(--color-primary)] hover:text-[#301A4B] hover:border-[var(--color-primary)] transition-all duration-200 text-xs font-bold text-[var(--color-text-light)]"
                  aria-label={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          {footerGroups.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--color-text-light)]">{heading}</h3>
              <div className="mt-4 grid gap-2.5 text-sm">
                {links.map((label) => (
                  <Link
                    key={label}
                    href={footerHref(label)}
                    className="inline-flex items-center gap-2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)] font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--color-border)]/50 pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>Copyright 2026 RevelationsHub. All rights reserved.</span>
          <span className="inline-flex items-center gap-2 font-medium">
            <LogoMark className="h-5 w-5" />
            Built for modern ministry teams.
          </span>
        </div>
      </div>
    </footer>
  );
}

function footerHref(label: string) {
  const anchors: Record<string, string> = {
    "Product tour": "#tour",
    Features: "#features",
    "Brand kit": "#brand",
    Pricing: "/pricing",
    Blog: "/blog",
    Support: "mailto:support@revelationshub.com",
    Privacy: "/privacy",
    Terms: "/terms",
    Contact: "mailto:support@revelationshub.com",
  };

  return anchors[label] || "/";
}
