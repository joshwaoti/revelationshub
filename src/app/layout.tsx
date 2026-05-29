import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/lib/convex";
import { PostHogProvider } from "@/lib/posthog";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://revelationshub.com"),
  title: {
    default: "RevelationsHub — Turn Every Sermon Into a Week of Ministry Content",
    template: "%s | RevelationsHub",
  },
  description: "Transform sermons into accurate clips, modern captions, discussion guides, devotionals, quote graphics, carousels, blogs, and podcast assets. Built for churches.",
  keywords: ["sermon clips", "church video editor", "ministry content", "sermon repurposing", "church social media", "caption generator", "sermon AI", "church content creation"],
  icons: {
    icon: "/revelationshub-mark.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://revelationshub.com",
    siteName: "RevelationsHub",
    title: "RevelationsHub — Turn Every Sermon Into a Week of Ministry Content",
    description: "Transform sermons into clips, captions, guides, and social content.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RevelationsHub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevelationsHub — Sermon Content for Modern Ministry",
    description: "One sermon becomes clips, captions, guides, and social content.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://revelationshub.com" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6db1bf",
          colorBackground: "#301a4b",
          colorInputBackground: "#231238",
          colorInputText: "#ffeaec",
          colorText: "#ffeaec",
          colorTextSecondary: "#548a94",
          borderRadius: "16px",
        },
        elements: {
          formButtonPrimary: "bg-[#6db1bf] hover:bg-[#5a9aa8] text-[#231238]",
          card: "bg-[#231238] border border-[#6db1bf]/20",
          headerTitle: "text-[#ffeaec]",
          headerSubtitle: "text-[#548a94]",
          socialButtonsBlockButton: "border-[#6db1bf]/20 text-[#ffeaec]",
          formFieldInput: "bg-[#301a4b] border-[#6db1bf]/20 text-[#ffeaec] placeholder:text-[#548a94]",
          formFieldLabel: "text-[#ffeaec]",
          footerActionLink: "text-[#6db1bf]",
          identityPreviewText: "text-[#ffeaec]",
          identityPreviewEditButton: "text-[#6db1bf]",
          formFieldInputShowPasswordButton: "text-[#548a94]",
          otpCodeFieldInput: "text-[#ffeaec] bg-[#301a4b] border-[#6db1bf]/20",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap" rel="stylesheet" />
        </head>
        <body
          className="antialiased"
        >
          <ConvexClientProvider>
            <PostHogProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster richColors position="bottom-right" />
              </ThemeProvider>
            </PostHogProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
