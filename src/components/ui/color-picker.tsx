"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
    const [inputValue, setInputValue] = useState(value);
    const colorInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleColorBoxClick = () => {
        colorInputRef.current?.click();
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setInputValue(newColor);
        onChange(newColor);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Validate hex color
        if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
            onChange(newValue);
        }
    };

    const handleInputBlur = () => {
        // If input is invalid, revert to current value
        if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
            setInputValue(value);
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                    {label}
                </label>
            )}
            <div className="flex gap-2">
                <div
                    className="w-11 h-11 rounded border border-white/20 cursor-pointer hover:ring-2 hover:ring-[var(--color-primary)] transition-all flex-shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: value }}
                    onClick={handleColorBoxClick}
                >
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={value}
                        onChange={handleColorChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="#000000"
                    className="flex-1 uppercase"
                />
            </div>
        </div>
    );
}
