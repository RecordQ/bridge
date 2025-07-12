// src/components/layout/PageContent.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { useSiteData } from "@/hooks/useSiteData";
import { LoaderCircle } from "lucide-react";
import type { SiteData } from "@/lib/types";

function applyDynamicStyles(data: SiteData) {
    if (!data) return;
    const styleTagId = 'dynamic-styles';
    let styleTag = document.getElementById(styleTagId);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleTagId;
        document.head.appendChild(styleTag);
    }
    
    // Base theme colors
    let cssString = ':root {';
    Object.entries(data.theme.colors).forEach(([key, value]) => {
        // HSL values need to be wrapped
        const isHsl = /^\d+\s+\d+%?\s+\d+%?$/.test(value);
        cssString += `--${key}: ${isHsl ? `hsl(${value})` : value};`;
    });
    cssString += '}';

    // Individual element style overrides
    const elementStyles: { [selector: string]: { [prop: string]: string } } = {};
    Object.entries(data.translations).forEach(([key, value]) => {
        if (!key.includes('_')) return;
        const parts = key.split('_');
        const lastPart = parts.pop();
        const secondLastPart = parts[parts.length - 1];
        
        let cssProp = '';
        let propKey: string | undefined = undefined;

        if (lastPart === 'color' && secondLastPart !== 'bg') {
            cssProp = 'color';
            propKey = key;
        } else if (lastPart === 'bg' || (lastPart === 'color' && secondLastPart === 'bg')) {
            cssProp = 'background-color';
            propKey = key;
        } else if (lastPart === 'size' && secondLastPart === 'font') {
            cssProp = 'font-size';
            propKey = key;
        }

        if (cssProp && propKey && value) {
            const selectorKey = propKey.replace(`_${secondLastPart}_${lastPart}`, '');
            const selector = `[data-editable-key="${selectorKey}"]`;
            if (!elementStyles[selector]) {
                elementStyles[selector] = {};
            }
            elementStyles[selector][cssProp] = value;
        }
    });

    Object.entries(elementStyles).forEach(([selector, styles]) => {
        cssString += `${selector} {`;
        Object.entries(styles).forEach(([prop, value]) => {
            cssString += `${prop}: ${value} !important;`;
        });
        cssString += `}`;
    });

    styleTag.innerHTML = cssString;
}


export function PageContent({ children, isPreview }: { children: ReactNode, isPreview: boolean }) {
  const { siteData, setSiteData, isLoading, setIsLoading, setIsEditMode } = useSiteData();

  useEffect(() => {
    if (isPreview) {
      const handleMessage = (event: MessageEvent) => {
        const { type, payload } = event.data;
        if (type === 'SITE_DATA_UPDATE' && payload) {
          setSiteData(payload);
          applyDynamicStyles(payload);
          if(isLoading) setIsLoading(false);
        }
        if (type === 'TOGGLE_EDIT_MODE') {
          setIsEditMode(payload.isEditMode);
        }
      };

      window.addEventListener('message', handleMessage);
      
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
      }

      return () => window.removeEventListener('message', handleMessage);
    }
  }, [isPreview, setSiteData, setIsLoading, isLoading, setIsEditMode]);


  useEffect(() => {
    if (siteData && !isPreview) {
        applyDynamicStyles(siteData);
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
