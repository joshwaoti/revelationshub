import { CreateOrganization } from "@clerk/nextjs";
import Link from "next/link";
import { LogoLockup } from "@/components/brand/RevelationsLogo";

export default function CreateOrganizationPage() {
    return (
        <main className="min-h-screen bg-[var(--color-base)] flex items-center justify-center p-6">
            {/* Background decorations */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-secondary)]/5 blur-3xl" />

            <div className="relative z-10 w-full max-w-lg">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                    <LogoLockup markClassName="h-10 w-10" textClassName="text-2xl" />
                </Link>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--color-text-light)] mb-2">
                        Create Your Church Organization
                    </h1>
                    <p className="text-[var(--color-text-muted)]">
                        Set up your ministry workspace to collaborate with your team
                    </p>
                </div>

                <CreateOrganization
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "bg-[var(--color-surface)] border border-[var(--color-primary)]/20 shadow-xl",
                        }
                    }}
                    afterCreateOrganizationUrl="/onboarding"
                    skipInvitationScreen={true}
                />
            </div>
        </main>
    );
}
