import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <main className="min-h-screen bg-[var(--color-base)] flex items-center justify-center p-6">
            {/* Background decorations */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-secondary)]/5 blur-3xl" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]" />
                    <span className="font-display text-2xl font-bold text-[var(--color-text-light)]">
                        RevelationsHub
                    </span>
                </Link>

                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "bg-[var(--color-surface)] border border-[var(--color-primary)]/20 shadow-xl",
                        }
                    }}
                    afterSignUpUrl="/create-organization"
                    signInUrl="/sign-in"
                />
            </div>
        </main>
    );
}
