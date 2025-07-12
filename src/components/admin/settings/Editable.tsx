// src/components/admin/settings/Editable.tsx
"use client";

import { useSiteData } from '@/hooks/useSiteData';
import { cn } from '@/lib/utils';
import type { Translations } from '@/lib/types';
import { cloneElement, type ReactElement } from 'react';

// ========= UTILS =========
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
  const { t, isEditMode } = useSiteData();
  const textValue = t(translationKey);
  
  const handleClick = (e: React.MouseEvent) => {
    handleElementSelection(e, isEditMode, translationKey, fieldType, textValue, styleKeys);
  };

  if (isEditMode && !noEditModeUI) {
    return (
      <span
        onClick={handleClick}
        data-editable-key={translationKey}
        className={cn(
          "relative cursor-pointer transition-all rounded-md",
          "hover:bg-primary/20 hover:outline-dashed hover:outline-2 hover:outline-primary p-1 -m-1"
        )}
      >
        {textValue}
      </span>
    );
  }

  // When rendering inside a button, we don't want a span, we just want the text
  if (noEditModeUI) {
      return textValue;
  }

  return <span data-editable-key={translationKey}>{textValue}</span>;
}


// ========= EDITABLE WRAPPER =========

type EditableWrapperProps = {
  children: ReactElement;
  translationKey: keyof Translations;
  fieldType: 'button';
  styleKeys?: Record<string, string>;
};

export function EditableWrapper({ children, translationKey, fieldType, styleKeys }: EditableWrapperProps) {
  const { t, isEditMode } = useSiteData();
  const textValue = t(translationKey);

  const handleClick = (e: React.MouseEvent) => {
    // This prevents the link from navigating while in edit mode
    e.preventDefault();
    e.stopPropagation();
    handleElementSelection(e, isEditMode, translationKey, fieldType, textValue, styleKeys);
  };
  
  return (
      <div 
        className={cn(
            "relative inline-block", 
            isEditMode && "hover:outline-dashed hover:outline-2 hover:outline-primary rounded-md"
        )}
        data-editable-key={translationKey}
      >
        {isEditMode && (
          <div
            className="absolute inset-0 cursor-pointer z-10"
            onClick={handleClick}
            title={`Edit: ${translationKey}`}
          />
        )}
        {cloneElement(children, { 'data-editable-child': true })}
      </div>
  );
}
