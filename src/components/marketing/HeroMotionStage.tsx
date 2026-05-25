"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const activity = [
  "Transcript aligned",
  "12 clips ranked",
  "Captions styled",
  "Content queue ready",
];

export function HeroMotionStage() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reducedMotion) {
      video.pause();
      video.currentTime = 0.8;
      return;
    }

    void video.play().catch(() => undefined);
  }, [reducedMotion]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = stageRef.current;
    if (!node || reducedMotion) return;

    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    node.style.setProperty("--pointer-x", `${x * 100}%`);
    node.style.setProperty("--pointer-y", `${y * 100}%`);
    node.style.setProperty("--tilt-x", `${(0.5 - y) * 6}deg`);
    node.style.setProperty("--tilt-y", `${(x - 0.5) * 8}deg`);
  }

  function resetPointer() {
    const node = stageRef.current;
    if (!node) return;

    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div
      ref={stageRef}
      className="hero-motion-stage relative mx-auto max-w-6xl"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="pointer-events-none absolute inset-0 hero-sheen" />

      <div className="relative grid gap-4 lg:grid-cols-[1fr_280px] lg:items-stretch">
        <div className="hero-desktop-frame group relative min-w-0 rounded-[1.6rem] border border-white/15 bg-[#0d1117] p-2 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <div className="ml-3 flex-1 rounded-md bg-white/[0.06] px-3 py-1 text-left text-[10px] text-white/55">
              app.revelationshub.com/sermon/sunday-service
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-[1rem] bg-[#111827]">
            <video
              ref={videoRef}
              className="size-full object-cover"
              src="/hero-product-motion.mp4"
              poster="/hero-product-poster.jpg"
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Animated RevelationsHub product workflow preview"
            />
            <div className="pointer-events-none absolute inset-0 border border-white/10" />
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 hidden items-center justify-between rounded-xl border border-white/10 bg-black/42 px-4 py-3 text-white shadow-lg backdrop-blur-md sm:flex">
              <div>
                <p className="text-xs font-semibold uppercase text-white/55">Processing now</p>
                <p className="mt-1 text-sm font-semibold">Sunday Service: Hope has a voice</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#9be7d1]">
                <span className="size-2 rounded-full bg-[#9be7d1]" />
                Live
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <HeroSignalCard title="Weekly outputs" value="31" label="Ready for review" icon="spark" />
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/88 p-4 text-left shadow-lg backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">Motion queue</p>
              <ArrowUpRight className="size-4 text-[var(--color-primary)]" />
            </div>
            <div className="space-y-3">
              {activity.map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-[10px] font-bold",
                      index === 1
                        ? "bg-[var(--color-primary)] text-[#301A4B]"
                        : "bg-[var(--color-primary)]/12 text-[var(--color-primary)]"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text-light)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <HeroSignalCard title="Clip confidence" value="94%" label="Top moment score" />
        </div>
      </div>
    </div>
  );
}

function HeroSignalCard({
  title,
  value,
  label,
  icon,
}: {
  title: string;
  value: string;
  label: string;
  icon?: "spark";
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/88 p-4 text-left shadow-lg backdrop-blur transition-transform duration-150 hover:-translate-y-0.5">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">{title}</p>
        {icon ? (
          <Sparkles className="size-4 text-[var(--color-primary)]" />
        ) : (
          <CheckCircle2 className="size-4 text-[var(--color-success)]" />
        )}
      </div>
      <p className="font-display text-4xl font-bold tabular-nums text-[var(--color-text-light)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{label}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-base)]">
        <div className="h-full w-4/5 rounded-full bg-[var(--color-primary)]" />
      </div>
    </div>
  );
}
