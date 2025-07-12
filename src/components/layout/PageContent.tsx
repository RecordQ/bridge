// src/components/layout/PageContent.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { useSiteData } from "@/hooks/useSiteData";
import { LoaderCircle } from "lucide-react";

export function PageContent({ children, isPreview }: { children: ReactNode, isPreview: boolean }) {
  const { siteData, isLoading, setIsEditMode } = useSiteData();

  useEffect(() => {
    if (isPreview) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'SITE_DATA_UPDATE') {
          // This part might be redundant if the provider handles it, but good for safety
        }
        if (event.data.type === 'TOGGLE_EDIT_MODE') {
          setIsEditMode(event.data.payload.isEditMode);
        }
      };
      window.addEventListener('message', handleMessage);
      // Let the parent know the iframe is ready
      window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [isPreview, setIsEditMode]);

  useEffect(() => {
    if (siteData) {
       Object.entries(siteData.theme.colors).forEach(([key, value]) => {
         document.body.style.setProperty(`--${key}`, `hsl(${value})`);
       });
       // This is for live updates from the editor
       Object.entries(siteData.translations).forEach(([key, value]) => {
         if (key.includes('_bg') || key.includes('_color')) {
           const cssVarName = `--${key.replace(/_/g, '-')}`;
           document.body.style.setProperty(cssVarName, value);
         }
       });
    }
  }, [siteData]);


  if (isLoading || !siteData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
