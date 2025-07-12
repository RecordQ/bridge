// hooks/useSiteData.tsx
"use client";

import { createContext, useContext, type ReactNode, useState, Dispatch, SetStateAction } from 'react';
import type { SiteData, Translations } from '@/lib/types';
import { defaultTranslations } from '@/lib/config';

interface SiteDataContextType {
    siteData: SiteData | null;
    setSiteData: Dispatch<SetStateAction<SiteData | null>>;
    t: (key: keyof Translations, fallback?: string) => string;
}

const SiteDataContext = createContext<SiteDataContextType | null>(null);

export const SiteDataProvider = ({ children }: { children: ReactNode }) => {
    const [siteData, setSiteData] = useState<SiteData | null>(null);
    
    const t = (key: keyof Translations, fallback?: string): string => {
        return siteData?.translations?.[key] || fallback || defaultTranslations[key] || key;
    };
    
    const value = {
        siteData,
        setSiteData,
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
