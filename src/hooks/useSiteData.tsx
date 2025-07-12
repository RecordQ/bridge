// hooks/useSiteData.tsx
"use client";

import { createContext, useContext, type ReactNode, useState, useEffect } from 'react';
import type { SiteData, Translations } from '@/lib/types';
import { defaultTranslations, defaultTheme } from '@/lib/config';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

interface SiteDataContextType {
    siteData: SiteData | null;
    isLoading: boolean;
    t: (key: keyof Translations, fallback?: string) => string;
}

const SiteDataContext = createContext<SiteDataContextType | null>(null);

export const SiteDataProvider = ({ children }: { children: ReactNode }) => {
    const [siteData, setSiteData] = useState<SiteData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSiteData = async () => {
            setIsLoading(true);
            try {
                // Fetch Languages
                const langSnapshot = await getDocs(collection(db, 'languages'));
                const languages = langSnapshot.empty
                    ? [{ id: 'en', name: 'English', default: true }]
                    : langSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

                // Determine language from localStorage or default
                const storedLang = localStorage.getItem('NEXT_LOCALE');
                let currentLanguage = languages.find(l => l.id === storedLang) || languages.find(l => l.default) || languages[0];

                // Fetch Translations for current language
                const transDoc = await getDoc(doc(db, 'translations', currentLanguage.id));
                const translations = transDoc.exists() ? transDoc.data() : defaultTranslations;

                // Fetch Theme
                const themeDoc = await getDoc(doc(db, 'theme', 'config'));
                let theme = defaultTheme;
                if (themeDoc.exists()) {
                    const dbTheme = themeDoc.data();
                    theme = {
                        colors: { ...defaultTheme.colors, ...dbTheme.colors },
                        threeScene: { ...defaultTheme.threeScene, ...dbTheme.threeScene }
                    };
                }

                setSiteData({
                    languages,
                    currentLanguage,
                    translations: { ...defaultTranslations, ...translations },
                    theme,
                });
            } catch (error) {
                console.error("Failed to fetch site data:", error);
                // Fallback to default data
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
    }, []);

    const t = (key: keyof Translations, fallback?: string): string => {
        return siteData?.translations?.[key] || fallback || defaultTranslations[key] || key;
    };
    
    // Update document lang attribute when language changes
    useEffect(() => {
      if (siteData?.currentLanguage?.id) {
        document.documentElement.lang = siteData.currentLanguage.id;
      }
    }, [siteData?.currentLanguage]);


    const value = {
        siteData,
        isLoading,
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
