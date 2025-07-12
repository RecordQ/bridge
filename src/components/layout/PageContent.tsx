// src/components/layout/PageContent.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { useSiteData } from "@/hooks/useSiteData";
import { LoaderCircle } from "lucide-react";
import type { SiteData } from "@/lib/types";

function applyTheme(data: SiteData) {
    if (!data?.theme?.colors) return;
    const { colors } = data.theme;
    Object.entries(colors).forEach(([key, value]) => {
         document.body.style.setProperty(`--${key}`, `${value}`);
    });
    // This is for live updates of button/text colors from the editor
    Object.entries(data.translations).forEach(([key, value]) => {
        if (key.includes('_bg') || key.includes('_color')) {
            const cssVarName = `--${key.replace(/_/g, '-')}`;
            document.body.style.setProperty(cssVarName, value);
        }
    });
}

export function PageContent({ children, isPreview }: { children: ReactNode, isPreview: boolean }) {
  const { siteData, setSiteData, isLoading, setIsLoading, setIsEditMode } = useSiteData();

  useEffect(() => {
    if (isPreview) {
      const handleMessage = (event: MessageEvent) => {
        const { type, payload } = event.data;
        if (type === 'SITE_DATA_UPDATE') {
          setSiteData(payload);
          applyTheme(payload);
          if(isLoading) setIsLoading(false);
        }
        if (type === 'TOGGLE_EDIT_MODE') {
          setIsEditMode(payload.isEditMode);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Let the parent know the iframe is ready and can receive data
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
      }

      return () => window.removeEventListener('message', handleMessage);
    }
  }, [isPreview, setSiteData, setIsLoading, isLoading, setIsEditMode]);


  useEffect(() => {
    if (siteData && !isPreview) {
        applyTheme(siteData);
    }
  }, [siteData, isPreview]);


  if (isLoading || !siteData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
