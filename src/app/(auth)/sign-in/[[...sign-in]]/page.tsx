import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { LogoLockup } from "@/components/brand/RevelationsLogo";

export default function SignInPage() {
    return (
        <main className="min-h-screen bg-[var(--color-base)] flex items-center justify-center p-6">
            {/* Background decorations */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-secondary)]/5 blur-3xl" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <LogoLockup markClassName="h-10 w-10" textClassName="text-2xl" />
                </Link>

                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "bg-[var(--color-surface)] border border-[var(--color-primary)]/20 shadow-xl",
                        }
                    }}
                    afterSignInUrl="/library"
                    signUpUrl="/sign-up"
                />
            </div>
        </main>
    );
}
