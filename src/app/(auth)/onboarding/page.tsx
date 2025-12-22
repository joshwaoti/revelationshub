"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Upload, Palette, Type } from "lucide-react";
import Link from "next/link";

const steps = [
    { id: 1, name: "Organization", icon: Check },
    { id: 2, name: "Brand Kit", icon: Palette },
    { id: 3, name: "Complete", icon: Check },
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);

    return (
        <main className="min-h-screen bg-[var(--color-base)] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]" />
                    <span className="font-display text-2xl font-bold text-[var(--color-text-light)]">
                        RevelationsHub
                    </span>
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
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Church Name
                                    </label>
                                    <Input type="text" placeholder="Grace Community Church" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Denomination (Optional)
                                    </label>
                                    <Input type="text" placeholder="Non-denominational" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Church Size
                                    </label>
                                    <select className="flex h-11 w-full rounded-[var(--radius-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                                        <option>Select size...</option>
                                        <option>Under 100</option>
                                        <option>100 - 500</option>
                                        <option>500 - 1,000</option>
                                        <option>1,000 - 5,000</option>
                                        <option>5,000+</option>
                                    </select>
                                </div>
                                <Button
                                    type="button"
                                    className="w-full"
                                    size="lg"
                                    onClick={() => setCurrentStep(2)}
                                >
                                    Continue
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
                                        <div className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-[var(--radius-default)] p-6 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                Light version
                                            </p>
                                        </div>
                                        <div className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-[var(--radius-default)] p-6 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer bg-[var(--color-text-light)]/5">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                Dark version
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Colors */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        <Palette className="h-4 w-4" />
                                        Brand Colors
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                                                Primary Color
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="w-11 h-11 rounded bg-blue-500 border border-white/20" />
                                                <Input type="text" placeholder="#0066CC" className="flex-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                                                Secondary Color
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="w-11 h-11 rounded bg-orange-500 border border-white/20" />
                                                <Input type="text" placeholder="#FF6600" className="flex-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fonts */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        <Type className="h-4 w-4" />
                                        Font Family
                                    </label>
                                    <select className="flex h-11 w-full rounded-[var(--radius-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                                        <option>Roboto</option>
                                        <option>Open Sans</option>
                                        <option>Lato</option>
                                        <option>Montserrat</option>
                                        <option>Poppins</option>
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
                                        onClick={() => setCurrentStep(3)}
                                    >
                                        Continue
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
