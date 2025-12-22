import { Card, CardContent } from "@/components/ui/card";
import {
    Wand2,
    BookOpen,
    Image,
    FileText,
    Mic,
    MessageSquare,
} from "lucide-react";

const features = [
    {
        icon: Wand2,
        title: "Magic Clips",
        description:
            "AI automatically identifies the most engaging moments and creates vertical clips ready for social media.",
        color: "var(--color-primary)",
        span: "col-span-2",
    },
    {
        icon: BookOpen,
        title: "Discussion Guides",
        description:
            "Generate small group discussion questions and study guides from your sermon content.",
        color: "var(--color-secondary)",
        span: "col-span-1",
    },
    {
        icon: Image,
        title: "Image Quotes",
        description:
            "Create shareable quote graphics with your church branding automatically applied.",
        color: "var(--color-primary)",
        span: "col-span-1",
    },
    {
        icon: FileText,
        title: "Blog Posts",
        description:
            "Transform your spoken word into written blog articles with one click.",
        color: "var(--color-success)",
        span: "col-span-1",
    },
    {
        icon: Mic,
        title: "Podcast Audio",
        description:
            "Extract clean audio and create podcast episodes from your sermons.",
        color: "var(--color-success)",
        span: "col-span-1",
    },
    {
        icon: MessageSquare,
        title: "Social Carousel",
        description:
            "Generate swipeable carousel posts that break down key points for Instagram and LinkedIn.",
        color: "var(--color-primary)",
        span: "col-span-2",
    },
];

export function FeatureGrid() {
    return (
        <section id="features" className="py-24 bg-[var(--color-surface)]">
            <div className="mx-auto max-w-7xl px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-light)] mb-4">
                        One Sermon. Endless Content.
                    </h2>
                    <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                        Upload once, and let AI create clips, guides, graphics, and more—all
                        with your church&apos;s branding.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {features.map((feature) => (
                        <Card
                            key={feature.title}
                            className={`group cursor-pointer hover:border-[var(--color-secondary)] hover:shadow-[0_0_20px_rgba(243,154,157,0.3)] transition-all duration-300 ${feature.span === "col-span-2" ? "md:col-span-2" : ""
                                }`}
                        >
                            <CardContent className="p-6">
                                <div
                                    className="h-12 w-12 rounded-[var(--radius-default)] flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: `${feature.color}20` }}
                                >
                                    <feature.icon
                                        className="h-6 w-6"
                                        style={{ color: feature.color }}
                                    />
                                </div>
                                <h3 className="font-display text-xl font-semibold text-[var(--color-text-light)] mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
