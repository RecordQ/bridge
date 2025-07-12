// src/components/admin/settings/Editable.tsx
"use client";

import { useSiteData } from '@/hooks/useSiteData';
import { cn } from '@/lib/utils';
import type { Translations } from '@/lib/types';
import { cloneElement, type ReactElement, type CSSProperties } from 'react';

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
  const { t, isEditMode, siteData } = useSiteData();
  const textValue = t(translationKey);
  
  const dynamicStyles: CSSProperties = {};
  if (styleKeys && siteData?.translations) {
    const colorValue = siteData.translations[styleKeys.color]
    if (colorValue) {
        dynamicStyles.color = colorValue;
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    handleElementSelection(e, isEditMode, translationKey, fieldType, textValue, styleKeys);
  };

  if (isEditMode && !noEditModeUI) {
    return (
      <span
        onClick={handleClick}
        style={dynamicStyles}
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

  return <span style={dynamicStyles} data-editable-key={translationKey}>{textValue}</span>;
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
  const textValue = t(translationKey);

  const handleClick = (e: React.MouseEvent) => {
    handleElementSelection(e, isEditMode, translationKey, fieldType, textValue, styleKeys);
  };

  const dynamicStyles: CSSProperties = {};
  if (styleKeys && siteData?.translations) {
    if (styleKeys.backgroundColor && siteData.translations[styleKeys.backgroundColor]) {
      dynamicStyles.backgroundColor = siteData.translations[styleKeys.backgroundColor];
    }
    if (styleKeys.color && siteData.translations[styleKeys.color]) {
      dynamicStyles.color = siteData.translations[styleKeys.color];
    }
  }

  const finalStyle = { ...children.props.style, ...dynamicStyles };

  const clonedChild = cloneElement(children, {
    ...children.props,
    style: finalStyle,
  });

  if (isEditMode) {
    return (
      <div
        onClick={handleClick}
        data-editable-key={translationKey}
        className={cn(
          "relative cursor-pointer transition-all rounded-md inline-block",
          "hover:bg-primary/20 hover:outline-dashed hover:outline-2 hover:outline-primary p-1 -m-1"
        )}
      >
        {cloneElement(clonedChild, {
            onClick: (e: MouseEvent) => {
                if (isEditMode) {
                    e.preventDefault();
                    e.stopPropagation();
                } else {
                    children.props.onClick?.(e);
                }
            },
            // Prevent the link from working in edit mode
            href: isEditMode ? undefined : children.props.href,
        })}
      </div>
    );
  }

  return clonedChild;
}
