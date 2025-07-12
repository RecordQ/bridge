// hooks/useSiteData.tsx
"use client";

import { createContext, useContext, type ReactNode, useState, useEffect } from 'react';
import type { SiteData, Translations, ColorPalette } from '@/lib/types';
import { defaultTranslations, defaultTheme } from '@/lib/config';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { LoaderCircle } from 'lucide-react';

interface SiteDataContextType {
    siteData: SiteData | null;
    isLoading: boolean;
    t: (key: keyof Translations, fallback?: string) => string;
}

const SiteDataContext = createContext<SiteDataContextType | null>(null);

const USER_THEME_KEY = 'user-theme-override';
const THEME_STYLE_ID = 'dynamic-theme-styles';

function applyTheme(colors: ColorPalette) {
    let styleElement = document.getElementById(THEME_STYLE_ID);
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = THEME_STYLE_ID;
        document.head.appendChild(styleElement);
    }

    const cssText = `
        :root {
            --background: ${colors.background};
            --foreground: ${colors.foreground};
            --card: ${colors.card};
            --card-foreground: ${colors.cardForeground};
            --popover: ${colors.popover};
            --popover-foreground: ${colors.popoverForeground};
            --primary: ${colors.primary};
            --primary-foreground: ${colors.primaryForeground};
            --secondary: ${colors.secondary};
            --secondary-foreground: ${colors.secondaryForeground};
            --muted: ${colors.muted};
            --muted-foreground: ${colors.mutedForeground};
            --accent: ${colors.accent};
            --accent-foreground: ${colors.accentForeground};
            --destructive: ${colors.destructive};
            --destructive-foreground: ${colors.destructiveForeground};
            --border: ${colors.border};
            --input: ${colors.input};
            --ring: ${colors.ring};
            --chart-1: ${colors['chart-1']};
            --chart-2: ${colors['chart-2']};
            --chart-3: ${colors['chart-3']};
            --chart-4: ${colors['chart-4']};
            --chart-5: ${colors['chart-5']};
        }
    `;
    styleElement.textContent = cssText;
}


export const SiteDataProvider = ({ children }: { children: ReactNode }) => {
    const [siteData, setSiteData] = useState<SiteData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSiteData = async () => {
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

                // Fetch Theme from Firestore
                const themeDoc = await getDoc(doc(db, 'theme', 'config'));
                let theme = defaultTheme;
                if (themeDoc.exists()) {
                    const dbTheme = themeDoc.data();
                    theme = {
                        colors: { ...defaultTheme.colors, ...dbTheme.colors },
                        threeScene: { ...defaultTheme.threeScene, ...dbTheme.threeScene }
                    };
                }

                // Check for user theme overrides in localStorage
                const userThemeOverrides = localStorage.getItem(USER_THEME_KEY);
                if (userThemeOverrides) {
                    const parsedOverrides = JSON.parse(userThemeOverrides);
                    theme.colors = { ...theme.colors, ...parsedOverrides };
                }
                
                // Apply the final theme to the document
                applyTheme(theme.colors);

                setSiteData({
                    languages,
                    currentLanguage,
                    translations: { ...defaultTranslations, ...translations },
                    theme,
                });
            } catch (error) {
                console.error("Failed to fetch site data:", error);
                // Fallback to default data and apply default theme
                applyTheme(defaultTheme.colors);
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
    
    if (isLoading) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        )
    }

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
