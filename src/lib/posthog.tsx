"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";

// Initialize PostHog
if (typeof window !== "undefined") {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

    if (posthogKey) {
        posthog.init(posthogKey, {
            api_host: posthogHost,
            capture_pageview: false, // We'll capture manually for SPAs
            capture_pageleave: true,
            persistence: "localStorage",
        });
    }
}

// Identify user in PostHog when they log in
function PostHogUserIdentifier() {
    const { user, isLoaded: userLoaded } = useUser();
    const { organization, isLoaded: orgLoaded } = useOrganization();

    useEffect(() => {
        if (userLoaded && user) {
            posthog.identify(user.id, {
                email: user.emailAddresses[0]?.emailAddress,
                name: user.fullName,
            });
        }
    }, [user, userLoaded]);

    useEffect(() => {
        if (orgLoaded && organization) {
            posthog.group("organization", organization.id, {
                name: organization.name,
                slug: organization.slug,
            });
        }
    }, [organization, orgLoaded]);

    return null;
}

// PostHog Provider Component
export function PostHogProvider({ children }: { children: React.ReactNode }) {
    return (
        <PHProvider client={posthog}>
            <PostHogUserIdentifier />
            {children}
        </PHProvider>
    );
}

// Analytics event helpers
export const analytics = {
    // Track page views
    trackPageView: (path: string) => {
        posthog.capture("$pageview", { $current_url: path });
    },

    // Track sermon upload
    trackSermonUpload: (videoType: "sermon" | "podcast", source: "upload" | "youtube") => {
        posthog.capture("sermon_uploaded", { videoType, source });
    },

    // Track clip generation
    trackClipGeneration: (count: number, tier: string) => {
        posthog.capture("clips_generated", { count, tier });
    },

    // Track content generation
    trackContentGeneration: (type: string) => {
        posthog.capture("content_generated", { type });
    },

    // Track subscription events
    trackSubscription: (action: "started" | "upgraded" | "downgraded" | "cancelled", plan: string) => {
        posthog.capture("subscription_action", { action, plan });
    },

    // Track feature usage
    trackFeatureUsage: (feature: string) => {
        posthog.capture("feature_used", { feature });
    },

    // Track upgrade prompts shown
    trackUpgradePrompt: (feature: string, fromTier: string) => {
        posthog.capture("upgrade_prompt_shown", { feature, fromTier });
    },
};
