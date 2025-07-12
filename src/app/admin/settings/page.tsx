// src/app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageManager } from "@/components/admin/settings/LanguageManager";
import { TranslationManager } from "@/components/admin/settings/TranslationManager";
import { ThemeManager } from "@/components/admin/settings/ThemeManager";
import { type Language } from "@/lib/types";
import { useSiteData } from "@/hooks/useSiteData";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

type Viewport = 'desktop' | 'tablet' | 'mobile';

const viewportClasses: Record<Viewport, string> = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
};

export default function SettingsPage() {
    const { siteData, t } = useSiteData();
    const [initialLanguages, setInitialLanguages] = useState<Language[]>([]);
    const [initialTranslations, setInitialTranslations] = useState<Record<string, Record<string, string>>>({});
    const [initialThemeData, setInitialThemeData] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [viewport, setViewport] = useState<Viewport>('desktop');

    useEffect(() => {
        async function getSettingsData() {
            try {
                const languages = (await getDocs(collection(db, 'languages'))).docs.map(doc => ({ id: doc.id, ...doc.data() } as Language));
                setInitialLanguages(languages);

                const translations: Record<string, Record<string, string>> = {};
                for (const lang of languages) {
                    const docSnap = await getDoc(doc(db, 'translations', lang.id));
                    translations[lang.id] = docSnap.exists() ? docSnap.data() : {};
                }
                setInitialTranslations(translations);

                const themeSnap = await getDoc(doc(db, 'theme', 'config'));
                setInitialThemeData(themeSnap.exists() ? themeSnap.data() : {});
            } catch (error) {
                console.error("Error fetching settings data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        getSettingsData();
    }, []);

    // Set up a listener to know when iframe content has loaded
    const [iframeLoaded, setIframeLoaded] = useState(false);
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data === 'iframe-loaded') {
                setIframeLoaded(true);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (isLoading || !siteData) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-muted">
                <p>Loading Settings...</p>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-muted/40">
            <aside className="w-[400px] flex-shrink-0 bg-background border-r flex flex-col">
                <header className="p-4 border-b">
                    <Button asChild variant="outline" size="sm" className="mb-4">
                        <Link href="/admin"><ArrowLeft className="mr-2" />Back to Dashboard</Link>
                    </Button>
                    <h1 className="font-headline text-2xl font-bold">Site Settings</h1>
                    <p className="text-muted-foreground text-sm">Changes here are shown live. Hit save when you're done.</p>
                </header>

                <div className="flex-grow overflow-y-auto">
                    <Tabs defaultValue="content" className="p-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="theme">Theme</TabsTrigger>
                        </TabsList>
                        <TabsContent value="content" className="mt-4">
                            <div className="space-y-6">
                                <LanguageManager initialLanguages={initialLanguages} />
                                <TranslationManager 
                                    initialLanguages={initialLanguages} 
                                    initialTranslations={initialTranslations} 
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="theme" className="mt-4">
                             <div className="space-y-6">
                                <ThemeManager initialThemeData={initialThemeData} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </aside>
            
            <main className="flex-1 flex flex-col">
                <div className="p-2 border-b bg-background flex justify-center items-center gap-2">
                    <Button variant={viewport === 'desktop' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('desktop')}>
                        <Monitor className="h-5 w-5" />
                    </Button>
                    <Button variant={viewport === 'tablet' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('tablet')}>
                        <Tablet className="h-5 w-5" />
                    </Button>
                    <Button variant={viewport === 'mobile' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('mobile')}>
                        <Smartphone className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-1 bg-muted flex items-center justify-center p-4">
                     <iframe 
                        src="/?preview=true" 
                        className={cn("h-full bg-background rounded-lg shadow-xl transition-all duration-300 ease-in-out", viewportClasses[viewport])}
                        title="Live Preview"
                     />
                </div>
            </main>
            <Toaster />
        </div>
    );
}
