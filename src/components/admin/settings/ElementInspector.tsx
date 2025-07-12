// src/components/admin/settings/ElementInspector.tsx
"use client";

import type { EditableElement } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSiteData } from '@/hooks/useSiteData';

interface ElementInspectorProps {
  element: EditableElement;
  onChange: (key: string, value: string) => void;
}

export function ElementInspector({ element, onChange }: ElementInspectorProps) {
  const { t } = useSiteData();
  const { key, label, type, value, style } = element;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            value={t(value)}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full"
            rows={3}
          />
        );
      case 'text':
      case 'button':
        return (
          <Input
            value={t(value)}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full"
          />
        );
      default:
        return <p>Unknown element type</p>;
    }
  };

  const renderStyles = () => {
    if (!style) return null;

    return Object.entries(style).map(([styleProp, styleKey]) => (
      <div key={styleKey} className="flex flex-col gap-2">
        <Label className="capitalize">{styleProp.replace(/([A-Z])/g, ' $1')}</Label>
        <div className="flex items-center gap-2">
          <Input 
            value={t(styleKey)}
            onChange={(e) => onChange(styleKey, e.target.value)}
            placeholder="#ffffff"
          />
          <input
            type="color"
            value={t(styleKey) || '#000000'}
            onChange={(e) => onChange(styleKey, e.target.value)}
            className="h-10 w-12 rounded-md border-input border"
          />
        </div>
      </div>
    ));
  };

  return (
    <div className="flex items-center gap-4 w-full max-w-lg">
      <div className="flex flex-col gap-2 flex-grow">
        <Label>{label}</Label>
        {renderField()}
      </div>
      {style && <div className="flex-grow">{renderStyles()}</div>}
    </div>
  );
}
