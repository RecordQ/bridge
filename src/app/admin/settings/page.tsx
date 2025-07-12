// src/app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageManager } from "@/components/admin/settings/LanguageManager";
import { ThemeManager } from "@/components/admin/settings/ThemeManager";
import { type Language } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { VisualEditor } from "@/components/admin/settings/VisualEditor";

export default function SettingsPage() {
    const [initialLanguages, setInitialLanguages] = useState<Language[]>([]);
    
    useEffect(() => {
        async function getSettingsData() {
            try {
                const languagesSnapshot = await getDocs(collection(db, 'languages'));
                const languages = languagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Language));
                setInitialLanguages(languages);
            } catch (error) {
                console.error("Error fetching settings data:", error);
            }
        }
        getSettingsData();
    }, []);

    return (
        <div className="flex h-screen bg-muted/40">
            <aside className="w-[450px] flex-shrink-0 bg-background border-r flex flex-col">
                <header className="p-4 border-b">
                    <Button asChild variant="outline" size="sm" className="mb-4">
                        <Link href="/admin"><ArrowLeft className="mr-2" />Back to Dashboard</Link>
                    </Button>
                    <h1 className="font-headline text-2xl font-bold">Site Settings</h1>
                    <p className="text-muted-foreground text-sm">Visually edit content or manage theme and languages.</p>
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
                            </div>
                        </TabsContent>
                        <TabsContent value="theme" className="mt-4">
                             <div className="space-y-6">
                                <ThemeManager />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </aside>
            
            <VisualEditor />

            <Toaster />
        </div>
    );
}
