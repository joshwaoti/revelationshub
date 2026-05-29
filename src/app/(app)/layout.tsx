import { GlobalSidebar } from "@/components/app/GlobalSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[var(--color-base)]">
            <GlobalSidebar />
            <main className="pb-16 sm:ml-16 sm:pb-0">{children}</main>
        </div>
    );
}
