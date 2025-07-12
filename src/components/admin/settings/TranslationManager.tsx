// src/components/admin/settings/TranslationManager.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveTranslationsAction, type TranslationActionState } from "@/lib/actions";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import type { Language } from "@/lib/types";
import { defaultTranslations } from "@/lib/config";
import { useSiteData } from "@/hooks/useSiteData";

const translationSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const translationsSchema = z.object({
  translations: z.array(translationSchema),
});

type TranslationsFormValues = z.infer<typeof translationsSchema>;

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <LoaderCircle className="animate-spin" /> : "Save Translations"}
        </Button>
    );
}

export function TranslationManager({ initialLanguages, initialTranslations }: {
    initialLanguages: Language[],
    initialTranslations: Record<string, Record<string, string>>
}) {
  const { siteData } = useSiteData();
  const [activeLang, setActiveLang] = useState(initialLanguages.find(l => l.default)?.id || initialLanguages[0]?.id || 'en');
  
  const getInitialDataForLang = (langCode: string) => {
    return Object.entries(defaultTranslations).map(([key, defaultValue]) => ({
      key,
      value: initialTranslations[langCode]?.[key] || defaultValue,
    }));
  };

  const form = useForm<TranslationsFormValues>({
    resolver: zodResolver(translationsSchema),
    defaultValues: { translations: getInitialDataForLang(activeLang) },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "translations",
  });

  const [state, formAction] = useActionState<TranslationActionState, FormData>(saveTranslationsAction, {
    status: "idle",
    message: "",
  });

  useEffect(() => {
    form.reset({ translations: getInitialDataForLang(activeLang) });
  }, [activeLang, initialTranslations]);


  useEffect(() => {
    if (state.status === "success") {
        toast({ title: "Success!", description: state.message });
        state.status = 'idle';
    } else if (state.status === "error") {
        toast({ title: "Error", description: state.message, variant: "destructive" });
        state.status = 'idle';
    }
  }, [state]);

  const watchedValues = form.watch('translations');
  useEffect(() => {
    const newTranslations = Object.fromEntries(watchedValues.map(t => [t.key, t.value]));
    const previewData = {
        type: 'PREVIEW_UPDATE',
        payload: {
            translations: { ...siteData?.translations, ...newTranslations },
            theme: siteData?.theme
        }
    };
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(previewData, '*');
    }
  }, [watchedValues, siteData?.theme, siteData?.translations]);


  if (initialLanguages.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Content Translations</CardTitle>
                <CardDescription>Please add at least one language to start managing translations.</CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Content Translations</CardTitle>
            <CardDescription>Edit the text for each language.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs value={activeLang} onValueChange={setActiveLang}>
                <TabsList>
                    {initialLanguages.map(lang => (
                        <TabsTrigger key={lang.id} value={lang.id}>
                            {lang.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <Form {...form}>
                    <form action={formAction}>
                        <input type="hidden" name="langCode" value={activeLang} />
                        <div className="mt-4 space-y-4 max-h-[40vh] overflow-y-auto p-1">
                             {fields.map((field, index) => (
                                <div key={field.id}>
                                    <FormField
                                        control={form.control}
                                        name={`translations.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">{form.getValues(`translations.${index}.key`).replace(/_/g, ' ')}</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={2} />
                                                </FormControl>
                                                 <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                        <CardFooter className="mt-6 p-0">
                            <SubmitButton />
                        </CardFooter>
                    </form>
                </Form>
            </Tabs>
        </CardContent>
    </Card>
  );
}
