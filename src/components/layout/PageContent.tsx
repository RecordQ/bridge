// src/components/layout/PageContent.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { useSiteData } from "@/hooks/useSiteData";
import { LoaderCircle } from "lucide-react";
import type { SiteData, Translations } from "@/lib/types";

function applyTheme(data: SiteData) {
    if (!data?.theme?.colors) return;
    const styleTagId = 'dynamic-theme-styles';
    let styleTag = document.getElementById(styleTagId);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleTagId;
        document.head.appendChild(styleTag);
    }

    let styleString = ':root {';
    // Apply global theme colors from theme object
    Object.entries(data.theme.colors).forEach(([key, value]) => {
        styleString += `--${key}: ${value};`;
    });
    styleString += '}';

    // Generate CSS rules for individual element styles from translations
    const elementStyles: { [selector: string]: { [prop: string]: string } } = {};

    Object.entries(data.translations).forEach(([key, value]) => {
        const parts = key.split('_');
        const lastPart = parts[parts.length - 1];
        const secondLastPart = parts[parts.length - 2];

        if (parts.length > 2 && (lastPart === 'color' || lastPart === 'bg' || lastPart === 'size' || lastPart === 'text')) {
             let prop = lastPart;
             let selectorKey = parts.slice(0, -1).join('_');
             if (lastPart === 'text' && secondLastPart === 'products') { // button_explore_products_text
                prop = 'color';
                selectorKey = key;
             } else {
                 selectorKey = parts.slice(0, -1).join('_');
             }

            const selector = `[data-editable-key="${selectorKey}"]`;
            
            if (!elementStyles[selector]) {
                elementStyles[selector] = {};
            }

            let cssProp = '';
            if (prop === 'bg') cssProp = 'background-color';
            else if (prop === 'color' || prop === 'text') cssProp = 'color';
            else if (prop === 'size') cssProp = 'font-size';
            
            if (cssProp) {
                 elementStyles[selector][cssProp] = value;
            }
        }
    });

    for (const selector in elementStyles) {
        styleString += `${selector} {`;
        for (const prop in elementStyles[selector]) {
            styleString += `${prop}: ${elementStyles[selector][prop]} !important;`;
        }
        styleString += `}`;
    }

    styleTag.innerHTML = styleString;
}

export function PageContent({ children, isPreview }: { children: ReactNode, isPreview: boolean }) {
  const { siteData, setSiteData, isLoading, setIsLoading, setIsEditMode } = useSiteData();

  useEffect(() => {
    if (isPreview) {
      const handleMessage = (event: MessageEvent) => {
        const { type, payload } = event.data;
        if (type === 'SITE_DATA_UPDATE' && payload) {
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
