// src/app/layout.tsx
"use client";

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { SiteDataProvider } from '@/hooks/useSiteData';
import { type ReactNode, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { PageContent } from '@/components/layout/PageContent';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';


function App({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {children}
      {isAuthenticated && !isAdminRoute && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2" /> Edit Site
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

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
        <AuthProvider>
          <SiteDataProvider>
            <App>
              <PageContent isPreview={isPreview}>
                  {children}
              </PageContent>
            </App>
            <Toaster />
          </SiteDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
