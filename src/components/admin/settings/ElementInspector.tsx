// src/components/admin/settings/ElementInspector.tsx
"use client";

import type { EditableElement } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSiteData } from '@/hooks/useSiteData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ElementInspectorProps {
  element: EditableElement;
  onChange: (key: string, value: string) => void;
}

const ColorPickerInput = ({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) => (
    <div className="flex flex-col gap-2">
        <Label className="capitalize text-xs text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-2">
            <Input 
                value={value || '#ffffff'}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#ffffff"
            />
            <input
                type="color"
                value={value || '#ffffff'}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 w-12 rounded-md border-input border"
            />
        </div>
    </div>
);

const SizeInput = ({ label, value, onChange, placeholder = "16px" }: { label: string, value: string, onChange: (value: string) => void, placeholder?: string }) => (
     <div className="flex flex-col gap-2">
        <Label className="capitalize text-xs text-muted-foreground">{label}</Label>
        <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
)

export function ElementInspector({ element, onChange }: ElementInspectorProps) {
  const { t } = useSiteData();
  const { key, label, type, value, style } = element;

  const renderContentField = () => {
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

    return (
        <Accordion type="multiple" defaultValue={['typography', 'colors']} className="w-full">
            <AccordionItem value="typography">
                <AccordionTrigger>Typography</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    {style.color && (
                        <ColorPickerInput
                            label="Text Color"
                            value={t(style.color)}
                            onChange={(v) => onChange(style.color, v)}
                        />
                    )}
                    {style.fontSize && (
                        <SizeInput
                            label="Font Size"
                            value={t(style.fontSize)}
                            onChange={(v) => onChange(style.fontSize, v)}
                            placeholder="e.g., 16px or 1.5rem"
                        />
                    )}
                </AccordionContent>
            </AccordionItem>
            
            {style.backgroundColor && (
                <AccordionItem value="colors">
                    <AccordionTrigger>Colors</AccordionTrigger>
                    <AccordionContent>
                       <ColorPickerInput
                            label="Background Color"
                            value={t(style.backgroundColor)}
                            onChange={(v) => onChange(style.backgroundColor, v)}
                        />
                    </AccordionContent>
                </AccordionItem>
            )}
        </Accordion>
    )
  };

  return (
    <div className="flex flex-col gap-4 w-full p-2">
      <div className="flex flex-col gap-2 flex-grow">
        <Label className="text-sm font-semibold">{label}</Label>
        {renderContentField()}
      </div>
      <div className="flex flex-col gap-4 mt-4 border-t pt-4">{renderStyles()}</div>
    </div>
  );
}
