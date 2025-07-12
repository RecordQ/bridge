// src/app/layout.tsx
"use client";

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { SiteDataProvider, useSiteData } from '@/hooks/useSiteData';
import ThreeScene from '@/components/ThreeScene';
import StyleInjector from '@/components/layout/StyleInjector';
import { LoaderCircle } from 'lucide-react';

function AppContent({ children }: { children: React.ReactNode }) {
  const { siteData, isLoading } = useSiteData();

  if (isLoading || !siteData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ThreeScene />
      <StyleInjector colors={siteData.theme.colors} />
      {children}
    </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>Bridge Ltd - Customizable Products</title>
        <meta name="description" content="High-quality customizable products like USBs, gift boxes, and pens for corporate and personal use." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        <SiteDataProvider>
          <AppContent>
            {children}
          </AppContent>
          <Toaster />
        </SiteDataProvider>
      </body>
    </html>
  );
}
