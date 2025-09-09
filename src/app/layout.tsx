
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { TopNav } from "@/components/layout/TopNav";
import "./globals.css";
import { CampaignProvider } from "@/hooks/use-campaign";

export const metadata: Metadata = {
  title: "Crimson Chronicle",
  description: "A D&D campaign manager with a slasher horror theme.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <CampaignProvider>
          <TopNav />
          <main className="pt-24 md:pt-32">
            {children}
            <Toaster />
          </main>
        </CampaignProvider>
      </body>
    </html>
  );
}
