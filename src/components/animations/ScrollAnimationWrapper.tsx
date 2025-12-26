"use client";

import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface ScrollAnimationWrapperProps {
    children: ReactNode;
    animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
    delay?: number;
    duration?: number;
    stagger?: number;
    className?: string;
}

export function ScrollAnimationWrapper({
    children,
    animation = "fadeUp",
    delay = 0,
    duration = 0.8,
    stagger = 0.1,
    className = "",
}: ScrollAnimationWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        // Delay scroll calculations for DOM stabilization (GSAP best practice)
        const initTimeout = setTimeout(() => {
            const ctx = gsap.context(() => {
                const animatableChildren =
                    container.querySelectorAll("[data-animate]");
                const targets =
                    animatableChildren.length > 0 ? animatableChildren : container;

                // Define animation properties based on type
                const animations = {
                    fadeUp: { from: { opacity: 0, y: 40 }, to: { opacity: 1, y: 0 } },
                    fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
                    slideLeft: { from: { opacity: 0, x: -60 }, to: { opacity: 1, x: 0 } },
                    slideRight: { from: { opacity: 0, x: 60 }, to: { opacity: 1, x: 0 } },
                    scale: {
                        from: { opacity: 0, scale: 0.9 },
                        to: { opacity: 1, scale: 1 },
                    },
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
                        start: "top 85%",
                        end: "bottom 15%",
                        toggleActions: "play none none none",
                        invalidateOnRefresh: true,
                    },
                });
            }, container);

            return () => ctx.revert();
        }, 100);

        return () => {
            clearTimeout(initTimeout);
            ScrollTrigger.getAll().forEach((trigger) => {
                if (trigger.trigger === container) {
                    trigger.kill();
                }
            });
        };
    }, [animation, delay, duration, stagger]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}
