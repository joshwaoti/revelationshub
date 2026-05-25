import { cn } from "@/lib/utils";

interface LogoMarkProps {
    className?: string;
    title?: string;
}

export function LogoMark({ className, title = "RevelationsHub" }: LogoMarkProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            aria-label={title}
            role="img"
            className={cn("h-10 w-10", className)}
        >
            <defs>
                <linearGradient id="revelationshub-mark" x1="7" y1="42" x2="41" y2="6" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6DB1BF" />
                    <stop offset="0.62" stopColor="#F39A9D" />
                    <stop offset="1" stopColor="#ffeaec" />
                </linearGradient>
                <linearGradient id="revelationshub-beam" x1="15" y1="12" x2="34" y2="37" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffeaec" stopOpacity="0.95" />
                    <stop offset="1" stopColor="#6DB1BF" stopOpacity="0.2" />
                </linearGradient>
            </defs>
            <rect x="3" y="3" width="42" height="42" rx="13" fill="#1A1029" />
            <path
                d="M12 36V20.8C12 13.2 17.5 8 24 8s12 5.2 12 12.8V36H12Z"
                fill="url(#revelationshub-mark)"
            />
            <path
                d="M16 34V21.5C16 16.1 19.6 12.4 24 12.4s8 3.7 8 9.1V34H16Z"
                fill="#1A1029"
                opacity="0.88"
            />
            <path d="M20 15.5 34 34H20V15.5Z" fill="url(#revelationshub-beam)" opacity="0.9" />
            <path d="M22.3 19.2v11.2l8.4-5.6-8.4-5.6Z" fill="#ffeaec" />
            <path d="M12 36h24" stroke="#ffeaec" strokeOpacity="0.75" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
    );
}

interface LogoLockupProps {
    className?: string;
    markClassName?: string;
    textClassName?: string;
}

export function LogoLockup({ className, markClassName, textClassName }: LogoLockupProps) {
    return (
        <span className={cn("inline-flex items-center gap-2.5", className)}>
            <LogoMark className={markClassName} />
            <span className={cn("font-display font-bold text-[var(--color-text-light)]", textClassName)}>
                RevelationsHub
            </span>
        </span>
    );
}
