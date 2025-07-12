// src/app/admin/layout.tsx
"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { SiteDataProvider, useSiteData } from "@/hooks/useSiteData";
import { type SiteData, type Language } from "@/lib/types";
import { defaultTheme, defaultTranslations } from "@/lib/config";
import { db } from "@/lib/firebase";
import { getDoc, getDocs, collection, doc } from "firebase/firestore";

function AdminApp({ children }: { children: ReactNode }) {
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

        const transDoc = await getDoc(doc(db, 'translations', currentLanguage.id));
        const translations = transDoc.exists() ? transDoc.data() : defaultTranslations;

        const themeDoc = await getDoc(doc(db, 'theme', 'config'));
        let theme = themeDoc.exists() ? themeDoc.data() : defaultTheme;

        const finalTheme = {
          colors: { ...defaultTheme.colors, ...theme.colors },
          threeScene: { ...defaultTheme.threeScene, ...theme.threeScene }
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
        console.error("Failed to fetch site data for admin:", error);
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

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const showContent = (isAuthenticated && pathname !== '/admin/login') || pathname === '/admin/login';

  return (
    <>
      {showContent ? children : (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      )}
    </>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        <SiteDataProvider>
          <AuthProvider>
            <AdminApp>{children}</AdminApp>
            <Toaster />
          </AuthProvider>
        </SiteDataProvider>
      </body>
    </html>
  );
}
