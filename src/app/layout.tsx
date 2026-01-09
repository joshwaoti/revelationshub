import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/lib/convex";
import { PostHogProvider } from "@/lib/posthog";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RevelationsHub - Your Sunday Message. Monday's Movement.",
  description:
    "Transform your sermons into engaging clips, discussion guides, and social content with intelligent tools designed for ministry.",
  keywords: [
    "sermon clips",
    "church video",
    "ministry tools",
    "video editor",
    "discussion guides",
  ],
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
        <body
          className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased`}
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
