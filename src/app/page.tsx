import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Layers,
  Upload,
  Wand2,
  Zap,
  Church,
  Camera,
  Smartphone,
  Book,
  Key,
  Cloud,
  Database,
  Cpu,
  CreditCard,
  Sparkles,
  Palette
} from "lucide-react";
import { Header } from "@/components/marketing/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoLockup, LogoMark } from "@/components/brand/RevelationsLogo";
import { MacBookMockup } from "@/components/marketing/DeviceMockups";
import { BrandKitScreen } from "@/components/marketing/ProductScreens";
import { ScrollProductTour } from "@/components/marketing/LandingMotion";
import { HeroAnimated } from "@/components/marketing/HeroAnimated";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ParallaxLayer } from "@/components/animations/ParallaxLayer";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";

const workflow = [
  {
    icon: Upload,
    title: "Import the message",
    copy: "Upload a sermon or podcast episode, or bring in a YouTube video with title, thumbnail, duration, and transcript context.",
  },
  {
    icon: FileText,
    title: "Build the transcript",
    copy: "Word-level timing gives clips, captions, quotes, outlines, devotionals, and search the same source of truth.",
  },
  {
    icon: Wand2,
    title: "Find the moments",
    copy: "Every moment is scored for virality and stored — the best get rendered, the rest wait for you to call on them.",
  },
  {
    icon: Layers,
    title: "Publish the week",
    copy: "Clips, guides, carousels, blogs, and social graphics move from one workspace — or ask the transcript chat for the exact moment you want.",
  },
];

const teamRolesWithIcons = [
  {
    role: "Pastors",
    value: "Keep the message active after Sunday without adding another production meeting.",
    icon: Church,
    gradient: "from-blue-500/10 to-indigo-500/10 text-indigo-400 dark:text-indigo-300 border-indigo-500/20",
  },
  {
    role: "Media directors",
    value: "Review ranked clips, caption styles, and export-ready assets in one focused workspace.",
    icon: Camera,
    gradient: "from-pink-500/10 to-purple-500/10 text-purple-400 dark:text-purple-300 border-purple-500/20",
  },
  {
    role: "Communications teams",
    value: "Fill the weekly content calendar with quotes, carousels, blogs, and short videos.",
    icon: Smartphone,
    gradient: "from-amber-500/10 to-orange-500/10 text-amber-400 dark:text-amber-300 border-amber-500/20",
  },
  {
    role: "Small group leaders",
    value: "Turn each message into questions, devotionals, and discussion starters quickly.",
    icon: Book,
    gradient: "from-emerald-500/10 to-teal-500/10 text-emerald-400 dark:text-emerald-300 border-emerald-500/20",
  },
];

const operationsWithIcons = [
  { text: "Clerk organizations keep each ministry team separated and secure.", icon: Key },
  { text: "S3 stores source files and rendered media outside the web app bundle.", icon: Cloud },
  { text: "Convex live data keeps upload, processing, ready, failed, and cancelled states fresh.", icon: Database },
  { text: "Inngest coordinates long-running jobs so the UI stays responsive.", icon: Cpu },
  { text: "Modal GPU workers handle transcription, framing, captions, and exports.", icon: Zap },
  { text: "Paystack billing maps subscriptions and credits to the right ministry plan.", icon: CreditCard },
];

const faqs = [
  {
    question: "Does it work for podcasts too?",
    answer: "Yes. Podcasts get their own pipeline: active-speaker framing for multi-person shows, clip selection tuned for stories, hot takes and Q&A, plus show notes, chapters, and listener guides instead of church-specific content.",
  },
  {
    question: "Can we use sermons already on YouTube?",
    answer: "Yes. The app supports YouTube metadata and download-to-S3 processing, with transcript fallback when captions are available.",
  },
  {
    question: "Will captions match our church brand?",
    answer: "The product direction keeps caption styles tied to brand kit colors, fonts, safe-area position, highlight color, and preset.",
  },
  {
    question: "Does this page rely on heavy video backgrounds?",
    answer: "No. The product visuals are rendered as lightweight interface mockups. The 3D layer is CSS-based, lazy-mounted, and reduced-motion aware.",
  },
  {
    question: "What happens while clips are processing?",
    answer: "The app shows clear status changes through Convex so the team can keep working without refreshing the page.",
  },
];

const footerGroups = [
  { heading: "Product", links: ["Workflow", "Product tour", "Captions", "Brand kit"] },
  { heading: "Resources", links: ["Pricing", "Blog", "Support", "Documentation"] },
  { heading: "Company", links: ["Privacy", "Terms", "Security", "Contact"] },
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
      <WorkflowSection />
      <ScrollProductTour />
      <FeatureShowcase />
      <TeamSection />
      <BrandSection />
      <OperationsSection />
      <PricingAndFaqSection />
      <Footer />
    </main>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="relative bg-[var(--color-surface)] py-20 sm:py-28 overflow-hidden">
      {/* Decorative background grids */}
      <div className="absolute inset-0 landing-grid opacity-15 pointer-events-none" />
      
      <ScrollReveal animation="fadeUp" className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-secondary)]">Workflow</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
            From full-length sermon to a complete publishing queue.
          </h2>
          <p className="mt-5 text-pretty text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
            RevelationsHub follows the sermon from ingestion to transcript, clip review, written assets, and final export.
          </p>
        </div>

        {/* Step Cards with dotted line connector */}
        <div className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Connector line for large screens */}
          <div className="absolute top-[48px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-[var(--color-primary)]/40 via-[var(--color-secondary)]/40 to-[var(--color-primary)]/40 border-t border-dashed border-[var(--color-primary)]/40 hidden lg:block pointer-events-none z-0" />

          {workflow.map((item, index) => (
            <div
              key={item.title}
              data-animate
              className="gradient-border-card group shadow-sm hover:shadow-lg transition-all duration-300 z-10"
            >
              <div className="gradient-border-card-inner p-6 flex flex-col h-full justify-between min-h-[260px]">
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                      <item.icon className="h-5 w-5" />
                    </div>
                    {/* Step Number Badge */}
                    <span className="font-mono text-xs font-bold text-[var(--color-secondary)] px-2.5 py-1 rounded-full bg-[var(--color-base)]/80">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[var(--color-text-light)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.copy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

function TeamSection() {
  return (
    <section id="team" className="relative bg-[var(--color-base)] py-20 sm:py-28 overflow-hidden">
      {/* Background soft blur orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-[var(--color-primary)]/5 blur-3xl pointer-events-none" />

      <ScrollReveal animation="fadeUp" className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-14 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-secondary)]">Built for ministry teams</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl relative inline-block">
            Different roles, one source of truth.
            <span className="absolute bottom-0 left-0 w-32 h-1 bg-gradient-to-r from-[var(--color-primary)] to-transparent rounded-full mt-2 block" />
          </h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {teamRolesWithIcons.map((team) => (
            <div
              key={team.role}
              data-animate
              className="neon-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
            >
              {/* Circular Avatar Gradient Backing */}
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${team.gradient} shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                <team.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--color-text-light)]">{team.role}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{team.value}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
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
            Brand controls are a premium feature: logos, colors, typography, caption styles, and graphics should carry through each generated asset seamlessly.
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

function OperationsSection() {
  return (
    <section id="trust" className="relative bg-[var(--color-base)] py-20 sm:py-28 overflow-hidden">
      {/* Background diagonal divider lines or shapes */}
      <div className="absolute inset-0 landing-grid opacity-10 pointer-events-none" />

      <ScrollReveal animation="fadeUp" className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-secondary)]">Trust and operations</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
            Serious workflows need visible reliability.
          </h2>
          <p className="mt-5 text-pretty text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
            Buyers should see that RevelationsHub has authentication, storage, live data, background jobs, GPU processing, and billing behind the interface.
          </p>
        </div>

        {/* Operations Grid cards */}
        <div className="grid gap-4 sm:grid-cols-2 relative">
          {operationsWithIcons.map((item) => (
            <div
              key={item.text}
              data-animate
              className="flex gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/45 transition-all duration-300"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-text-light)]">{item.text}</p>
            </div>
          ))}
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

      <ScrollReveal animation="fadeUp" className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr]">
        {/* Pricing CTA Card with gradient borders and grain overlay */}
        <div className="gradient-border-card shadow-lg">
          <div className="gradient-border-card-inner p-6 sm:p-10 flex flex-col justify-between h-full min-h-[400px] grain-overlay">
            <div>
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] mb-6 shadow-inner">
                <Zap className="h-7 w-7" />
              </div>
              <h2 className="text-balance font-display text-3xl font-extrabold leading-tight sm:text-4xl text-[var(--color-text-light)]">
                Ready to build the weekly content room?
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[var(--color-text-muted)]">
                Start with the current app, then expand into richer caption editing, re-rendering, onboarding samples, and analytics.
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
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] pt-0 pb-16 text-[var(--color-text-muted)]">
      {/* 1. Full-width gradient CTA banner before footer */}
      <div className="relative border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)]/10 via-[var(--color-secondary)]/5 to-[var(--color-primary)]/10 py-16 px-4 sm:px-6 text-center grain-overlay overflow-hidden">
        <div className="absolute inset-0 landing-grid opacity-10 pointer-events-none" />
        <div className="relative mx-auto max-w-4xl z-10">
          <Badge className="mb-4 border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] uppercase tracking-wider text-xs px-3 py-1">
            Keep Sunday Speaking
          </Badge>
          <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-[var(--color-text-light)] tracking-tight">
            Ready to multiply your message?
          </h3>
          <p className="mt-3 text-sm sm:text-base max-w-xl mx-auto text-[var(--color-text-muted)]">
            Join hundreds of churches that are already turning weekly sermons into daily discipleship opportunities.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/sign-up">
              <Button size="lg" className="shadow-md shadow-[var(--color-primary)]/15">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </div>

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
    Workflow: "#workflow",
    "Product tour": "#tour",
    Captions: "#features",
    "Brand kit": "#brand",
    Pricing: "/pricing",
    Blog: "/blog",
    Support: "mailto:support@revelationshub.com",
    Documentation: "#workflow",
    Privacy: "/privacy",
    Terms: "/terms",
    Security: "#trust",
    Contact: "mailto:support@revelationshub.com",
  };

  return anchors[label] || "/";
}
