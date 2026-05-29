"use client";

import { useState, useCallback } from "react";
import { useOrganization, useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    User,
    Bell,
    CreditCard,
    Globe,
    HelpCircle,
    LogOut,
    Palette,
    Building2,
    Loader2,
    Upload,
    Type,
    Check,
    X,
    Edit3,
} from "lucide-react";

export default function SettingsPage() {
    const { organization } = useOrganization();
    const { user } = useUser();

    // Get organization and brand kit from Convex
    const convexOrg = useQuery(
        api.organizations.getByClerkId,
        organization?.id ? { clerkOrgId: organization.id } : "skip"
    );

    const brandKit = useQuery(
        api.brandKits.getByOrg,
        convexOrg?._id ? { organizationId: convexOrg._id } : "skip"
    );

    const subscription = useQuery(
        api.subscriptions.getByOrg,
        convexOrg?._id ? { organizationId: convexOrg._id } : "skip"
    );

    // Mutations
    const updateBrandKit = useMutation(api.brandKits.upsert);

    // Local state for editing
    const [isEditingBrandKit, setIsEditingBrandKit] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [primaryColor, setPrimaryColor] = useState("");
    const [secondaryColor, setSecondaryColor] = useState("");
    const [fontFamily, setFontFamily] = useState("");
    const [bodyFont, setBodyFont] = useState("");
    const [logoLightUrl, setLogoLightUrl] = useState("");
    const [logoDarkUrl, setLogoDarkUrl] = useState("");

    // Initialize edit state from brand kit
    const startEditingBrandKit = () => {
        setPrimaryColor(brandKit?.primaryColor || "#0066CC");
        setSecondaryColor(brandKit?.secondaryColor || "#FF6600");
        setFontFamily(brandKit?.fontFamily || "Montserrat");
        setBodyFont("Roboto"); // Default body font
        setLogoLightUrl(brandKit?.logoLightUrl || "");
        setLogoDarkUrl(brandKit?.logoDarkUrl || "");
        setIsEditingBrandKit(true);
    };

    const saveBrandKit = async () => {
        if (!convexOrg?._id) return;

        setIsSaving(true);
        try {
            await updateBrandKit({
                organizationId: convexOrg._id,
                name: brandKit?.name || "Default",
                primaryColor,
                secondaryColor,
                fontFamily,
                logoLightUrl: logoLightUrl || undefined,
                logoDarkUrl: logoDarkUrl || undefined,
            });
            setIsEditingBrandKit(false);
        } catch (error) {
            console.error("Error saving brand kit:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle logo upload
    const handleLogoUpload = useCallback((type: "light" | "dark") => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/png,image/svg+xml";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("File too large. Maximum size is 2MB.");
                return;
            }

            // Create a data URL (in production, upload to Convex storage)
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

    // Get plan display name
    const getPlanDisplayName = (plan?: string) => {
        const planNames: Record<string, string> = {
            free: "Free Plan",
            plus: "Plus Plan",
            silver: "Silver Plan",
            gold: "Gold Plan",
            platinum: "Platinum Plan",
        };
        return planNames[plan || "free"] || "Free Plan";
    };

    // Get plan price
    const getPlanPrice = (plan?: string) => {
        const prices: Record<string, string> = {
            free: "Free",
            plus: "$27/month",
            silver: "$67/month",
            gold: "$97/month",
            platinum: "$197/month",
        };
        return prices[plan || "free"] || "Free";
    };

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-light)] mb-2">
                    Settings
                </h1>
                <p className="text-[var(--color-text-muted)]">
                    Manage your account, organization, and brand settings
                </p>
            </div>

            <div className="grid gap-6">
                {/* Organization */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-[var(--color-secondary)]" />
                            Organization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {organization?.imageUrl ? (
                                <img
                                    src={organization.imageUrl}
                                    alt={organization.name || ""}
                                    className="h-20 w-20 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                                    {(organization?.name || "O")[0]}
                                </div>
                            )}
                            <div className="flex-1 space-y-2">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                        Organization Name
                                    </label>
                                    <p className="text-lg font-medium text-[var(--color-text-light)]">
                                        {organization?.name || convexOrg?.name || "Loading..."}
                                    </p>
                                </div>
                                {organization?.slug && (
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                            Slug
                                        </label>
                                        <p className="text-[var(--color-text-light)]">
                                            {organization.slug}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Brand Kit - Full Featured */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-[var(--color-primary)]" />
                                    Brand Kit
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Customize how your content looks with your church&apos;s branding
                                </CardDescription>
                            </div>
                            {!isEditingBrandKit && (
                                <Button variant="outline" size="sm" onClick={startEditingBrandKit}>
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isEditingBrandKit ? (
                            <div className="space-y-6">
                                {/* Logo Upload Section */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] mb-3">
                                        <Upload className="h-4 w-4" />
                                        Church Logos
                                    </label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-2">
                                                Light Version (for dark backgrounds)
                                            </label>
                                            <div
                                                className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-[var(--radius-default)] p-6 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer bg-[var(--color-base)] relative overflow-hidden"
                                                onClick={() => handleLogoUpload("light")}
                                            >
                                                {logoLightUrl ? (
                                                    <div className="relative">
                                                        <img src={logoLightUrl} alt="Light logo" className="h-16 w-auto mx-auto object-contain" />
                                                        <button
                                                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                                                            onClick={(e) => { e.stopPropagation(); setLogoLightUrl(""); }}
                                                        >
                                                            <X className="h-3 w-3 text-white" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                                                        <p className="text-sm text-[var(--color-text-muted)]">
                                                            Drag & drop or click to upload
                                                        </p>
                                                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                                            PNG, SVG up to 2MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-2">
                                                Dark Version (for light backgrounds)
                                            </label>
                                            <div
                                                className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-[var(--radius-default)] p-6 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer bg-white/10 relative overflow-hidden"
                                                onClick={() => handleLogoUpload("dark")}
                                            >
                                                {logoDarkUrl ? (
                                                    <div className="relative">
                                                        <img src={logoDarkUrl} alt="Dark logo" className="h-16 w-auto mx-auto object-contain" />
                                                        <button
                                                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                                                            onClick={(e) => { e.stopPropagation(); setLogoDarkUrl(""); }}
                                                        >
                                                            <X className="h-3 w-3 text-white" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                                                        <p className="text-sm text-[var(--color-text-muted)]">
                                                            Drag & drop or click to upload
                                                        </p>
                                                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                                            PNG, SVG up to 2MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Colors Section */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] mb-3">
                                        <Palette className="h-4 w-4" />
                                        Brand Colors
                                    </label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <ColorPicker
                                                value={primaryColor}
                                                onChange={setPrimaryColor}
                                                label="Primary Color"
                                            />
                                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                                Used for headings and primary accents
                                            </p>
                                        </div>
                                        <div>
                                            <ColorPicker
                                                value={secondaryColor}
                                                onChange={setSecondaryColor}
                                                label="Secondary Color"
                                            />
                                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                                Used for highlights and secondary accents
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Typography Section */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] mb-3">
                                        <Type className="h-4 w-4" />
                                        Typography
                                    </label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-2">
                                                Heading Font
                                            </label>
                                            <select
                                                className="flex h-11 w-full rounded-[var(--radius-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                                value={fontFamily}
                                                onChange={(e) => setFontFamily(e.target.value)}
                                            >
                                                <option value="Montserrat">Montserrat</option>
                                                <option value="Roboto">Roboto</option>
                                                <option value="Open Sans">Open Sans</option>
                                                <option value="Lato">Lato</option>
                                                <option value="Poppins">Poppins</option>
                                                <option value="Raleway">Raleway</option>
                                                <option value="Inter">Inter</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-2">
                                                Body Font
                                            </label>
                                            <select
                                                className="flex h-11 w-full rounded-[var(--radius-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                                value={bodyFont}
                                                onChange={(e) => setBodyFont(e.target.value)}
                                            >
                                                <option value="Roboto">Roboto</option>
                                                <option value="Open Sans">Open Sans</option>
                                                <option value="Lato">Lato</option>
                                                <option value="Noto Sans">Noto Sans</option>
                                                <option value="Source Sans Pro">Source Sans Pro</option>
                                                <option value="Inter">Inter</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Section */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-3">
                                        Preview
                                    </label>
                                    <div className="bg-[var(--color-base)] rounded-[var(--radius-default)] p-6 border border-[var(--color-primary)]/10">
                                        <div
                                            className="max-w-xs mx-auto aspect-[9/16] rounded-lg overflow-hidden relative"
                                            style={{
                                                background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`
                                            }}
                                        >
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                                {logoLightUrl ? (
                                                    <img src={logoLightUrl} alt="Logo" className="h-12 w-auto mb-4 object-contain" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-white/20 rounded-lg mb-4" />
                                                )}
                                                <p
                                                    className="text-white text-lg font-bold mb-2"
                                                    style={{ fontFamily }}
                                                >
                                                    &quot;Peace is a choice we make daily&quot;
                                                </p>
                                                <p className="text-white/60 text-sm">
                                                    {organization?.name || "Your Church Name"}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
                                            This is how your clips will look with your branding applied
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditingBrandKit(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={saveBrandKit}
                                        disabled={isSaving}
                                        className="flex-1"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Save Brand Kit
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : brandKit ? (
                            <div className="space-y-6">
                                {/* Logos Display */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] mb-3">
                                        <Upload className="h-4 w-4" />
                                        Church Logos
                                    </label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-[var(--color-base)] border border-[var(--color-primary)]/20">
                                            {brandKit.logoLightUrl ? (
                                                <img src={brandKit.logoLightUrl} alt="Light logo" className="h-12 w-auto mx-auto" />
                                            ) : (
                                                <p className="text-center text-sm text-[var(--color-text-muted)]">No light logo uploaded</p>
                                            )}
                                            <p className="text-center text-xs text-[var(--color-text-muted)] mt-2">Light version</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-white/5 border border-[var(--color-primary)]/20">
                                            {brandKit.logoDarkUrl ? (
                                                <img src={brandKit.logoDarkUrl} alt="Dark logo" className="h-12 w-auto mx-auto" />
                                            ) : (
                                                <p className="text-center text-sm text-[var(--color-text-muted)]">No dark logo uploaded</p>
                                            )}
                                            <p className="text-center text-xs text-[var(--color-text-muted)] mt-2">Dark version</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Colors Display */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] mb-3">
                                        <Palette className="h-4 w-4" />
                                        Brand Colors
                                    </label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-2">
                                                Primary Color
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-[var(--radius-default)] border border-white/20"
                                                    style={{ backgroundColor: brandKit.primaryColor }}
                                                />
                                                <span className="text-[var(--color-text-light)] uppercase font-mono">
                                                    {brandKit.primaryColor}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-2">
                                                Secondary Color
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-[var(--radius-default)] border border-white/20"
                                                    style={{ backgroundColor: brandKit.secondaryColor }}
                                                />
                                                <span className="text-[var(--color-text-light)] uppercase font-mono">
                                                    {brandKit.secondaryColor}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Font Display */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] mb-3">
                                        <Type className="h-4 w-4" />
                                        Typography
                                    </label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                                                Heading Font
                                            </label>
                                            <p className="text-lg text-[var(--color-text-light)]" style={{ fontFamily: brandKit.fontFamily }}>
                                                {brandKit.fontFamily}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                                                Body Font
                                            </label>
                                            <p className="text-lg text-[var(--color-text-light)]">
                                                Roboto
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Palette className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-3" />
                                <p className="text-[var(--color-text-muted)] mb-4">
                                    No brand kit configured yet
                                </p>
                                <Button onClick={startEditingBrandKit}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Set Up Brand Kit
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-[var(--color-primary)]" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {user?.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt={user.fullName || ""}
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                                    {(user?.firstName?.[0] || "U")}
                                </div>
                            )}
                            <div className="flex-1 space-y-4 w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                            First Name
                                        </label>
                                        <p className="text-[var(--color-text-light)]">
                                            {user?.firstName || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                            Last Name
                                        </label>
                                        <p className="text-[var(--color-text-light)]">
                                            {user?.lastName || "—"}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                        Email
                                    </label>
                                    <p className="text-[var(--color-text-light)]">
                                        {user?.emailAddresses[0]?.emailAddress || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-[var(--color-secondary)]" />
                            Appearance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--color-text-light)]">Theme</p>
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    Choose your preferred color mode
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                <span className="text-sm text-[var(--color-text-muted)]">
                                    System
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-[var(--color-success)]" />
                            Billing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-[var(--color-text-light)]">
                                    {getPlanDisplayName(subscription?.plan)}
                                </p>
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    {getPlanPrice(subscription?.plan)} • {subscription?.clipCredits !== undefined ? (
                                        <>
                                            {subscription.clipsUsed} / {subscription.clipCredits === 999999 ? "∞" : subscription.clipCredits} clips used
                                        </>
                                    ) : (
                                        "Loading..."
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">Upgrade Plan</Button>
                                <Button variant="ghost" size="sm">View Invoices</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-[var(--color-primary)]" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: "Processing complete", description: "When your clips are ready", defaultChecked: true },
                                { label: "Weekly digest", description: "Summary of your content performance", defaultChecked: true },
                                { label: "Product updates", description: "New features and improvements", defaultChecked: false },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-[var(--color-text-light)]">{item.label}</p>
                                        <p className="text-sm text-[var(--color-text-muted)]">{item.description}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        defaultChecked={item.defaultChecked}
                                        className="h-5 w-5 rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Help & Sign Out */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Card className="flex-1">
                        <CardContent className="p-4 flex items-center gap-4">
                            <HelpCircle className="h-5 w-5 text-[var(--color-primary)]" />
                            <div className="flex-1">
                                <p className="font-medium text-[var(--color-text-light)]">Need help?</p>
                                <p className="text-sm text-[var(--color-text-muted)]">Contact support</p>
                            </div>
                            <Button variant="outline" size="sm">Get Help</Button>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 border-red-500/20">
                        <CardContent className="p-4 flex items-center gap-4">
                            <LogOut className="h-5 w-5 text-red-500" />
                            <div className="flex-1">
                                <p className="font-medium text-[var(--color-text-light)]">Sign Out</p>
                                <p className="text-sm text-[var(--color-text-muted)]">End your session</p>
                            </div>
                            <SignOutButton>
                                <Button variant="destructive" size="sm">Log Out</Button>
                            </SignOutButton>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
