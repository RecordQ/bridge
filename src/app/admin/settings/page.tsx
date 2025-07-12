// src/app/admin/settings/page.tsx
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageManager } from "@/components/admin/settings/LanguageManager";
import { TranslationManager } from "@/components/admin/settings/TranslationManager";
import { ThemeManager } from "@/components/admin/settings/ThemeManager";
import { type Language } from "@/lib/types";

async function getLanguages(): Promise<Language[]> {
    try {
        const snapshot = await getDocs(collection(db, 'languages'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Language));
    } catch (error) {
        console.error("Error fetching languages:", error);
        return [];
    }
}

async function getTranslations(langCode: string): Promise<Record<string, string>> {
     try {
        const docRef = doc(db, 'translations', langCode);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : {};
    } catch (error) {
        console.error(`Error fetching translations for ${langCode}:`, error);
        return {};
    }
}

async function getThemeData() {
    try {
        const docRef = doc(db, 'theme', 'config');
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : {};
    } catch (error) {
        console.error("Error fetching theme:", error);
        return {};
    }
}


export default async function SettingsPage() {
    const languages = await getLanguages();
    const translations: Record<string, Record<string, string>> = {};
    for (const lang of languages) {
        translations[lang.id] = await getTranslations(lang.id);
    }
    const themeData = await getThemeData();

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <Button asChild variant="outline" size="sm" className="mb-4">
                        <Link href="/admin"><ArrowLeft className="mr-2" />Back to Dashboard</Link>
                    </Button>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">Site Settings</h1>
                    <p className="text-muted-foreground">Manage your site's content, languages, and appearance.</p>
                </div>

                <Tabs defaultValue="content">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="theme">Theme & Appearance</TabsTrigger>
                    </TabsList>
                    <TabsContent value="content">
                        <div className="grid gap-8 mt-6">
                            <LanguageManager initialLanguages={languages} />
                            <TranslationManager initialLanguages={languages} initialTranslations={translations} />
                        </div>
                    </TabsContent>
                    <TabsContent value="theme">
                         <div className="grid gap-8 mt-6">
                            <ThemeManager initialThemeData={themeData} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
