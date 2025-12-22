import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    highlighted?: boolean;
    buttonText?: string;
}

export function PricingCard({
    name,
    price,
    period,
    description,
    features,
    highlighted = false,
    buttonText = "Get Started",
}: PricingCardProps) {
    return (
        <Card
            className={`relative flex flex-col ${highlighted
                    ? "border-2 border-[var(--color-primary)] shadow-[0_0_30px_rgba(109,177,191,0.3)] scale-105"
                    : "border border-[var(--color-primary)]/20"
                }`}
        >
            {highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default">Most Popular</Badge>
                </div>
            )}
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{name}</CardTitle>
                <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="text-center mb-6">
                    <span className="font-display text-5xl font-bold text-[var(--color-text-light)]">
                        {price}
                    </span>
                    <span className="text-[var(--color-text-muted)]">/{period}</span>
                </div>
                <ul className="space-y-3">
                    {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-[var(--color-success)] shrink-0 mt-0.5" />
                            <span className="text-sm text-[var(--color-text-light)]">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Link href="/sign-up" className="w-full">
                    <Button
                        variant={highlighted ? "default" : "outline"}
                        className="w-full"
                        size="lg"
                    >
                        {buttonText}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
