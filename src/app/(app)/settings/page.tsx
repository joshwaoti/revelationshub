"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    User,
    Bell,
    CreditCard,
    Shield,
    Globe,
    HelpCircle,
    LogOut,
} from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-light)] mb-2">
                    Settings
                </h1>
                <p className="text-[var(--color-text-muted)]">
                    Manage your account and preferences
                </p>
            </div>

            <div className="grid gap-6">
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
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                                PM
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                            First Name
                                        </label>
                                        <Input type="text" defaultValue="Pastor" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                            Last Name
                                        </label>
                                        <Input type="text" defaultValue="Michael" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Email
                                    </label>
                                    <Input type="email" defaultValue="pastor@gracechurch.org" />
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
                                <p className="font-medium text-[var(--color-text-light)]">Silver Plan</p>
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    $67/month • Next billing: Jan 15, 2025
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">Manage Subscription</Button>
                                <Button variant="ghost" size="sm">View Invoices</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-[var(--color-secondary)]" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium text-[var(--color-text-light)]">Password</p>
                                    <p className="text-sm text-[var(--color-text-muted)]">Last changed 3 months ago</p>
                                </div>
                                <Button variant="outline" size="sm">Change Password</Button>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium text-[var(--color-text-light)]">Two-Factor Authentication</p>
                                    <p className="text-sm text-[var(--color-text-muted)]">Add an extra layer of security</p>
                                </div>
                                <Button variant="outline" size="sm">Enable</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Help & Danger Zone */}
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
                            <Button variant="destructive" size="sm">Log Out</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
