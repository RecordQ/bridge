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
        if (!key.includes('_') || !value) return;
        
        const styleMappings: { [suffix: string]: string } = {
            '_color': 'color',
            '_bg_color': 'background-color',
            '_font_size': 'font-size',
            '_shape': 'border-radius',
            '_outline_color': 'border-color',
        };

        for (const suffix in styleMappings) {
            if (key.endsWith(suffix)) {
                const cssProp = styleMappings[suffix];
                const selectorKey = key.substring(0, key.length - suffix.length);
                const selector = `[data-editable-key="${selectorKey}"]`;
                
                if (!elementStyles[selector]) {
                    elementStyles[selector] = {};
                }
                
                // For buttons, target the child element for most styles
                const targetSelector = key.includes('button') ? `${selector} [data-editable-child]` : selector;
                if (!elementStyles[targetSelector]) {
                    elementStyles[targetSelector] = {};
                }
                
                elementStyles[targetSelector][cssProp] = value;
                
                // Ensure border is visible if color is set
                if(cssProp === 'border-color') {
                    elementStyles[targetSelector]['border-width'] = '2px';
                    elementStyles[targetSelector]['border-style'] = 'solid';
                }
                break;
            }
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
