// src/components/layout/PageContent.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { useSiteData } from "@/hooks/useSiteData";
import { LoaderCircle } from "lucide-react";
import type { SiteData } from "@/lib/types";

function applyTheme(data: SiteData) {
    if (!data?.theme?.colors) return;
    const { colors } = data.theme;
    
    let styleString = ':root {';
    // Apply global theme colors
    Object.entries(colors).forEach(([key, value]) => {
        styleString += `--${key}: ${value};`;
    });
    
    // Apply dynamic element-specific styles
    Object.entries(data.translations).forEach(([key, value]) => {
        if (key.includes('_bg') || key.includes('_color')) {
            const cssVarName = `--${key.replace(/_/g, '-')}`;
            styleString += `${cssVarName}: ${value};`;
        }
    });

    styleString += '}';
    
    // Create CSS rules for elements using the dynamic styles
    Object.entries(data.translations).forEach(([key, value]) => {
       if (key.includes('_bg') || key.includes('_color')) {
            const cssVarName = `--${key.replace(/_/g, '-')}`;
            const selectorKey = key.replace(/_bg$/, '').replace(/_text$/, '').replace(/_color$/, '');
            
            const selector = `[data-editable-key="${selectorKey}"]`;

            if(key.endsWith("_bg")){
                styleString += `${selector} { background-color: var(${cssVarName}) !important; }`;
            } else if (key.endsWith("_text") || key.endsWith("_color")){
                 styleString += `${selector} { color: var(${cssVarName}) !important; }`;
            }
        }
    });

    // Find or create the style tag
    const styleTagId = 'dynamic-theme-styles';
    let styleTag = document.getElementById(styleTagId);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleTagId;
        document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = styleString;
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
