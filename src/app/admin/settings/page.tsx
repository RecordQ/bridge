// src/app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft, Pointer } from "lucide-react";
import { LanguageManager } from "@/components/admin/settings/LanguageManager";
import { ThemeManager } from "@/components/admin/settings/ThemeManager";
import { type Language, type Theme, type EditableElement, type Translations } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { VisualEditor } from "@/components/admin/settings/VisualEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultTheme } from "@/lib/config";
import { ElementInspector } from "@/components/admin/settings/ElementInspector";
import { useSiteData } from "@/hooks/useSiteData";

export default function SettingsPage() {
    const [initialLanguages, setInitialLanguages] = useState<Language[]>([]);
    const [initialTheme, setInitialTheme] = useState<Theme>(defaultTheme);
    const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
    const [pendingChanges, setPendingChanges] = useState<Partial<Translations>>({});
    const { setSiteData, siteData } = useSiteData();
    
    useEffect(() => {
        async function getSettingsData() {
            try {
                const languagesSnapshot = await getDocs(collection(db, 'languages'));
                const languages = languagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Language));
                setInitialLanguages(languages);

                const themeDoc = await getDoc(doc(db, 'theme', 'config'));
                if (themeDoc.exists()) {
                    setInitialTheme(themeDoc.data() as Theme);
                }

            } catch (error) {
                console.error("Error fetching settings data:", error);
            }
        }
        getSettingsData();
    }, []);

    const handleInspectorChange = (key: string, value: string) => {
        setPendingChanges(prev => ({...prev, [key]: value}));

        setSiteData(prev => {
            if (!prev) return null;
            const newTranslations = { ...prev.translations, [key]: value };
            return { ...prev, translations: newTranslations };
        });

        setSelectedElement(elem => elem ? ({...elem, value}) : null);
    };
    
    const handleColorChange = (key: string, value: string) => {
        setPendingChanges(prev => ({...prev, [key]: value}));

        setSiteData(prev => {
            if (!prev) return null;
            const newTranslations = { ...prev.translations, [key]: value };
            return { ...prev, translations: newTranslations };
        });
    }

    return (
        <div className="flex h-screen bg-muted/40">
            <aside className="w-[450px] flex-shrink-0 bg-background border-r flex flex-col">
                <header className="p-4 border-b">
                    <Button asChild variant="outline" size="sm" className="mb-4">
                        <Link href="/admin"><ArrowLeft className="mr-2" />Back to Dashboard</Link>
                    </Button>
                    <h1 className="font-headline text-2xl font-bold">Site Settings</h1>
                    <p className="text-muted-foreground text-sm">Visually edit content or manage global settings.</p>
                </header>

                <div className="flex-grow overflow-y-auto">
                   <Tabs defaultValue="content" className="flex flex-col h-full">
                        <TabsList className="m-4 grid w-[calc(100%-2rem)] grid-cols-3">
                            <TabsTrigger value="content">Content/Styles</TabsTrigger>
                            <TabsTrigger value="languages">Languages</TabsTrigger>
                            <TabsTrigger value="theme">3D Scene</TabsTrigger>
                        </TabsList>
                        <TabsContent value="content" className="flex-grow p-4 pt-0">
                           {selectedElement ? (
                                <ElementInspector 
                                    element={selectedElement}
                                    onChange={handleInspectorChange}
                                    onColorChange={handleColorChange}
                                />
                           ) : (
                               <div className="p-4 border rounded-lg bg-muted/30 text-center">
                                 <Pointer className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                 <h3 className="font-semibold mb-2">Visual Editor Guide</h3>
                                 <p className="text-sm text-muted-foreground">
                                    Use the panel on the right to visually edit your site. Toggle "Edit Mode" on, then click on any text or button to modify its content and style in this sidebar.
                                 </p>
                               </div>
                           )}
                        </TabsContent>
                        <TabsContent value="languages" className="flex-grow p-4 pt-0">
                            <LanguageManager initialLanguages={initialLanguages} />
                        </TabsContent>
                         <TabsContent value="theme" className="flex-grow p-4 pt-0">
                            <ThemeManager initialTheme={initialTheme} />
                        </TabsContent>
                   </Tabs>
                </div>
            </aside>
            
            <VisualEditor 
                setSelectedElement={setSelectedElement}
                pendingChanges={pendingChanges}
                setPendingChanges={setPendingChanges}
            />

            <Toaster />
        </div>
    );
}
