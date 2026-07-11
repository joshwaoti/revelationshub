import { cn } from "@/lib/utils";

interface LogoMarkProps {
    className?: string;
    title?: string;
}

export function LogoMark({ className, title = "RevelationsHub" }: LogoMarkProps) {
    // "The signal": a play triangle (the sermon) whose tip radiates three
    // echo arcs (the week of content it becomes). One idea, reads at 16px.
    return (
        <svg
            viewBox="0 0 48 48"
            aria-label={title}
            role="img"
            className={cn("h-10 w-10", className)}
        >
            <rect
                x="3"
                y="3"
                width="42"
                height="42"
                rx="12"
                fill="#301A4B"
                stroke="#FFEAEC"
                strokeOpacity="0.14"
                strokeWidth="1"
            />
            <path
                d="M12.5 15 L27.5 24 L12.5 33 Z"
                fill="#FFEAEC"
                stroke="#FFEAEC"
                strokeWidth="3"
                strokeLinejoin="round"
            />
            <path
                d="M31.23 18.68 A6.5 6.5 0 0 1 31.23 29.32"
                fill="none"
                stroke="#6DB1BF"
                strokeWidth="2.75"
                strokeLinecap="round"
            />
            <path
                d="M33.24 15.81 A10 10 0 0 1 33.24 32.19"
                fill="none"
                stroke="#F39A9D"
                strokeWidth="2.75"
                strokeLinecap="round"
            />
            <path
                d="M35.24 12.94 A13.5 13.5 0 0 1 35.24 35.06"
                fill="none"
                stroke="#6DB1BF"
                strokeOpacity="0.45"
                strokeWidth="2.75"
                strokeLinecap="round"
            />
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
