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
  onColorChange: (key: string, value: string) => void;
}

export function ElementInspector({ element, onChange, onColorChange }: ElementInspectorProps) {
  const { t } = useSiteData();
  const { key, label, type, value, style } = element;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full"
            rows={3}
          />
        );
      case 'text':
      case 'button':
        return (
          <Input
            value={value}
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
        <Label className="capitalize text-xs text-muted-foreground">{styleProp.replace(/([A-Z])/g, ' $1')}</Label>
        <div className="flex items-center gap-2">
          <Input 
            value={t(styleKey) || '#ffffff'}
            onChange={(e) => onColorChange(styleKey, e.target.value)}
            placeholder="#ffffff"
          />
          <input
            type="color"
            value={t(styleKey) || '#ffffff'}
            onChange={(e) => onColorChange(styleKey, e.target.value)}
            className="h-10 w-12 rounded-md border-input border"
          />
        </div>
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-4 w-full p-2">
      <div className="flex flex-col gap-2 flex-grow">
        <Label className="text-sm font-semibold">{label}</Label>
        {renderField()}
      </div>
      {style && <div className="flex flex-col gap-4 mt-4 p-4 border-t">{renderStyles()}</div>}
    </div>
  );
}
