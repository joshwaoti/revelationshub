"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Palette, Type, Check } from "lucide-react";

export default function BrandKitPage() {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-[var(--color-text-light)] mb-2">
                    Brand Kit
                </h1>
                <p className="text-[var(--color-text-muted)]">
                    Customize how your content looks with your church&apos;s branding
                </p>
            </div>

            <div className="grid gap-6">
                {/* Logo Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-[var(--color-primary)]" />
                            Church Logo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                    Light Version (for dark backgrounds)
                                </label>
                                <div className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-[var(--radius-default)] p-8 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer bg-[var(--color-base)]">
                                    <Upload className="h-10 w-10 mx-auto mb-3 text-[var(--color-text-muted)]" />
                                    <p className="text-sm text-[var(--color-text-muted)]">
                                        Drag & drop or click to upload
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                        PNG, SVG up to 2MB
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                    Dark Version (for light backgrounds)
                                </label>
                                <div className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-[var(--radius-default)] p-8 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer bg-[var(--color-text-light)]/10">
                                    <Upload className="h-10 w-10 mx-auto mb-3 text-[var(--color-text-muted)]" />
                                    <p className="text-sm text-[var(--color-text-muted)]">
                                        Drag & drop or click to upload
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                        PNG, SVG up to 2MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Colors */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-[var(--color-secondary)]" />
                            Brand Colors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                    Primary Color
                                </label>
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-[var(--radius-default)] bg-blue-600 border border-white/20 shrink-0" />
                                    <Input type="text" placeholder="#0066CC" defaultValue="#0066CC" />
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                    Used for headings and primary accents
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                    Secondary Color
                                </label>
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-[var(--radius-default)] bg-orange-500 border border-white/20 shrink-0" />
                                    <Input type="text" placeholder="#FF6600" defaultValue="#FF6600" />
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                    Used for highlights and secondary accents
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Typography */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Type className="h-5 w-5 text-[var(--color-success)]" />
                            Typography
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                    Heading Font
                                </label>
                                <select className="flex h-11 w-full rounded-[var(--radius-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                                    <option>Montserrat</option>
                                    <option>Roboto</option>
                                    <option>Open Sans</option>
                                    <option>Lato</option>
                                    <option>Poppins</option>
                                    <option>Raleway</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                    Body Font
                                </label>
                                <select className="flex h-11 w-full rounded-[var(--radius-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                                    <option>Roboto</option>
                                    <option>Open Sans</option>
                                    <option>Lato</option>
                                    <option>Noto Sans</option>
                                    <option>Source Sans Pro</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-[var(--color-base)] rounded-[var(--radius-default)] p-6">
                            <div className="max-w-xs mx-auto aspect-[9/16] bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg overflow-hidden relative">
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-lg mb-4" />
                                    <p className="text-white text-lg font-bold mb-2">
                                        &quot;Peace is a choice we make daily&quot;
                                    </p>
                                    <p className="text-white/60 text-sm">
                                        Grace Community Church
                                    </p>
                                </div>
                            </div>
                            <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
                                This is how your clips will look with your branding applied
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button>
                        <Check className="h-4 w-4 mr-2" />
                        Save Brand Kit
                    </Button>
                </div>
            </div>
        </div>
    );
}
