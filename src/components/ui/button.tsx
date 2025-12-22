import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-base)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--color-primary)] text-[var(--color-base)] hover:bg-[var(--color-primary)]/90 hover:-translate-y-0.5 hover:shadow-lg",
                secondary:
                    "bg-[var(--color-secondary)] text-[var(--color-base)] hover:bg-[var(--color-secondary)]/90 hover:-translate-y-0.5 hover:shadow-lg",
                outline:
                    "border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-[var(--color-primary)]/10",
                ghost:
                    "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10",
                link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
                destructive:
                    "bg-red-500 text-white hover:bg-red-600",
            },
            size: {
                default: "h-10 px-5 py-2 rounded-[var(--radius-default)]",
                sm: "h-8 px-4 text-xs rounded-[var(--radius-sm)]",
                lg: "h-12 px-8 text-base rounded-[var(--radius-default)]",
                xl: "h-14 px-10 text-lg rounded-[var(--radius-lg)]",
                icon: "h-10 w-10 rounded-[var(--radius-default)]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
