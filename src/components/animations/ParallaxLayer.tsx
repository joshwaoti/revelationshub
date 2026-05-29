"use client";

import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number; // positive = moves faster/same direction, negative = moves opposite direction
  className?: string;
  innerClassName?: string;
}

export function ParallaxLayer({
  children,
  speed = 0.2,
  className = "",
  innerClassName = "",
}: ParallaxLayerProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    let ctx: gsap.Context;

    // Delay scroll calculations per GSAP rules
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        // Measure container width/height instead of window
        const height = outer.offsetHeight || 500;
        
        // Calculate y translate based on speed and height
        const yVal = height * speed;

        gsap.fromTo(
          inner,
          { y: -yVal / 2 },
          {
            y: yVal / 2,
            ease: "none",
            scrollTrigger: {
              trigger: outer,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }, outer);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ctx) {
        ctx.revert();
      }
    };
  }, [speed]);

  return (
    <div ref={outerRef} className={`relative overflow-hidden ${className}`}>
      <div ref={innerRef} className={`w-full h-full ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}
