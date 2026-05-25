import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DeviceProps {
    children: ReactNode;
    className?: string;
    screenClassName?: string;
}

export function MacBookMockup({ children, className, screenClassName }: DeviceProps) {
    return (
        <div className={cn("relative mx-auto w-full max-w-full min-w-0", className)}>
            <div className="rounded-[1.25rem] border border-white/15 bg-[#0F0A18] p-2 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
                <div className="rounded-[0.95rem] border border-white/10 bg-black p-2">
                    <div className={cn("aspect-[16/10] min-w-0 overflow-hidden rounded-[0.7rem] bg-[#301A4B]", screenClassName)}>
                        {children}
                    </div>
                </div>
            </div>
            <div className="mx-auto h-4 w-[92%] rounded-b-[2rem] bg-[linear-gradient(180deg,#B7B8C8,#5B6072)] shadow-[0_20px_50px_rgba(0,0,0,0.22)]" />
            <div className="absolute left-1/2 top-[calc(100%-1rem)] h-1.5 w-28 -translate-x-1/2 rounded-full bg-black/20" />
        </div>
    );
}

export function BrowserMockup({ children, className, screenClassName }: DeviceProps) {
    return (
        <div className={cn("max-w-full min-w-0 overflow-hidden rounded-2xl border border-white/12 bg-[#130C20] shadow-2xl", className)}>
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <div className="ml-3 flex-1 rounded-md bg-black/20 px-3 py-1 text-[10px] text-white/45">
                    app.revelationshub.com
                </div>
            </div>
            <div className={cn("aspect-[16/10] min-w-0 overflow-hidden", screenClassName)}>{children}</div>
        </div>
    );
}

export function IPhoneMockup({ children, className, screenClassName }: DeviceProps) {
    return (
        <div className={cn("relative mx-auto w-full max-w-[230px]", className)}>
            <div className="rounded-[2.35rem] border border-white/15 bg-[#0B0712] p-2.5 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
                <div className={cn("relative aspect-[9/19] overflow-hidden rounded-[1.8rem] bg-black", screenClassName)}>
                    <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
                    <div className="absolute inset-x-5 top-3 z-20 flex items-center justify-between text-[9px] font-medium text-white/75">
                        <span>9:41</span>
                        <span>5G</span>
                    </div>
                    <div className="h-full pt-7">{children}</div>
                    <div className="absolute bottom-2 left-1/2 z-20 h-1 w-24 -translate-x-1/2 rounded-full bg-white/35" />
                </div>
            </div>
        </div>
    );
}
