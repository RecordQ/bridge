// lib/getSiteData.ts
import { db } from './firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { defaultTranslations, defaultTheme } from './config';
import type { Language, Translations, Theme, SiteData } from './types';
import { unstable_cache } from 'next/cache';

// This function can be cached as it doesn't access dynamic data
const fetchLanguages = unstable_cache(
    async (): Promise<Language[]> => {
        try {
            const snapshot = await getDocs(collection(db, 'languages'));
            if (snapshot.empty) {
                return [{ id: 'en', name: 'English', default: true }];
            }
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Language));
        } catch (error) {
            console.error("Error fetching languages, returning default:", error);
            return [{ id: 'en', name: 'English', default: true }];
        }
    },
    ['languages'],
    { revalidate: 60, tags: ['site-data'] }
);

// This function can be cached as it doesn't access dynamic data
const fetchTranslations = unstable_cache(
    async (langCode: string): Promise<Translations> => {
        try {
            const docRef = doc(db, 'translations', langCode);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() as Translations : defaultTranslations;
        } catch (error) {
            console.error(`Error fetching translations for ${langCode}, returning defaults:`, error);
            return defaultTranslations;
        }
    },
    ['translations'],
    { revalidate: 60, tags: ['site-data'] }
);

// This function can be cached as it doesn't access dynamic data
const fetchTheme = unstable_cache(
    async (): Promise<Theme> => {
        try {
            const docRef = doc(db, 'theme', 'config');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const dbTheme = docSnap.data();
                return {
                    colors: { ...defaultTheme.colors, ...dbTheme.colors },
                    threeScene: { ...defaultTheme.threeScene, ...dbTheme.threeScene }
                }
            }
            return defaultTheme;
        } catch (error) {
            console.error("Error fetching theme, returning default:", error);
            return defaultTheme;
        }
    },
    ['theme'],
    { revalidate: 60, tags: ['site-data'] }
);


export async function getSiteData(langCookieValue?: string): Promise<SiteData> {
    const languages = await fetchLanguages();
    const theme = await fetchTheme();
    
    let currentLangCode = langCookieValue;
    let currentLanguage = languages.find(l => l.id === currentLangCode);
    
    if (!currentLanguage) {
        currentLanguage = languages.find(l => l.default) || languages[0];
        currentLangCode = currentLanguage.id;
    }

    const translations = await fetchTranslations(currentLangCode);

    const fullTranslations = { ...defaultTranslations, ...translations };

    return {
        languages,
        currentLanguage,
        translations: fullTranslations,
        theme,
    };
}
