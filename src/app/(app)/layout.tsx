import { GlobalSidebar } from "@/components/app/GlobalSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[var(--color-base)]">
            <GlobalSidebar />
            <main className="ml-16">{children}</main>
        </div>
    );
}
