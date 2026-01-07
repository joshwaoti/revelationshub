import { Header } from "@/components/marketing/Header";
import { PricingCard } from "@/components/marketing/PricingCard";

const pricingPlans = [
    {
        name: "Plus",
        price: "$49",
        period: "month",
        description: "For growing ministries",
        features: [
            "Unlimited video clips",
            "Smart Camera Crew (auto-reframe)",
            "Podcast audio export",
            "Transcription editing",
            "Basic templates",
            "Email support",
        ],
    },
    {
        name: "Silver",
        price: "$67",
        period: "month",
        description: "For established churches",
        features: [
            "Everything in Plus",
            "Discussion Guides",
            "Devotional Generator",
            "Blog Post Generator",
            "Sermon Outlines",
            "Custom brand kit",
            "Priority support",
        ],
        highlighted: true,
    },
    {
        name: "Gold",
        price: "$97",
        period: "month",
        description: "For large ministries",
        features: [
            "Everything in Silver",
            "Advanced text manipulation",
            "Team collaboration (5 users)",
            "API access",
            "Custom integrations",
            "Dedicated account manager",
        ],
    },
];

export default function PricingPage() {
    return (
        <main className="min-h-screen scripture-mode bg-[var(--color-scripture-bg)]">
            <Header />

            <div className="pt-32 pb-24">
                <div className="mx-auto max-w-7xl px-6">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="font-display text-4xl md:text-6xl font-bold text-[var(--color-scripture-text)] mb-4">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                            Choose the plan that fits your ministry. All plans include a 14-day free trial.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pricingPlans.map((plan) => (
                            <PricingCard key={plan.name} {...plan} />
                        ))}
                    </div>

                    {/* FAQ teaser */}
                    <div className="mt-16 text-center">
                        <p className="text-[var(--color-text-muted)]">
                            Have questions?{" "}
                            <a href="#" className="text-[var(--color-primary)] hover:underline">
                                Check out our FAQ
                            </a>{" "}
                            or{" "}
                            <a href="#" className="text-[var(--color-primary)] hover:underline">
                                contact our team
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
