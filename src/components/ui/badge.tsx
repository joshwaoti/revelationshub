import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-[var(--color-primary)] text-[var(--color-base)]",
                secondary: "bg-[var(--color-secondary)] text-[var(--color-base)]",
                success: "bg-[var(--color-success)] text-white",
                destructive: "bg-red-500 text-white",
                processing: "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30",
                outline: "border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent",
                ai: "bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-[var(--color-base)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
