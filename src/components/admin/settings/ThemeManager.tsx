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
import { toast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { defaultTheme } from "@/lib/config";
import { hexToHslString, hslToHex } from "@/lib/color-utils";
import { useSiteData } from "@/hooks/useSiteData";


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
        <Button type="submit" disabled={pending} className="w-full">
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
                                const parts = typeof value === 'string' ? value.match(/\d+/g)?.map(Number) : [0,0,0];
                                const [h, s, l] = parts?.length === 3 ? parts : [0,0,0];
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
    const { siteData } = useSiteData();

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

    const watchedValues = form.watch();
    useEffect(() => {
        const previewData = {
            type: 'PREVIEW_UPDATE',
            payload: {
                translations: siteData?.translations, // Pass current translations
                theme: watchedValues
            }
        };
        // Post message to the iframe
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(previewData, '*');
        }

    }, [watchedValues, siteData?.translations]);

    return (
        <Form {...form}>
            <form action={formAction}>
                 <Card>
                    <CardHeader>
                        <CardTitle>Color Palette</CardTitle>
                        <CardDescription>Define the HSL color variables for your site's theme.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {Object.keys(defaultTheme.colors).map((key) => (
                           <ColorInput 
                                key={key}
                                control={form.control} 
                                name={`colors.${key}`} 
                                label={key.replace(/-/g, ' ').replace(/^./, str => str.toUpperCase())}
                           />
                       ))}
                    </CardContent>
                </Card>
                <Card className="mt-6">
                     <CardHeader>
                        <CardTitle>3D Scene</CardTitle>
                        <CardDescription>Customize the animated 3D background.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <CardFooter className="mt-6">
                    <SubmitButton />
                </CardFooter>
            </form>
        </Form>
    );
}
