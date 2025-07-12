// src/components/admin/settings/ThemeManager.tsx
"use client"

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveThemeAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { defaultTheme } from "@/lib/config";

const hslColor = z.string().regex(/^\d{1,3} \d{1,3}% \d{1,3}%$/, "Must be in HSL format: 'H S% L%'");

const themeSchema = z.object({
    colors: z.object({
        background: hslColor,
        foreground: hslColor,
        card: hslColor,
        cardForeground: hslColor,
        popover: hslColor,
        popoverForeground: hslColor,
        primary: hslColor,
        primaryForeground: hslColor,
        secondary: hslColor,
        secondaryForeground: hslColor,
        muted: hslColor,
        mutedForeground: hslColor,
        accent: hslColor,
        accentForeground: hslColor,
        destructive: hslColor,
        destructiveForeground: hslColor,
        border: hslColor,
        input: hslColor,
        ring: hslColor,
        'chart-1': hslColor,
        'chart-2': hslColor,
        'chart-3': hslColor,
        'chart-4': hslColor,
        'chart-5': hslColor,
    }),
    threeScene: z.object({
        backgroundColor: z.string().optional(),
        fogColor: z.string().optional(),
        planetColor: z.string(),
        moonColor: z.string(),
        galaxyInsideColor: z.string(),
        galaxyOutsideColor: z.string(),
        nebulaColor1: z.string(),
        nebulaColor2: z.string(),
    })
});

type ThemeFormValues = z.infer<typeof themeSchema>;

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" /> : "Save Theme"}
        </Button>
    )
}

function ColorInput({ control, name, label }: { control: any, name: any, label: string }) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <div className="flex items-center gap-2">
                        <Input {...field} className="font-mono text-xs" />
                        <Controller
                            control={control}
                            name={name}
                            render={({ field: { value, onChange }}) => {
                                // Handle potential invalid HSL string gracefully
                                const parts = typeof value === 'string' ? value.split(' ').map((v: string) => parseInt(v, 10)) : [0,0,0];
                                const [h, s, l] = parts.length === 3 ? parts : [0,0,0];
                                return (
                                    <input
                                        type="color"
                                        className="h-10 w-12 rounded-md border-input border"
                                        value={hslToHex(h,s,l)}
                                        onChange={(e) => onChange(hexToHslString(e.target.value))}
                                    />
                                );
                            }}
                        />
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export function ThemeManager({ initialThemeData }: { initialThemeData: any }) {
    const fullInitialData = {
        ...defaultTheme,
        ...initialThemeData,
        colors: { ...defaultTheme.colors, ...initialThemeData.colors },
        threeScene: { ...defaultTheme.threeScene, ...initialThemeData.threeScene },
    };
    
    const form = useForm<ThemeFormValues>({
        resolver: zodResolver(themeSchema),
        defaultValues: fullInitialData
    });
    
    const [state, formAction] = useActionState(saveThemeAction, { status: 'idle', message: '' });

    useEffect(() => {
        if (state.status === "success") {
            toast({ title: "Success!", description: state.message });
            state.status = 'idle';
        } else if (state.status === "error") {
            toast({ title: "Error", description: state.message, variant: "destructive" });
             state.status = 'idle';
        }
    }, [state]);

    return (
        <Form {...form}>
            <form action={formAction}>
                 <Card>
                    <CardHeader>
                        <CardTitle>Color Palette</CardTitle>
                        <CardDescription>Define the HSL color variables for your site's light and dark themes.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {Object.keys(defaultTheme.colors).map((key) => (
                           <ColorInput 
                                key={key}
                                control={form.control} 
                                name={`colors.${key}`} 
                                label={key.replace(/([A-Z])/g, ' $1').replace(/-/g, ' ').replace(/^./, str => str.toUpperCase())}
                           />
                       ))}
                    </CardContent>
                </Card>
                <Card className="mt-8">
                     <CardHeader>
                        <CardTitle>3D Scene Configuration</CardTitle>
                        <CardDescription>Customize the appearance of the animated 3D background.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.keys(defaultTheme.threeScene).map((key) => (
                             <FormField
                                key={key}
                                control={form.control}
                                name={`threeScene.${key}`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <Input {...field} />
                                            <input
                                                type="color"
                                                className="h-10 w-12 rounded-md border-input border"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </CardContent>
                </Card>
                <CardFooter className="mt-8">
                    <SubmitButton />
                </CardFooter>
            </form>
        </Form>
    );
}

// Color conversion helpers
function hexToHslString(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length == 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}


function hslToHex(h: number, s: number, l: number): string {
  if (isNaN(h) || isNaN(s) || isNaN(l)) return '#000000';
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0,
      b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 180) {
    r = x; g = c; b = 0;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  } else { // Catches cases where h might be out of range, defaulting to black.
      r = 0; g=0; b=0;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (c: number) => c.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
