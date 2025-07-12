// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Chatbot } from '@/components/Chatbot';
import ThreeScene from '@/components/ThreeScene';
import { SiteDataProvider } from '@/hooks/useSiteData';
import { getSiteData } from '@/lib/getSiteData';
import StyleInjector from '@/components/layout/StyleInjector';
import { cookies } from 'next/headers';

// This metadata is now a fallback, it will be replaced by dynamic data.
export const metadata: Metadata = {
  title: 'Bridge Ltd - Customizable Products',
  description: 'High-quality customizable products like USBs, gift boxes, and pens for corporate and personal use.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const langCookie = cookieStore.get('NEXT_LOCALE');
  const siteData = await getSiteData(langCookie?.value);

  return (
    <html lang={siteData.currentLanguage.id} className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <StyleInjector colors={siteData.theme.colors} />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        <SiteDataProvider value={siteData}>
          <ThreeScene />
          <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Chatbot />
          <Toaster />
        </SiteDataProvider>
      </body>
    </html>
  );
}
