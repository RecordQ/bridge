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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import type { Language } from "@/lib/types";
import { defaultTranslations } from "@/lib/config";

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
        <Button type="submit" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" /> : "Save Translations"}
        </Button>
    );
}

export function TranslationManager({ initialLanguages, initialTranslations }: {
    initialLanguages: Language[],
    initialTranslations: Record<string, Record<string, string>>
}) {
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
            <CardDescription>Edit the text content for each language. The "key" is a unique identifier used in the code.</CardDescription>
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
                        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto p-2">
                             {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem>
                                        <FormLabel>Key</FormLabel>
                                        <FormControl>
                                            <Input {...form.register(`translations.${index}.key`)} readOnly disabled className="bg-muted/50" />
                                        </FormControl>
                                    </FormItem>
                                    <FormField
                                        control={form.control}
                                        name={`translations.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Translation</FormLabel>
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