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
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#ffffff or hsl(0 0% 100%)"
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
);

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

    const hasTypography = style.color || style.fontSize;
    const hasColors = style.backgroundColor;
    const hasBorders = style.borderRadius || style.borderColor;

    return (
        <Accordion type="multiple" defaultValue={['content', 'typography', 'colors', 'borders']} className="w-full">
            <AccordionItem value="content">
                <AccordionTrigger>Content</AccordionTrigger>
                <AccordionContent>
                    {renderContentField()}
                </AccordionContent>
            </AccordionItem>
            
            {hasTypography && (
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
            )}
            
            {hasColors && (
                <AccordionItem value="colors">
                    <AccordionTrigger>Colors</AccordionTrigger>
                    <AccordionContent>
                       {style.backgroundColor && (
                            <ColorPickerInput
                                label="Background Color"
                                value={t(style.backgroundColor)}
                                onChange={(v) => onChange(style.backgroundColor, v)}
                            />
                       )}
                    </AccordionContent>
                </AccordionItem>
            )}

            {hasBorders && (
                 <AccordionItem value="borders">
                    <AccordionTrigger>Borders</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                       {style.borderRadius && (
                            <SizeInput
                                label="Button Shape (Border Radius)"
                                value={t(style.borderRadius)}
                                onChange={(v) => onChange(style.borderRadius, v)}
                                placeholder="e.g., 8px or 9999px for round"
                            />
                       )}
                       {style.borderColor && (
                             <ColorPickerInput
                                label="Outline/Border Color"
                                value={t(style.borderColor)}
                                onChange={(v) => onChange(style.borderColor, v)}
                            />
                       )}
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
        {renderStyles()}
      </div>
    </div>
  );
}
