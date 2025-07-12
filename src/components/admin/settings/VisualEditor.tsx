// src/components/admin/settings/VisualEditor.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet, Pointer, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSiteData } from "@/hooks/useSiteData";
import { saveTranslationsAction } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import type { EditableElement } from "@/lib/types";
import { ElementInspector } from "./ElementInspector";

type Viewport = 'desktop' | 'tablet' | 'mobile';

const viewportClasses: Record<Viewport, string> = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
};

export function VisualEditor() {
    const { siteData, setSiteData } = useSiteData();
    const [viewport, setViewport] = useState<Viewport>('desktop');
    const [isEditMode, setIsEditMode] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
    const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);

    const handleMessage = useCallback((event: MessageEvent) => {
        if (event.data.type === 'ELEMENT_SELECTED') {
            setSelectedElement(event.data.payload);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);
    
    // Send updated siteData to iframe whenever it changes
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow && siteData) {
            iframeRef.current.contentWindow.postMessage({
                type: 'SITE_DATA_UPDATE',
                payload: siteData,
            }, '*');
        }
    }, [siteData]);
    
    // Toggle edit mode in iframe
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'TOGGLE_EDIT_MODE',
                payload: { isEditMode }
            }, '*');
        }
    }, [isEditMode]);

    const handleInspectorChange = (key: string, value: string) => {
        if (!siteData) return;
        setPendingChanges(prev => ({...prev, [key]: value}));

        setSiteData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                translations: {
                    ...prev.translations,
                    [key]: value
                }
            }
        });

        if (selectedElement) {
            if (key === selectedElement.key) {
                setSelectedElement(elem => elem ? ({...elem, value}) : null);
            }
            if (selectedElement.style && key in selectedElement.style) {
                 setSelectedElement(elem => elem ? ({...elem, style: {...elem.style, [key]: value}}) : null);
            }
        }
    }

    const handleSaveChanges = async () => {
        if (Object.keys(pendingChanges).length === 0) {
            toast({ title: "No changes to save", description: "You haven't made any edits yet." });
            return;
        }

        const formData = new FormData();
        formData.append('langCode', siteData?.currentLanguage.id || 'en');
        Object.entries(pendingChanges).forEach(([key, value]) => {
            formData.append(`translations.${key}`, value);
        });

        const result = await saveTranslationsAction({ status: 'idle', message: '' }, formData);
        
        if (result.status === 'success') {
            toast({ title: 'Success!', description: result.message });
            setPendingChanges({});
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    };
    
    if (!siteData) {
        return <p>Loading live editor...</p>
    }

    const hasPendingChanges = Object.keys(pendingChanges).length > 0;

    return (
        <main className="flex-1 flex flex-col">
            <div className="p-2 border-b bg-background flex justify-between items-center gap-2">
                 <div className="flex items-center gap-4">
                     <div className="flex items-center space-x-2">
                        <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} />
                        <Label htmlFor="edit-mode" className="flex items-center gap-2 cursor-pointer">
                            <Pointer className="h-4 w-4" />
                            Edit Mode
                        </Label>
                    </div>
                     <Button 
                        size="sm" 
                        onClick={handleSaveChanges} 
                        disabled={!hasPendingChanges}
                        className={hasPendingChanges ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                    >
                        <Save className="mr-2 h-4 w-4"/>
                        Save Changes
                    </Button>
                </div>

                <div className="flex-grow flex justify-center">
                    {selectedElement && isEditMode ? (
                        <ElementInspector 
                            element={selectedElement}
                            onChange={handleInspectorChange}
                        />
                    ) : (
                        <div className="text-sm text-muted-foreground">{isEditMode ? 'Click an element to edit' : 'Enable Edit Mode to begin'}</div>
                    )}
                </div>

                <div className="flex items-center gap-2">
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
            </div>
            <div className="flex-1 bg-muted flex items-center justify-center p-4">
                 <iframe 
                    ref={iframeRef}
                    src={`/?preview=true&lang=${siteData.currentLanguage.id}`}
                    className={cn("h-full bg-background rounded-lg shadow-xl transition-all duration-300 ease-in-out", viewportClasses[viewport])}
                    title="Live Preview"
                 />
            </div>
        </main>
    )
}
