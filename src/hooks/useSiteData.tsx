// hooks/useSiteData.tsx
"use client";

import { createContext, useContext, type ReactNode } from 'react';
import type { SiteData, Translations } from '@/lib/types';
import { defaultTranslations } from '@/lib/config';

const SiteDataContext = createContext<SiteData | null>(null);

export const SiteDataProvider = ({ children, value }: { children: ReactNode, value: SiteData }) => {
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

    // Translation helper function
    const t = (key: keyof Translations, fallback?: string): string => {
        return context.translations[key] || fallback || defaultTranslations[key] || key;
    };

    return { ...context, t };
};
