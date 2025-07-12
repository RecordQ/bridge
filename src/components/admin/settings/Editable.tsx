// src/components/admin/settings/Editable.tsx
"use client";

import { useSiteData } from '@/hooks/useSiteData';
import { cn } from '@/lib/utils';
import type { Translations } from '@/lib/types';
import { cloneElement, type ReactElement } from 'react';

// ========= UTILS =========
const getStyleOverrides = (styleKeys: Record<string, string>, translations: Translations) => {
    const styleOverrides: Record<string, string> = {};
    for (const [styleProp, transKey] of Object.entries(styleKeys)) {
        const value = translations[transKey];
        if (value) {
            styleOverrides[styleProp] = value;
        }
    }
    return styleOverrides;
}

const handleElementSelection = (e: React.MouseEvent, isEditMode: boolean, translationKey: string, fieldType: string, value: string, styleKeys?: Record<string, string>) => {
    if (isEditMode) {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({
            type: 'ELEMENT_SELECTED',
            payload: {
                key: translationKey,
                label: `${fieldType}: ${translationKey}`,
                value: value,
                type: fieldType,
                style: styleKeys,
            }
        }, '*');
    }
}

// ========= EDITABLE TEXT =========

type EditableTextProps = {
  translationKey: keyof Translations;
  fieldType?: 'text' | 'textarea';
  noEditModeUI?: boolean;
  styleKeys?: Record<string, string>;
};

export function EditableText({ translationKey, fieldType = 'text', noEditModeUI = false, styleKeys }: EditableTextProps) {
  const { t, isEditMode, siteData } = useSiteData();
  const textValue = t(translationKey);

  const styleOverrides = styleKeys && siteData?.translations ? getStyleOverrides(styleKeys, siteData.translations) : {};

  const handleClick = (e: React.MouseEvent) => {
    handleElementSelection(e, isEditMode, translationKey, fieldType, textValue, styleKeys);
  };

  if (isEditMode && !noEditModeUI) {
    return (
      <span
        onClick={handleClick}
        style={styleOverrides}
        className={cn(
          "relative cursor-pointer transition-all rounded-md",
          "hover:bg-primary/20 hover:outline-dashed hover:outline-2 hover:outline-primary p-1 -m-1"
        )}
      >
        {textValue}
      </span>
    );
  }

  return <span style={styleOverrides}>{textValue}</span>;
}


// ========= EDITABLE WRAPPER =========

type EditableWrapperProps = {
  children: ReactElement;
  translationKey: keyof Translations;
  fieldType: 'button'; // Can be expanded later
  styleKeys?: Record<string, string>; // e.g., { backgroundColor: 'my_button_bg_color_key' }
};

export function EditableWrapper({ children, translationKey, fieldType, styleKeys }: EditableWrapperProps) {
  const { t, isEditMode, siteData } = useSiteData();

  const handleClick = (e: React.MouseEvent) => {
    handleElementSelection(e, isEditMode, translationKey, fieldType, t(translationKey), styleKeys);
  };

  const finalStyle = styleKeys && siteData?.translations 
    ? { ...children.props.style, ...getStyleOverrides(styleKeys, siteData.translations) } 
    : children.props.style;

  const clonedChild = cloneElement(children, {
    ...children.props,
    style: finalStyle,
    onClick: isEditMode ? (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    } : children.props.onClick,
  });

  if (isEditMode) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "relative cursor-pointer transition-all rounded-md inline-block",
          "hover:bg-primary/20 hover:outline-dashed hover:outline-2 hover:outline-primary p-1 -m-1"
        )}
      >
        {clonedChild}
      </div>
    );
  }

  return clonedChild;
}
