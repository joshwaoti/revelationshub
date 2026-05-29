"use client";

import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  stagger?: number;
  className?: string;
  animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
  triggerStart?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.8,
  stagger = 0.12,
  className = "",
  animation = "fadeUp",
  triggerStart = "top 85%",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    let ctx: gsap.Context;

    // Delay scroll calculations for DOM stabilization per GSAP best practices
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        const animatableChildren = container.querySelectorAll("[data-animate]");
        const targets = animatableChildren.length > 0 ? animatableChildren : container;

        const animations = {
          fadeUp: { from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 } },
          fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
          slideLeft: { from: { opacity: 0, x: -40 }, to: { opacity: 1, x: 0 } },
          slideRight: { from: { opacity: 0, x: 40 }, to: { opacity: 1, x: 0 } },
          scale: { from: { opacity: 0, scale: 0.95 }, to: { opacity: 1, scale: 1 } },
        };

        const anim = animations[animation];

        gsap.set(targets, anim.from);

        gsap.to(targets, {
          ...anim.to,
          duration,
          delay,
          stagger: animatableChildren.length > 0 ? stagger : 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: triggerStart,
            toggleActions: "play none none none",
            invalidateOnRefresh: true,
          },
        });
      }, container);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ctx) {
        ctx.revert();
      }
    };
  }, [animation, delay, duration, stagger, triggerStart]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
