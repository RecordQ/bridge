// src/components/layout/PageContent.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { useSiteData } from "@/hooks/useSiteData";
import { defaultTheme, defaultTranslations } from "@/lib/config";
import { db } from "@/lib/firebase";
import { getDoc, getDocs, collection, doc } from "firebase/firestore";
import type { SiteData, Language } from "@/lib/types";
import { LoaderCircle, Settings } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

function AdminToolbar() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading || !isAuthenticated) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button asChild size="lg" className="shadow-lg">
                <Link href="/admin/settings">
                    <Settings className="mr-2" /> Edit Site
                </Link>
            </Button>
        </div>
    )
}


export function PageContent({ children, isPreview }: { children: ReactNode, isPreview: boolean }) {
  const { siteData, setSiteData, setIsEditMode } = useSiteData();

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const langSnapshot = await getDocs(collection(db, 'languages'));
        const languages = langSnapshot.empty
          ? [{ id: 'en', name: 'English', default: true }]
          : langSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Language));

        let currentLanguage: Language;
        if (isPreview) {
          const searchParams = new URLSearchParams(window.location.search);
          const langParam = searchParams.get('lang')
          currentLanguage = languages.find(l => l.id === langParam) || languages.find(l => l.default) || languages[0];
        } else {
          const storedLang = localStorage.getItem('NEXT_LOCALE');
          currentLanguage = languages.find(l => l.id === storedLang) || languages.find(l => l.default) || languages[0];
        }

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
      }
    };

    fetchSiteData();

    if (isPreview) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'SITE_DATA_UPDATE') {
          setSiteData(event.data.payload);
        }
        if (event.data.type === 'TOGGLE_EDIT_MODE') {
          setIsEditMode(event.data.payload.isEditMode);
        }
      };
      window.addEventListener('message', handleMessage);
      // Let the parent know the iframe is ready
      window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [isPreview, setSiteData, setIsEditMode]);

  useEffect(() => {
    if (siteData) {
       Object.entries(siteData.theme.colors).forEach(([key, value]) => {
         document.body.style.setProperty(`--${key}`, value);
       });
       // This is for live updates from the editor
       Object.entries(siteData.translations).forEach(([key, value]) => {
         if (key.includes('_bg') || key.includes('_color')) {
           const cssVarName = `--${key.replace(/_/g, '-')}`;
           document.body.style.setProperty(cssVarName, value);
         }
       });
    }
  }, [siteData]);


  if (!siteData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>
    {children}
    {!isPreview && <AdminToolbar />}
  </>;
}
