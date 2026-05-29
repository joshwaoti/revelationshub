import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-[var(--radius-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] placeholder:text-[var(--color-text-muted)] border border-[var(--color-primary)]/20 transition-all duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
