import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  FileText,
  Layers,
  Play,
  ShieldCheck,
  Upload,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { Header } from "@/components/marketing/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoLockup, LogoMark } from "@/components/brand/RevelationsLogo";
import { MacBookMockup } from "@/components/marketing/DeviceMockups";
import { BrandKitScreen } from "@/components/marketing/ProductScreens";
import { ScrollProductTour } from "@/components/marketing/LandingMotion";
import { HeroMotionStage } from "@/components/marketing/HeroMotionStage";

const workflow = [
  {
    icon: Upload,
    title: "Import the message",
    copy: "Upload a sermon file or bring in a YouTube message with title, thumbnail, duration, and transcript context.",
  },
  {
    icon: FileText,
    title: "Build the transcript",
    copy: "Word-level timing gives clips, captions, quotes, outlines, devotionals, and search the same source of truth.",
  },
  {
    icon: Wand2,
    title: "Find the moments",
    copy: "Ranked sermon moments stay tied to timestamp, speaker framing, and regeneration options.",
  },
  {
    icon: Layers,
    title: "Publish the week",
    copy: "Clips, guides, carousels, blogs, podcasts, and social graphics move from one sermon workspace.",
  },
];

const teams = [
  {
    role: "Pastors",
    value: "Keep the message active after Sunday without adding another production meeting.",
  },
  {
    role: "Media directors",
    value: "Review ranked clips, caption styles, and export-ready assets in one focused workspace.",
  },
  {
    role: "Communications teams",
    value: "Fill the weekly content calendar with quotes, carousels, blogs, and short videos.",
  },
  {
    role: "Small group leaders",
    value: "Turn each message into questions, devotionals, and discussion starters quickly.",
  },
];

const operations = [
  "Clerk organizations keep each ministry team separated and secure.",
  "S3 stores source files and rendered media outside the web app bundle.",
  "Convex live data keeps upload, processing, ready, failed, and cancelled states fresh.",
  "Inngest coordinates long-running jobs so the UI stays responsive.",
  "Modal GPU workers handle transcription, framing, captions, and exports.",
  "Paystack billing maps subscriptions and credits to the right ministry plan.",
];

const faqs = [
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
  return (
    <main className="min-h-screen bg-[var(--color-base)] text-[var(--color-text-light)]">
      <Header />
      <HeroSection />
      <WorkflowSection />
      <ScrollProductTour />
      <TeamSection />
      <BrandSection />
      <OperationsSection />
      <PricingAndFaqSection />
      <Footer />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
      <div className="absolute inset-0 landing-grid opacity-45" />
      <div className="absolute inset-0 bg-[linear-gradient(140deg,var(--color-primary)_0%,transparent_20%,transparent_68%,var(--color-secondary)_100%)] opacity-[0.12]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-5 border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            Ministry operating system
          </Badge>
          <h1 className="text-balance font-display text-4xl font-bold leading-[1.06] sm:text-6xl lg:text-7xl">
            Your Sunday message. Monday&apos;s movement.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
            Turn one sermon into accurate clips, modern captions, discussion guides, devotionals, quote graphics, carousels, blog posts, and podcast assets.
          </p>
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/sign-up" className="block">
              <Button size="xl" className="group w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#tour" className="block">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                <Play className="h-5 w-5" />
                Watch Product Tour
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-10 max-w-6xl md:mt-9">
          <HeroMotionStage />

          <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3 md:hidden">
            {[
              ["Source", "Upload or YouTube"],
              ["Output", "Clips and content"],
              ["Review", "Team-ready workspace"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">{label}</p>
                <p className="mt-2 font-semibold text-[var(--color-text-light)]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">Workflow</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
            From full-length sermon to a complete publishing queue.
          </h2>
          <p className="mt-5 text-pretty text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
            RevelationsHub follows the sermon from ingestion to transcript, clip review, written assets, and final export.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {workflow.map((item) => (
            <div key={item.title} className="neon-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1">
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="bg-[var(--color-base)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">Built for ministry teams</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
            Different roles, one source of truth.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {teams.map((team) => (
            <div key={team.role} className="neon-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
              <Users className="mb-8 h-6 w-6 text-[var(--color-primary)]" />
              <h3 className="font-display text-xl font-semibold">{team.role}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">{team.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandSection() {
  return (
    <section className="bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <MacBookMockup>
          <BrandKitScreen />
        </MacBookMockup>
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">Brand kit</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
            Every output should feel like your church made it.
          </h2>
          <p className="mt-5 text-pretty text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
            Brand controls are a premium feature: logos, colors, typography, caption styles, and graphics should carry through each generated asset.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {["Logo variants", "Caption presets", "Quote graphics", "Carousel colors", "Typography"].map((item) => (
              <span key={item} className="rounded-full border border-[var(--color-border)] bg-[var(--color-base)] px-4 py-2 text-sm font-medium text-[var(--color-text-light)] shadow-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OperationsSection() {
  return (
    <section id="trust" className="bg-[var(--color-base)] py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">Trust and operations</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
            Serious workflows need visible reliability.
          </h2>
          <p className="mt-5 text-pretty text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
            Buyers should see that RevelationsHub has authentication, storage, live data, background jobs, GPU processing, and billing behind the interface.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {operations.map((item) => (
            <div key={item} className="flex gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
              <p className="text-sm leading-6 text-[var(--color-text-light)]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingAndFaqSection() {
  return (
    <section className="bg-[var(--color-base)] py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-8">
          <Zap className="mb-8 h-8 w-8 text-[var(--color-secondary)]" />
          <h2 className="text-balance font-display text-3xl font-bold leading-tight sm:text-4xl">
            Ready to build the weekly content room?
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-text-muted)]">
            Start with the current app, then expand into richer caption editing, re-rendering, onboarding samples, and analytics.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                {faq.question}
                <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-primary)] transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-[var(--color-text-muted)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-2 select-none text-center font-display text-[17vw] font-black leading-none text-[var(--color-primary)]/10"
        style={{ animation: "footerDrift 9s ease-in-out infinite" }}
      >
        RevelationsHub
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <LogoLockup markClassName="h-9 w-9" textClassName="text-xl" />
            <p className="mt-4 max-w-sm text-sm leading-6">
              Sermon clipping, captioning, and content generation for churches that want Sunday to keep speaking all week.
            </p>
          </div>
          {footerGroups.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="font-display text-sm font-semibold uppercase text-[var(--color-text-light)]">{heading}</h3>
              <div className="mt-4 grid gap-2 text-sm">
                {links.map((label) => (
                  <Link
                    key={label}
                    href={footerHref(label)}
                    className="inline-flex items-center gap-2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>Copyright 2026 RevelationsHub. All rights reserved.</span>
          <span className="inline-flex items-center gap-2">
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
    Captions: "#captions",
    "Brand kit": "#trust",
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
