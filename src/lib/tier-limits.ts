// Tier limits configuration for subscription-based feature gating

export const TIER_LIMITS = {
    free: {
        maxClipsPerSermon: 2,
        watermark: true,
        features: ['clips'] as const,
        clipCredits: 2, // per month
    },
    plus: {
        maxClipsPerSermon: Infinity,
        watermark: false,
        features: ['clips', 'quotes', 'carousel', 'podcast'] as const,
        clipCredits: 50, // per month
    },
    silver: {
        maxClipsPerSermon: Infinity,
        watermark: false,
        features: [
            'clips',
            'quotes',
            'carousel',
            'podcast',
            'discussion_guide',
            'devotional',
            'blog'
        ] as const,
        clipCredits: 100,
    },
    gold: {
        maxClipsPerSermon: Infinity,
        watermark: false,
        features: [
            'clips',
            'quotes',
            'carousel',
            'podcast',
            'discussion_guide',
            'devotional',
            'blog',
            'outline',
            'summary',
        ] as const,
        clipCredits: 200,
    },
    platinum: {
        maxClipsPerSermon: Infinity,
        watermark: false,
        features: [
            'clips',
            'quotes',
            'carousel',
            'podcast',
            'discussion_guide',
            'devotional',
            'blog',
            'outline',
            'summary',
            'translation'
        ] as const,
        clipCredits: Infinity,
    },
} as const;

export type Tier = keyof typeof TIER_LIMITS;
export type Feature = typeof TIER_LIMITS[Tier]['features'][number];

/**
 * Get the maximum clips allowed for a tier, clamped by user request
 */
export function getMaxClips(tier: Tier, requestedClips: number): number {
    const limit = TIER_LIMITS[tier].maxClipsPerSermon;
    return Math.min(requestedClips, limit === Infinity ? requestedClips : limit);
}

/**
 * Check if a tier has access to a specific feature
 */
export function canUseFeature(tier: Tier, feature: string): boolean {
    return (TIER_LIMITS[tier].features as readonly string[]).includes(feature);
}

/**
 * Check if clips should have watermark
 */
export function shouldWatermark(tier: Tier): boolean {
    return TIER_LIMITS[tier].watermark;
}

/**
 * Get monthly clip credits for a tier
 */
export function getClipCredits(tier: Tier): number {
    return TIER_LIMITS[tier].clipCredits;
}

/**
 * Get tier-gated features that should be locked/shown as upgrade prompts
 */
export function getLockedFeatures(tier: Tier): string[] {
    const allFeatures = [
        'clips',
        'quotes',
        'carousel',
        'podcast',
        'discussion_guide',
        'devotional',
        'blog',
        'outline',
        'summary',
        'translation',
    ];

    const availableFeatures = TIER_LIMITS[tier].features as readonly string[];
    return allFeatures.filter(f => !availableFeatures.includes(f));
}
