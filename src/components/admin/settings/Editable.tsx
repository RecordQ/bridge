// src/components/admin/settings/Editable.tsx
"use client";

import { useSiteData } from '@/hooks/useSiteData';
import { cn } from '@/lib/utils';
import type { Translations } from '@/lib/types';
import { cloneElement, type ReactElement } from 'react';

// ========= EDITABLE TEXT =========

type EditableTextProps = {
  translationKey: keyof Translations;
  fieldType: 'text' | 'textarea';
  noEditModeUI?: boolean; // Used for text inside other editable components like buttons
};

export function EditableText({ translationKey, noEditModeUI = false }: EditableTextProps) {
  const { t, isEditMode } = useSiteData();
  const textValue = t(translationKey);

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({
        type: 'ELEMENT_SELECTED',
        payload: {
          key: translationKey,
          label: `Text: ${translationKey}`,
          value: textValue,
          type: 'text'
        }
      }, '*');
    }
  };

  if (isEditMode && !noEditModeUI) {
    return (
      <span
        onClick={handleClick}
        className={cn(
          "relative cursor-pointer transition-all rounded-md",
          "hover:bg-primary/20 hover:outline-dashed hover:outline-2 hover:outline-primary p-1 -m-1"
        )}
      >
        {textValue}
      </span>
    );
  }

  return <>{textValue}</>;
}

// ========= EDITABLE WRAPPER =========

type EditableWrapperProps = {
  children: ReactElement;
  translationKey: keyof Translations;
  fieldType: 'button'; // Can be expanded later
  styleKeys?: Record<string, string>; // e.g., { backgroundColor: 'my_button_bg_color_key' }
};

export function EditableWrapper({ children, translationKey, fieldType, styleKeys }: EditableWrapperProps) {
  const { t, isEditMode } = useSiteData();

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();

      const style: Record<string, string> = {};
      if (styleKeys) {
        for(const [styleProp, transKey] of Object.entries(styleKeys)) {
            style[styleProp] = t(transKey);
        }
      }

      window.parent.postMessage({
        type: 'ELEMENT_SELECTED',
        payload: {
          key: translationKey,
          label: `${fieldType}: ${translationKey}`,
          value: t(translationKey),
          type: fieldType,
          style: styleKeys, // Pass the keys so inspector knows what to edit
        }
      }, '*');
    }
  };

  let finalStyle = {};
  if (styleKeys) {
    const styleOverrides: Record<string, string> = {};
     for(const [styleProp, transKey] of Object.entries(styleKeys)) {
        const value = t(transKey);
        // Only apply if a value is actually set to avoid overriding with empty strings
        if (value && value !== transKey) {
            styleOverrides[styleProp] = value;
        }
    }
    finalStyle = { ...children.props.style, ...styleOverrides };
  }


  const clonedChild = cloneElement(children, {
    ...children.props,
    style: finalStyle,
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
