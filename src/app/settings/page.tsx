// src/app/settings/page.tsx
"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSiteData } from '@/hooks/useSiteData';
import { hexToHslString, hslToHex } from '@/lib/color-utils';
import { PageLayout } from '@/components/layout/PageLayout';
import { toast } from '@/hooks/use-toast';
import { defaultTheme } from '@/lib/config';

const hslColor = z.string().regex(/^\d{1,3} \d{1,3}% \d{1,3}%$/, "Must be in HSL format: 'H S% L%'");

const userThemeSchema = z.object({
  background: hslColor,
  primary: hslColor,
  accent: hslColor,
});

type UserThemeFormValues = z.infer<typeof userThemeSchema>;

const USER_THEME_KEY = 'user-theme-override';

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


export default function SettingsPage() {
  const { siteData } = useSiteData();
  const [isClient, setIsClient] = useState(false);
  
  const initialFormValues = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        background: defaultTheme.colors.background,
        primary: defaultTheme.colors.primary,
        accent: defaultTheme.colors.accent,
      };
    }
    const storedOverrides = localStorage.getItem(USER_THEME_KEY);
    const overrides = storedOverrides ? JSON.parse(storedOverrides) : {};
    return {
      background: overrides.background || siteData?.theme.colors.background || defaultTheme.colors.background,
      primary: overrides.primary || siteData?.theme.colors.primary || defaultTheme.colors.accent,
      accent: overrides.accent || siteData?.theme.colors.accent || defaultTheme.colors.accent,
    };
  }, [siteData]);


  const form = useForm<UserThemeFormValues>({
    resolver: zodResolver(userThemeSchema),
    defaultValues: initialFormValues
  });
  
  // Set flag when component mounts on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset form when siteData or localStorage changes
  useEffect(() => {
    if (isClient) {
      form.reset(initialFormValues);
    }
  }, [isClient, initialFormValues, form]);


  const onSubmit = (data: UserThemeFormValues) => {
    localStorage.setItem(USER_THEME_KEY, JSON.stringify(data));
    toast({
        title: "Theme Saved!",
        description: "Your new theme has been applied. It will be remembered for your next visit."
    })
    // Force a reload of SiteDataProvider to apply new styles
    window.location.reload();
  };

  const onReset = () => {
    localStorage.removeItem(USER_THEME_KEY);
    toast({
        title: "Theme Reset",
        description: "Your theme has been reset to the site default."
    })
    window.location.reload();
  };

  return (
    <PageLayout>
      <main className="flex-1 bg-transparent">
        <section className="relative py-24 md:py-32">
          <div className="container mx-auto text-center relative z-10 px-4">
            <h1 className="font-headline text-4xl md:text-6xl font-bold text-white">Appearance Settings</h1>
            <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
              Customize the look and feel of the site to your liking. Your preferences will be saved in your browser.
            </p>
          </div>
        </section>

        <section className="pb-16 md:pb-24">
            <div className="container mx-auto px-4">
                <Card className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm border-border/20">
                    <CardHeader>
                        <CardTitle>Customize Your Theme</CardTitle>
                        <CardDescription>
                            Change the main colors of the user interface. Changes are saved locally and will override the default site theme.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ColorInput control={form.control} name="background" label="Background Color" />
                                    <ColorInput control={form.control} name="primary" label="Primary Color" />
                                    <ColorInput control={form.control} name="accent" label="Accent Color" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                     <Button type="submit">Save My Theme</Button>
                                     <Button type="button" variant="ghost" onClick={onReset}>Reset to Default</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </section>
      </main>
    </PageLayout>
  );
}
