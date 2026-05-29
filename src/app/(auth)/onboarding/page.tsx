"use client";

import { useState, useCallback } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/components/ui/color-picker";
import { Check, Upload, Palette, Type, Loader2 } from "lucide-react";
import Link from "next/link";
import { LogoLockup } from "@/components/brand/RevelationsLogo";

const steps = [
    { id: 1, name: "Organization", icon: Check },
    { id: 2, name: "Brand Kit", icon: Palette },
    { id: 3, name: "Complete", icon: Check },
];

export default function OnboardingPage() {
    const { organization, isLoaded: orgLoaded } = useOrganization();
    const { user } = useUser();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1 data
    const [churchName, setChurchName] = useState("");
    const [denomination, setDenomination] = useState("");
    const [churchSize, setChurchSize] = useState("");

    // Step 2 data (Brand Kit)
    const [primaryColor, setPrimaryColor] = useState("#0066CC");
    const [secondaryColor, setSecondaryColor] = useState("#FF6600");
    const [fontFamily, setFontFamily] = useState("Roboto");
    const [logoLightUrl, setLogoLightUrl] = useState("");
    const [logoDarkUrl, setLogoDarkUrl] = useState("");

    // Convex mutations
    const upsertOrg = useMutation(api.organizations.upsert);
    const upsertBrandKit = useMutation(api.brandKits.upsert);
    const upsertMember = useMutation(api.members.upsert);
    const upsertSubscription = useMutation(api.subscriptions.upsert);

    // Get organization from Convex
    const convexOrg = useQuery(
        api.organizations.getByClerkId,
        organization?.id ? { clerkOrgId: organization.id } : "skip"
    );

    // Sync organization to Convex and continue
    const handleStep1Continue = async () => {
        if (!organization?.id || !user?.id) return;

        setIsSubmitting(true);
        try {
            // Create/update organization in Convex
            const orgId = await upsertOrg({
                clerkOrgId: organization.id,
                name: organization.name || churchName,
                slug: organization.slug || undefined,
                imageUrl: organization.imageUrl || undefined,
            });

            // Create member record
            await upsertMember({
                clerkUserId: user.id,
                organizationId: orgId,
                role: "admin",
                email: user.emailAddresses[0]?.emailAddress || "",
                name: user.fullName || undefined,
                imageUrl: user.imageUrl || undefined,
            });

            // Create free subscription
            await upsertSubscription({
                organizationId: orgId,
                paystackCustomerId: "",
                plan: "free",
                status: "active",
                clipCredits: 2,
            });

            setCurrentStep(2);
        } catch (error) {
            console.error("Error saving organization:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Save brand kit and continue
    const handleStep2Continue = async () => {
        if (!convexOrg?._id) {
            // If org not synced yet, go back
            setCurrentStep(1);
            return;
        }

        setIsSubmitting(true);
        try {
            await upsertBrandKit({
                organizationId: convexOrg._id,
                name: "Default",
                logoLightUrl: logoLightUrl || undefined,
                logoDarkUrl: logoDarkUrl || undefined,
                primaryColor,
                secondaryColor,
                fontFamily,
            });

            setCurrentStep(3);
        } catch (error) {
            console.error("Error saving brand kit:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle logo upload
    const handleLogoUpload = useCallback((type: "light" | "dark") => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            // For now, create a data URL (in production, upload to Convex storage)
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (type === "light") {
                    setLogoLightUrl(dataUrl);
                } else {
                    setLogoDarkUrl(dataUrl);
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }, []);

    // Pre-populate church name from Clerk org
    useState(() => {
        if (organization?.name) {
            setChurchName(organization.name);
        }
    });

    return (
        <main className="min-h-screen bg-[var(--color-base)] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <LogoLockup markClassName="h-10 w-10" textClassName="text-2xl" />
                </Link>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${currentStep >= step.id
                                    ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                                    : "border-[var(--color-primary)]/30"
                                    }`}
                            >
                                {currentStep > step.id ? (
                                    <Check className="h-5 w-5 text-[var(--color-base)]" />
                                ) : (
                                    <span
                                        className={`text-sm font-medium ${currentStep >= step.id
                                            ? "text-[var(--color-base)]"
                                            : "text-[var(--color-text-muted)]"
                                            }`}
                                    >
                                        {step.id}
                                    </span>
                                )}
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`w-16 h-0.5 mx-2 ${currentStep > step.id
                                        ? "bg-[var(--color-primary)]"
                                        : "bg-[var(--color-primary)]/30"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Organization Profile */}
                {currentStep === 1 && (
                    <Card className="border border-[var(--color-primary)]/20 animate-fade-in">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Tell us about your church</CardTitle>
                            <CardDescription>
                                This helps us personalize your experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleStep1Continue(); }}>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Church Name
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Grace Community Church"
                                        value={churchName || organization?.name || ""}
                                        onChange={(e) => setChurchName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Denomination (Optional)
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Non-denominational"
                                        value={denomination}
                                        onChange={(e) => setDenomination(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Church Size
                                    </label>
                                    <select
                                        className="flex h-11 w-full rounded-[var(--radius-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                        value={churchSize}
                                        onChange={(e) => setChurchSize(e.target.value)}
                                    >
                                        <option value="">Select size...</option>
                                        <option value="under_100">Under 100</option>
                                        <option value="100_500">100 - 500</option>
                                        <option value="500_1000">500 - 1,000</option>
                                        <option value="1000_5000">1,000 - 5,000</option>
                                        <option value="5000_plus">5,000+</option>
                                    </select>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={isSubmitting || !orgLoaded}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Continue"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Brand Kit */}
                {currentStep === 2 && (
                    <Card className="border border-[var(--color-primary)]/20 animate-fade-in">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Set up your Brand Kit</CardTitle>
                            <CardDescription>
                                Upload your logo and colors for branded content
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Church Logo
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-[var(--radius-default)] p-6 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer relative overflow-hidden"
                                            onClick={() => handleLogoUpload("light")}
                                        >
                                            {logoLightUrl ? (
                                                <img
                                                    src={logoLightUrl}
                                                    alt="Light logo"
                                                    className="h-12 w-auto mx-auto object-contain"
                                                />
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                                                    <p className="text-sm text-[var(--color-text-muted)]">
                                                        Light version
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <div
                                            className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-[var(--radius-default)] p-6 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer bg-[var(--color-text-light)]/5 relative overflow-hidden"
                                            onClick={() => handleLogoUpload("dark")}
                                        >
                                            {logoDarkUrl ? (
                                                <img
                                                    src={logoDarkUrl}
                                                    alt="Dark logo"
                                                    className="h-12 w-auto mx-auto object-contain"
                                                />
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                                                    <p className="text-sm text-[var(--color-text-muted)]">
                                                        Dark version
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Colors with Color Picker */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        <Palette className="h-4 w-4" />
                                        Brand Colors
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <ColorPicker
                                            value={primaryColor}
                                            onChange={setPrimaryColor}
                                            label="Primary Color"
                                        />
                                        <ColorPicker
                                            value={secondaryColor}
                                            onChange={setSecondaryColor}
                                            label="Secondary Color"
                                        />
                                    </div>
                                </div>

                                {/* Fonts */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        <Type className="h-4 w-4" />
                                        Font Family
                                    </label>
                                    <select
                                        className="flex h-11 w-full rounded-[var(--radius-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                        value={fontFamily}
                                        onChange={(e) => setFontFamily(e.target.value)}
                                    >
                                        <option value="Roboto">Roboto</option>
                                        <option value="Open Sans">Open Sans</option>
                                        <option value="Lato">Lato</option>
                                        <option value="Montserrat">Montserrat</option>
                                        <option value="Poppins">Poppins</option>
                                        <option value="Inter">Inter</option>
                                    </select>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        size="lg"
                                        onClick={() => setCurrentStep(1)}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        className="flex-1"
                                        size="lg"
                                        onClick={handleStep2Continue}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Continue"
                                        )}
                                    </Button>
                                </div>
                                <button
                                    type="button"
                                    className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                                    onClick={() => setCurrentStep(3)}
                                >
                                    Skip for now
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Complete */}
                {currentStep === 3 && (
                    <Card className="border border-[var(--color-primary)]/20 animate-fade-in">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[var(--color-success)] flex items-center justify-center">
                                <Check className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl">You&apos;re all set!</CardTitle>
                            <CardDescription>
                                Your account is ready. Let&apos;s create your first clip.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/library">
                                <Button className="w-full" size="lg">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}
