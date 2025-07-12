// src/app/layout.tsx
"use client";

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { SiteDataProvider, useSiteData } from '@/hooks/useSiteData';
import { useState, useEffect, type ReactNode } from 'react';
import type { SiteData, Language } from '@/lib/types';
import { defaultTheme, defaultTranslations } from '@/lib/config';
import { db } from '@/lib/firebase';
import { getDoc, getDocs, collection, doc } from 'firebase/firestore';
import { LoaderCircle } from 'lucide-react';

function AppContent({ children }: { children: ReactNode }) {
  const { setSiteData } = useSiteData();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const langSnapshot = await getDocs(collection(db, 'languages'));
        const languages = langSnapshot.empty
          ? [{ id: 'en', name: 'English', default: true }]
          : langSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Language));

        const storedLang = localStorage.getItem('NEXT_LOCALE');
        let currentLanguage = languages.find(l => l.id === storedLang) || languages.find(l => l.default) || languages[0];
        if (currentLanguage?.id) {
          document.documentElement.lang = currentLanguage.id;
        }

        const transDoc = await getDoc(doc(db, 'translations', currentLanguage.id));
        const translations = transDoc.exists() ? transDoc.data() : defaultTranslations;

        const themeDoc = await getDoc(doc(db, 'theme', 'config'));
        let themeFromDb = themeDoc.exists() ? themeDoc.data() : defaultTheme;

        const userThemeOverridesStr = localStorage.getItem('user-theme-override');
        const userThemeOverrides = userThemeOverridesStr ? JSON.parse(userThemeOverridesStr) : {};
        
        const finalTheme = {
          colors: { ...defaultTheme.colors, ...themeFromDb.colors, ...userThemeOverrides },
          threeScene: { ...defaultTheme.threeScene, ...themeFromDb.threeScene }
        };

        const data: SiteData = {
          languages,
          currentLanguage,
          translations: { ...defaultTranslations, ...translations },
          theme: finalTheme,
        };
        
        Object.entries(data.theme.colors).forEach(([key, value]) => {
            document.body.style.setProperty(`--${key}`, value);
        });

        setSiteData(data);
      } catch (error) {
        console.error("Failed to fetch site data:", error);
         Object.entries(defaultTheme.colors).forEach(([key, value]) => {
            document.body.style.setProperty(`--${key}`, value);
        });
        setSiteData({
            languages: [{ id: 'en', name: 'English', default: true }],
            currentLanguage: { id: 'en', name: 'English', default: true },
            translations: defaultTranslations,
            theme: defaultTheme,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteData();
  }, [setSiteData]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
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
