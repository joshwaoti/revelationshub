"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
    value?: string
    onValueChange?: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({})

export interface RadioGroupProps
    extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    onValueChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ className, value, onValueChange, ...props }, ref) => {
        return (
            <RadioGroupContext.Provider value={{ value, onValueChange }}>
                <div
                    ref={ref}
                    role="radiogroup"
                    className={cn("grid gap-2", className)}
                    {...props}
                />
            </RadioGroupContext.Provider>
        )
    }
)
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
    ({ className, value, ...props }, ref) => {
        const context = React.useContext(RadioGroupContext)
        const isChecked = context.value === value

        return (
            <input
                ref={ref}
                type="radio"
                value={value}
                checked={isChecked}
                onChange={() => context.onValueChange?.(value)}
                className={cn(
                    "h-4 w-4 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            />
        )
    }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
