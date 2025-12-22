import { SermonSidebar } from "@/components/app/SermonSidebar";

export default function SermonLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--color-surface)]">
            <SermonSidebar />
            <main className="lg:ml-64 p-4 sm:p-6 pt-14 lg:pt-6">{children}</main>
        </div>
    );
}
