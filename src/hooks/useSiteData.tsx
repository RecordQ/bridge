// hooks/useSiteData.tsx
"use client";

import { createContext, useContext, type ReactNode, useState, Dispatch, SetStateAction, useEffect, useCallback } from 'react';
import type { SiteData, Translations, Language } from '@/lib/types';
import { defaultTranslations, defaultTheme } from '@/lib/config';
import { db } from "@/lib/firebase";
import { getDoc, getDocs, collection, doc } from "firebase/firestore";

interface SiteDataContextType {
    siteData: SiteData | null;
    setSiteData: Dispatch<SetStateAction<SiteData | null>>;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    isEditMode: boolean;
    setIsEditMode: Dispatch<SetStateAction<boolean>>;
    t: (key: keyof Translations, fallback?: string) => string;
}

const SiteDataContext = createContext<SiteDataContextType | null>(null);

export const SiteDataProvider = ({ children }: { children: ReactNode }) => {
    const [siteData, setSiteData] = useState<SiteData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const fetchSiteData = useCallback(async (currentWindow: Window) => {
        setIsLoading(true);
        try {
          const isPreview = new URLSearchParams(currentWindow.location.search).get('preview') === 'true';

          const langSnapshot = await getDocs(collection(db, 'languages'));
          const languages = langSnapshot.empty
            ? [{ id: 'en', name: 'English', default: true }]
            : langSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Language));
  
          let currentLanguage: Language;
          if (isPreview) {
            const langParam = new URLSearchParams(currentWindow.location.search).get('lang')
            currentLanguage = languages.find(l => l.id === langParam) || languages.find(l => l.default) || languages[0];
          } else {
            const storedLang = currentWindow.localStorage.getItem('NEXT_LOCALE');
            currentLanguage = languages.find(l => l.id === storedLang) || languages.find(l => l.default) || languages[0];
          }
  
          const transDocRef = doc(db, 'translations', currentLanguage.id);
          const transDoc = await getDoc(transDocRef);
          
          let translations: Translations;
          if (!transDoc.exists()) {
              console.warn(`No translations found for '${currentLanguage.id}', using defaults.`);
              translations = defaultTranslations;
          } else {
              translations = { ...defaultTranslations, ...transDoc.data() };
          }
  
          const themeDoc = await getDoc(doc(db, 'theme', 'config'));
          let theme = themeDoc.exists() ? themeDoc.data() : defaultTheme;
  
          const finalTheme = {
            colors: { ...defaultTheme.colors, ...theme.colors },
            threeScene: { ...defaultTheme.threeScene, ...theme.threeScene }
          };
  
          const data: SiteData = {
            languages,
            currentLanguage,
            translations,
            theme: finalTheme,
          };
  
          setSiteData(data);
          
        } catch (error) {
          console.error("Failed to fetch site data:", error);
          setSiteData({
              languages: [{ id: 'en', name: 'English', default: true }],
              currentLanguage: { id: 'en', name: 'English', default: true },
              translations: defaultTranslations,
              theme: defaultTheme,
          });
        } finally {
            const isPreview = new URLSearchParams(currentWindow.location.search).get('preview') === 'true';
            if (!isPreview) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchSiteData(window);
        }
    }, [fetchSiteData]);

    const t = (key: keyof Translations, fallback?: string): string => {
        return siteData?.translations?.[key] || fallback || defaultTranslations[key] || key;
    };
    
    const value = {
        siteData,
        setSiteData,
        isLoading,
        setIsLoading,
        isEditMode,
        setIsEditMode,
        t,
    };

    return (
        <SiteDataContext.Provider value={value}>
            {children}
        </SiteDataContext.Provider>
    );
};

export const useSiteData = () => {
    const context = useContext(SiteDataContext);
    if (!context) {
        throw new Error('useSiteData must be used within a SiteDataProvider');
    }
    return context;
};
