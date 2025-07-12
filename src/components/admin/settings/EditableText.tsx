// src/components/admin/settings/EditableText.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSiteData } from '@/hooks/useSiteData';
import type { Translations } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

type EditableTextProps = {
  translationKey: keyof Translations;
  multiline?: boolean;
};

export function EditableText({ translationKey, multiline = false }: EditableTextProps) {
  const { t, isEditMode, siteData, setSiteData } = useSiteData();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(t(translationKey));
  
  const textValue = t(translationKey);

  useEffect(() => {
    setLocalValue(textValue);
  }, [textValue]);
  
  if (!isEditMode) {
    return <>{textValue}</>;
  }

  const handleBlur = () => {
    setIsEditing(false);
    // Send update to parent (VisualEditor)
    window.parent.postMessage({
        type: 'EDITABLE_UPDATE',
        payload: { key: translationKey, value: localValue }
    }, '*');

    // Also update local context for instant feedback within iframe
    setSiteData(prev => {
        if (!prev) return null;
        return {
            ...prev,
            translations: {
                ...prev.translations,
                [translationKey]: localValue,
            }
        }
    })
  };
  
  if (isEditing) {
    return multiline ? (
        <Textarea 
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className="w-full text-base bg-white/10"
        />
    ) : (
        <input 
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className="w-full bg-transparent p-0 m-0 border-0 outline-none"
        />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer transition-all rounded-md",
        "hover:bg-primary/20 hover:shadow-inner p-1 -m-1"
      )}
      role="button"
      tabIndex={0}
    >
      {localValue}
    </span>
  );
}
